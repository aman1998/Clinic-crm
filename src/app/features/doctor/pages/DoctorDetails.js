import React, { useState, createContext, useMemo } from 'react';
import { renderRoutes } from 'react-router-config';
import { makeStyles, Menu, MenuItem, Paper } from '@material-ui/core';
import { useHistory } from 'react-router';
import { useParams } from 'react-router-dom';
import {
	ArrowBack as ArrowBackIcon,
	CloudDownload as CloudDownloadIcon,
	KeyboardArrowDown as KeyboardArrowDownIcon
} from '@material-ui/icons';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import isEqual from 'lodash/isEqual';
import { useSelector } from 'react-redux';
import FuseLoading from '../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../common/ErrorMessage';
import { useAlert, useToolbarTitle } from '../../../hooks';
import { getFullName } from '../../../utils';
import { Button } from '../../../bizKITUi';
import { clinicService, ENTITY, ENTITY_DEPS } from '../../../services';

const useStyles = makeStyles(theme => ({
	navButtons: {
		backgroundColor: '#EFEFEF'
	},
	navButtonsDelete: {
		color: '#7F4C0A'
	},
	navButtonsDeleteIcon: {
		color: '#ED9526'
	}
}));

const initialValues = {
	directive: null,
	doctor: '',
	patient: null,
	clinic_reception: null,
	medications: [],
	laboratory_services: [],
	hospital_services: []
};

export const ContextMenu = createContext(null);

