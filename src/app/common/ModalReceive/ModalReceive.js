import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { Typography, Divider, InputAdornment } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FuseLoading from '@fuse/core/FuseLoading';
import { DialogSimpleTemplate, TextField, Button, ServerAutocomplete } from '../../bizKITUi';
import { Calendar } from '../Calendar';
import { numberFormat, getFullName, defaults } from '../../utils';
import { ErrorMessage } from '../ErrorMessage';
import { useAlert, useDebouncedFilterForm, usePermissions } from '../../hooks';
import { ModalPatient } from '../ModalPatient';
import { OptionPatient } from '../OptionPatient';
import { CallButton } from '../CallButton';
import {
	clinicService,
	companiesService,
	employeesService,
	ENTITY,
	ENTITY_DEPS,
	patientsService,
	sourceHandbooksService
} from '../../services';
import { ModalReserve } from '../ModalReserve';
import { TYPE_SERVICE_COMMON } from '../../services/clinic/constants';
import { ModalReceiveHeader } from './ModalReceiveHeader';
import { CALL_TYPE_IN, CALL_TYPE_OUT } from '../../services/telephony/constants';
import { ChartDoctorsSchedule } from '../ChartDoctorsSchedule';
import { modalPromise } from '../ModalPromise';
import { ModalAppointmentInfo } from '../ModalAppointmentInfo';
import { CALL_MANAGER_PERMISSIONS } from '../../services/auth/constants';

import * as globalAuthSelectors from '../../auth/store/selectors/auth';

const useStyles = makeStyles(theme => ({
	container: {
		display: 'grid',
		gridTemplateColumns: '1fr 380px',
		height: '100%',
		overflow: 'hidden'
	},
	contentPadding: {
		padding: '0 20px 0 20px'
	},
	rightContent: {
		borderLeft: `1px solid ${theme.palette.grey[300]}`,
		overflowY: 'auto'
	},
	centerContent: {
		flexBasis: '100%',
		padding: 15,
		overflowY: 'auto'
	},
	filters: {
		display: 'grid',
		gridTemplateColumns: 'repeat(4, 1fr)',
		gridGap: 10,
		marginBottom: 20
	}
}));

const defaultValues = {
	dateTime: moment().startOf('day').toDate(),
	doctor: null,
	direction: null,
	patientNumber: null,
	patient: null,
	service: null,
	callType: null,
	source_handbook: null,
	comment: '',
	partner: null,
	call_center_manager: null
};

export function ModalReceive({ isOpen, receptionUuid, operationStageUuid, initialValues, onCreate, onClose }) {
	const queryClient = useQueryClient();
	const { hasPermission } = usePermissions();
	const { alertSuccess, alertError } = useAlert();
	const classes = useStyles();

	const currentUser = useSelector(globalAuthSelectors.currentUser);
	const currentCallManager = hasPermission(CALL_MANAGER_PERMISSIONS) ? currentUser.data.uuid : null;

	const [errors, setErrors] = useState({});
	const { form, debouncedForm, setInForm, setForm } = useDebouncedFilterForm(
		defaults(initialValues, { ...defaultValues, call_center_manager: currentCallManager })
	);

	const { isLoading: isLoadingReception, isError: isErrorReception, data: reception } = useQuery(
		[ENTITY.CLINIC_RECEPTION, receptionUuid],
		({ queryKey }) => clinicService.getReceptionById(queryKey[1]).then(response => response.data),
		{ enabled: !!receptionUuid }
	);

	useEffect(() => {
		if (!reception) {
			return;
		}

		setForm({
			...defaults(reception, defaultValues),
			dateTime: moment(reception.date_time).toDate(),
			doctor: reception.service.doctor.uuid,
			direction: reception.service.direction.uuid
		});
	}, [reception, setForm]);

	const [chartValue, setChartValue] = useState(null);
	const getErrorsFields = errorsFields =>
		errorsFields.reduce((prev, current) => ({ ...prev, [current.field]: current.message }), {});

	const handleOnChangeService = service => {
		if (!service) {
			setInForm('service', service);

			return;
		}

		setInForm('service', service);
		setInForm('direction', service.direction.uuid);
		setInForm('doctor', service.doctor.uuid);
	};

	const handleOnOpenModalPatient = () => {
		modalPromise.open(({ onClose: onCloseModalPatient }) => (
			<ModalPatient
				isOpen
				initialValues={{
					main_phone: form.patientNumber
				}}
				patientsUuid={form.patient?.uuid}
				onClose={onCloseModalPatient}
			/>
		));
	};

	const handleOnOpenModalReserve = () => {
		modalPromise.open(({ onClose: onCloseModalReserve }) => (
			<ModalReserve
				isOpen
				initialValues={{
					doctor: form.doctor,
					direction: form.direction,
					service: form.service?.uuid,
					patient: form.patient?.uuid
				}}
				onClose={onCloseModalReserve}
			/>
		));
	};

	const getPreparedValues = () => {
		return {
			stage: operationStageUuid,
			comment: form.comment,
			patient: form.patient?.uuid,
			service: form.service?.uuid,
			partner: form.partner,
			call_center_manager: form.call_center_manager,
			source_handbook: form.source_handbook,
			date_time: chartValue ? moment(chartValue.dateTime).toISOString() : null
		};
	};

	const createReception = useMutation(payload => clinicService.createReception(payload));
	const handleOnCreateReception = () => {
		createReception
			.mutateAsync(getPreparedValues())
			.then(() => {
				setChartValue(null);

				ENTITY_DEPS.CLINIC_RECEPTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('?????????? ?????????????? ????????????????');
				onCreate();
			})
			.catch(error => {
				const fieldErrors = getErrorsFields(error.fieldErrors);
				const errorMessage = fieldErrors.date_time
					? `???????????? ?????? ???????????? ?????????????? (${fieldErrors.date_time})`
					: '???? ?????????????? ?????????????????? ??????????.';

				setErrors(fieldErrors);
				alertError(errorMessage);
			});
	};

	const changeReception = useMutation(({ uuid, payload }) => clinicService.changeReception(uuid, payload));
	const handleOnChangeReception = () => {
		changeReception
			.mutateAsync({ uuid: receptionUuid, payload: getPreparedValues() })
			.then(() => {
				setChartValue(null);

				ENTITY_DEPS.CLINIC_RECEPTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('?????????? ?????????????? ??????????????');
			})
			.catch(error => {
				const fieldErrors = getErrorsFields(error.fieldErrors);
				const errorMessage = fieldErrors.date_time
					? `???????????? ?????? ???????????? ?????????????? (${fieldErrors.date_time})`
					: '???? ?????????????? ?????????????????? ??????????.';

				setErrors(fieldErrors);
				alertError(errorMessage);
			});
	};

	const displayDateTime = reception ? moment(reception.date_time).format('DD MMMM YYYY, HH:mm') : '';
	const modalTitle = receptionUuid ? `???????????????????????????? ???????????? ???? ${displayDateTime}` : '?????????? ??????????';

	return (
		<>
			<DialogSimpleTemplate
				isOpen={isOpen}
				onClose={onClose}
				contentPadding={false}
				fullScreen
				header={
					<ModalReceiveHeader
						title={modalTitle}
						callType={initialValues.callType}
						phoneNumber={initialValues.patientNumber}
					/>
				}
			>
				{isErrorReception ? (
					<ErrorMessage />
				) : isLoadingReception ? (
					<div className={classes.container}>
						<FuseLoading />
					</div>
				) : (
					<div className={classes.container}>
						<div className={classes.centerContent}>
							<Typography variant="subtitle1" className="mb-10 font-bold">
								?????????? ?????????????????????? ?? ??????????
							</Typography>
							<div className={classes.filters}>
								<ServerAutocomplete
									label="??????????????????????"
									value={form.direction}
									InputProps={{
										size: 'small'
									}}
									getOptionLabel={option => option.name}
									onFetchList={(search, limit) =>
										clinicService.getDirections({
											search,
											limit,
											service_type: TYPE_SERVICE_COMMON,
											service: form.service?.uuid,
											doctor: form.doctor
										})
									}
									onFetchItem={fetchUuid => clinicService.getDirectionById(fetchUuid)}
									onChange={value => setInForm('direction', value?.uuid ?? null)}
								/>

								<ServerAutocomplete
									label="????????"
									value={form.doctor}
									InputProps={{
										size: 'small'
									}}
									getOptionLabel={option => getFullName(option)}
									onFetchList={(search, limit) =>
										employeesService
											.getDoctors({
												search,
												limit,
												service_type: TYPE_SERVICE_COMMON,
												direction: form.direction,
												service: form.service?.uuid
											})
											.then(({ data }) => data)
									}
									onFetchItem={fetchUuid =>
										employeesService.getDoctor(fetchUuid).then(({ data }) => data)
									}
									onChange={value => {
										setInForm('service', value?.service);
										setInForm('doctor', value?.uuid ?? null);
									}}
								/>
								<div>
									<ServerAutocomplete
										value={form.service}
										name="service"
										label="????????????"
										InputProps={{
											size: 'small',
											error: !!errors.service,
											helperText: errors.service
										}}
										getOptionLabel={option => option.name}
										onFetchList={(name, limit) =>
											clinicService.getServicesNested({
												name,
												limit,
												type: TYPE_SERVICE_COMMON,
												direction: form.direction,
												doctor: form.doctor
											})
										}
										onFetchItem={fetchUuid => clinicService.getServiceById(fetchUuid)}
										onChange={handleOnChangeService}
									/>
								</div>

								<TextField
									value={numberFormat.currency(form.service?.cost)}
									label="??????????????????"
									variant="outlined"
									fullWidth
									size="small"
									InputProps={{
										readOnly: true
									}}
								/>
							</div>

							{debouncedForm.service ? (
								<ChartDoctorsSchedule
									value={chartValue}
									initialValues={{
										dateReceipt: form.dateTime,
										direction: debouncedForm.direction,
										doctor: debouncedForm.doctor,
										service: debouncedForm.service?.uuid
									}}
									duration={debouncedForm.service.duration}
									onClickReception={({ uuid }) =>
										modalPromise.open(({ onClose: onCloseModal }) => (
											<ModalAppointmentInfo isOpen receptionUuid={uuid} onClose={onCloseModal} />
										))
									}
									onChange={setChartValue}
								/>
							) : (
								<Typography variant="subtitle2" className="mt-20 font-bold">
									???????????????? ????????????
								</Typography>
							)}
						</div>

						<div className={classes.rightContent}>
							<div className={classes.contentPadding}>
								<Calendar
									value={form.dateTime}
									disabledDates={[]}
									onChange={date => setInForm('dateTime', date)}
								/>

								<Typography variant="subtitle1" className="mt-20 font-bold">
									???????????????????? ?? ????????????????
								</Typography>
								<div className="mt-20">
									{!receptionUuid && (
										<ServerAutocomplete
											value={form.patient}
											label="?????????? ???? ??????, ????????????????, ??????"
											fullWidth
											InputProps={{
												size: 'small',
												error: !!errors.patient,
												helperText: errors.patient
											}}
											getOptionLabel={option => getFullName(option)}
											renderOption={option => <OptionPatient patient={option} />}
											onFetchList={(search, limit) =>
												patientsService.getPatients({ search, limit }).then(({ data }) => data)
											}
											onFetchItem={uuid =>
												patientsService
													.getPatientByUuid(uuid)
													.then(({ data: patientData }) => patientData)
											}
											onChange={value => setInForm('patient', value)}
										/>
									)}
								</div>

								<div className="mt-12 text-right">
									{form.patient ? (
										<Button
											size="small"
											variant="text"
											className="mb-6"
											textNormal
											onClick={handleOnOpenModalPatient}
										>
											?????????????????????????? ????????????????
										</Button>
									) : (
										<Button
											size="small"
											variant="text"
											className="mb-6"
											textNormal
											onClick={handleOnOpenModalPatient}
										>
											?????????????? ????????????????
										</Button>
									)}
									<TextField
										label="??.??.?? ????????????????"
										variant="outlined"
										fullWidth
										InputProps={{
											readOnly: true
										}}
										value={form.patient ? getFullName(form.patient) : ''}
										name="patient"
										size="small"
									/>
								</div>

								<TextField
									label="?????????? ????????????????"
									variant="outlined"
									fullWidth
									className="mt-20"
									size="small"
									InputProps={{
										readOnly: true,
										endAdornment: (
											<InputAdornment position="end">
												<CallButton
													phoneNumber={patientsService.getPatientMainPhone(form.patient)}
												/>
											</InputAdornment>
										)
									}}
									value={patientsService.getPatientMainPhone(form.patient)}
								/>

								<TextField
									label="??????"
									variant="outlined"
									fullWidth
									className="mt-20"
									size="small"
									InputProps={{
										readOnly: true
									}}
									value={form.patient?.iin ?? ''}
								/>

								<ServerAutocomplete
									value={form.source_handbook}
									label="????????????????"
									fullWidth
									className="mt-20"
									InputProps={{
										size: 'small'
									}}
									getOptionLabel={option => option.name}
									onFetchList={(name, limit) => sourceHandbooksService.getSources({ name, limit })}
									onFetchItem={uuid => sourceHandbooksService.getSource(uuid)}
									onChange={value => setInForm('source_handbook', value?.uuid ?? null)}
								/>

								<TextField
									value={form.comment}
									label="??????????????????????"
									variant="outlined"
									fullWidth
									rows={3}
									multiline
									className="mt-20"
									name="comment"
									size="small"
									error={!!errors.comment}
									helperText={errors.comment}
									onChange={event => setInForm('comment', event.target.value)}
								/>

								<Typography variant="subtitle1" className="mt-20 font-bold">
									?????????????????????? ????????????
								</Typography>

								<ServerAutocomplete
									value={form.partner}
									label="??????????????"
									fullWidth
									className="mt-20"
									InputProps={{
										size: 'small'
									}}
									getOptionLabel={option => option.name}
									onFetchList={(search, limit) =>
										companiesService
											.getPartnersCompanies({ search, limit })
											.then(({ data }) => data)
									}
									onFetchItem={uuid => companiesService.getPartnerCompany(uuid)}
									onChange={value => setInForm('partner', value?.uuid ?? null)}
								/>
								<ServerAutocomplete
									value={form.call_center_manager}
									label="???????????????? ????????-????????????"
									fullWidth
									className="mt-20"
									InputProps={{
										size: 'small'
									}}
									getOptionLabel={option => getFullName(option)}
									onFetchList={(search, limit) => employeesService.getPersonalList({ search, limit })}
									onFetchItem={uuid => employeesService.getPersonal(uuid)}
									onChange={value => setInForm('call_center_manager', value?.uuid ?? null)}
								/>
							</div>

							<Divider className="mt-20" />

							<div className={classes.contentPadding}>
								{receptionUuid ? (
									<Button
										textNormal
										fullWidth
										className="mt-20"
										disabled={changeReception.isLoading}
										onClick={handleOnChangeReception}
									>
										???????????????? ??????????
									</Button>
								) : (
									<Button
										textNormal
										fullWidth
										className="mt-20"
										disabled={createReception.isLoading}
										onClick={handleOnCreateReception}
									>
										?????????????????? ??????????
									</Button>
								)}

								<Button
									textNormal
									customColor="secondary"
									fullWidth
									variant="outlined"
									className="mt-10 mb-20"
									onClick={handleOnOpenModalReserve}
								>
									?????????????? ????????????
								</Button>
							</div>
						</div>
					</div>
				)}
			</DialogSimpleTemplate>
		</>
	);
}
ModalReceive.defaultProps = {
	receptionUuid: null,
	operationStageUuid: null,
	initialValues: {},
	onCreate: () => {}
};
ModalReceive.propTypes = {
	receptionUuid: PropTypes.string,
	operationStageUuid: PropTypes.string,
	isOpen: PropTypes.bool.isRequired,
	initialValues: PropTypes.shape({
		dateTime: PropTypes.instanceOf(Date),
		doctor: PropTypes.string,
		direction: PropTypes.string,
		patientNumber: PropTypes.string,
		patient: PropTypes.string,
		service: PropTypes.string,
		callType: PropTypes.oneOf([CALL_TYPE_IN, CALL_TYPE_OUT]),
		comment: PropTypes.string
	}),
	onCreate: PropTypes.func,
	onClose: PropTypes.func.isRequired
};