export default function Doctors({ route }) {
	const [menu, setMenu] = useState(null);
	const [listMedications, setListMedications] = useState([]);
	const [listLaboratory, setListLaboratory] = useState([]);
	const [listHospital, setListHospital] = useState([]);
	const [customFields, setCustomFields] = useState(null);
	const [headerStateRef, _setHeaderStateRef] = useState();
	const setHeaderStateRef = node => {
		if (node && !isEqual(node, headerStateRef)) {
			_setHeaderStateRef(node);
		}
	};
	// MENU
	const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
	const open = Boolean(menuAnchorEl);
	const handleOnDocumentButtonClick = event => {
		setMenuAnchorEl(event.currentTarget);
	};
	const handleMenuClose = () => {
		setMenuAnchorEl(null);
	};
	// END OF MENU
	const queryClient = useQueryClient();

	const config = useSelector(({ fuse }) => fuse.settings.current.layout.config);
	const { folded } = config.navbar;

	const classes = useStyles();
	const { alertSuccess, alertError } = useAlert();
	const { receptionUuid } = useParams();
	const history = useHistory();

	const { control, errors, getValues, setError, clearErrors, reset } = useForm({
		mode: 'onBlur',
		defaultValues: initialValues
	});

	const updateSupplement = useMutation(({ payload }) => {
		return clinicService.updateReceptionSupplement(receptionUuid, payload).then(response => {
			ENTITY_DEPS.CLINIC_RECEPTION.forEach(dep => {
				queryClient.invalidateQueries(dep);
			});

			return response;
		});
	});

	const { isError: isErrorInitialReception, data: initialReception } = useQuery(
		[ENTITY.CLINIC_RECEPTION, receptionUuid],
		({ queryKey }) => clinicService.getReceptionById(queryKey[1]).then(({ data }) => data),
		{ enabled: !!receptionUuid }
	);

	const handleOnUpdateSupplement = () => {
		const payload = {
			laboratory_services: listLaboratory,
			hospital_services: listHospital,
			inspection_date_time: null,
			medications: listMedications.map(item => ({
				...item,
				minimum_unit_of_measure: item.minimum_unit_of_measure?.uuid,
				packing: item.packing?.uuid,
				packing_unit: item.packing_unit?.uuid,
				product: item.product?.uuid
			})),
			custom_fields: customFields
			// values.medications.map(item => ({
			// 	...item,
			// 	minimum_unit_of_measure: item.minimum_unit_of_measure?.uuid,
			// 	packing: item.packing?.uuid,
			// 	packing_unit: item.packing_unit?.uuid,
			// 	product: item.product?.uuid
			// }))
		};

		updateSupplement
			.mutateAsync({
				payload
			})
			.then(() => {
				alertSuccess('Услуга успешно сохранён');
				// onUpdate();
			})
			.catch(error => {
				// error.fieldErrors.forEach(item => {
				// 	setError(item.field, { message: item.message });
				// });
				alertError(`Не удалось сохранить услуга: ${error.userMessage}`);
			});
	};

	const {
		isLoading: isClinicDocumentsLoading,
		isError: isClinicDocumentsError,
		data: clinicDocumentsData
	} = useQuery(
		[ENTITY.CLINIC_RECEPTIONS_DOCUMENTS, initialReception?.service.uuid],
		() => clinicService.getClinicServicesDocument(initialReception?.service.uuid).then(({ results }) => results),
		{ enabled: !!initialReception || isErrorInitialReception }
	);

	const downloadClinicDocument = useMutation(({ clinicUuid, documentUuid }) =>
		clinicService.exportClinicDocument(clinicUuid, documentUuid)
	);
	const handleDownloadDocument = (clinicUuid, documentUuid) => {
		downloadClinicDocument
			.mutateAsync({ clinicUuid, documentUuid })
			.catch(() => alertError('Не удалось скачать документ'));
	};

	const { isLoading, isError, data } = useQuery([ENTITY.CLINIC_RECEPTION, receptionUuid], () =>
		clinicService.getReceptionSupplement(receptionUuid).then(res => res.data)
	);

	const { isLoading: isClinicLoading, data: clinicData } = useQuery(
		[ENTITY.CLINIC_RECEPTION, receptionUuid],
		() => clinicService.getReceptionSupplement(receptionUuid).then(res => res.data),
		{ enabled: !!receptionUuid }
	);

	const readOnly = useMemo(() => isClinicLoading || (clinicData && clinicData.completed), [
		isClinicLoading,
		clinicData
	]);

	const isDocumentButtonDisabled =
		isClinicDocumentsLoading || isClinicDocumentsError || !clinicDocumentsData || clinicDocumentsData.length === 0;

	useToolbarTitle(getFullName(data?.patient ?? {}));

	// CUSTOMFIELD FUNCTIONALTIY

	const handleOnChangeCustomFields = (currentValue, sectionIndex, fieldIndex) => {
		if (!customFields) {
			return;
		}

		const oldValue = customFields.sections[sectionIndex].fields[fieldIndex].value;

		if (oldValue === currentValue) {
			return;
		}

		setCustomFields(prevState => {
			const copyFields = [...prevState.sections];
			copyFields[sectionIndex].fields[fieldIndex].value = currentValue;

			return {
				sections: copyFields
			};
		});
	};

	return isLoading ? (
		<FuseLoading />
	) : isError ? (
		<ErrorMessage />
	) : (
		<ContextMenu.Provider
			value={{
				setMenu,
				reaceptionControl: control,
				receptionErrors: errors,
				receptionGetValues: getValues,
				receptionSetError: setError,
				receptionClearErrors: clearErrors,
				receptionReset: reset,
				listMedications,
				setListMedications,
				listLaboratory,
				setListLaboratory,
				listHospital,
				setListHospital,
				headerRef: headerStateRef,
				setCustomFields,
				handleOnChangeCustomFields
			}}
		>
			<div>
				<Paper
					ref={setHeaderStateRef}
					className={`grid md:flex items-center md:justify-between scroll-control pl-24 fixed bg-white z-10  w-full ${
						folded ? 'pr-76' : 'lg:pr-288'
					}`}
				>
					<div>
						<Button
							textNormal
							className={`${classes.navButtons} whitespace-no-wrap mz-10 mt-16 md:mb-10 px-16`}
							variant="text"
							startIcon={<ArrowBackIcon />}
							onClick={history.goBack}
						>
							Вернуться
						</Button>
						<Button
							disabled={readOnly}
							textNormal
							className="whitespace-no-wrap ml-16 mt-16 md:mb-10 px-32"
							onClick={handleOnUpdateSupplement}
						>
							Сохранить
						</Button>
						<Button
							id="basic-button"
							aria-controls={open ? 'basic-menu' : undefined}
							aria-haspopup="true"
							aria-expanded={open ? 'true' : undefined}
							variant="contained"
							disabled={isDocumentButtonDisabled}
							// disableElevation
							onClick={handleOnDocumentButtonClick}
							endIcon={<KeyboardArrowDownIcon />}
							textNormal
							className="whitespace-no-wrap ml-16 mt-16 md:mb-10"
						>
							Документы
						</Button>
						<Menu
							id="basic-menu"
							anchorEl={menuAnchorEl}
							open={open}
							onClose={handleMenuClose}
							MenuListProps={{
								'aria-labelledby': 'basic-button'
							}}
							// style={{ top: '50px' }}
						>
							{clinicDocumentsData?.map(document => {
								return (
									<MenuItem key={document?.uuid} className="flex justify-between">
										<span>{document?.name}</span>{' '}
										<CloudDownloadIcon
											className="text-primary ml-16"
											onClick={() => {
												handleMenuClose();
												handleDownloadDocument(receptionUuid, document.uuid);
											}}
										/>
									</MenuItem>
								);
							})}
						</Menu>
					</div>

					<div className="pr-32 mt-16 mb-10 self-end">{menu}</div>
				</Paper>

				<div>{renderRoutes(route.routes)}</div>
			</div>
		</ContextMenu.Provider>
	);
}
