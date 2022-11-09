import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { makeStyles, Tabs, Tab, Paper, Typography, withStyles } from '@material-ui/core';
import { Button } from 'app/bizKITUi';
import { Controller } from 'react-hook-form';
import { TableMedications as TableMedicationsConsumption } from 'app/common/ModalCommonReception/TableMedications';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { TableLaboratories } from 'app/common/ModalCommonReception/TableLaboratories';
import { TableHospital } from 'app/common/ModalCommonReception/TableHospital';
import { clinicService, ENTITY, ENTITY_DEPS, hospitalService, laboratoryService, productsService } from 'app/services';
import { useAlert } from 'app/hooks';
import { useParams } from 'react-router';
import { BlockReceptionStatus } from 'app/common/BlockReceptionStatus';
import { ContextMenu } from '../../pages/DoctorDetails';
import { ADDITIONAL_EXAMINATION, INFORMATION, MEDICINES_CONSUMPTIONS, PRESCRIBE_TREATMENT } from './constants';
import { Information } from './Information';
import { FormTreatment } from './FormTreatment';

const useStyles = makeStyles(() => ({
	navButtons: {
		backgroundColor: '#EFEFEF'
	},
	tabsPaper: {
		// marginBottom: 25,
		boxShadow: 'none',
		background: 'inherit',
		padding: 0,
		zIndex: 3
	},
	paymentContentWrapper: {
		margin: '0 35px',
		padding: 0
	},
	detailsContainer: {
		margin: '0 35px'
	},
	detailsContainerPaper: {
		padding: '20px 18px'
	},
	noPadding: {
		width: 'auto',
		paddingRight: 0,
		paddingLeft: 0,
		margin: 'auto 10px'
	},
	additionalSurvey: {
		padding: 20,
		paddingBottom: 30
	},
	clinicTabsPaper: {
		width: 'fit-content',
		marginBottom: 32,
		boxShadow: 'none'
	}
}));

const LABORATORY = 'laboratory';
const HOSPITAL = 'hospital';

export const StyledTab = withStyles({
	root: {
		fontSize: '14px',
		fontWeight: 'normal',
		textTransform: 'none'
	}
})(Tab);

export const DoctorInformation = () => {
	const {
		setMenu,
		reaceptionControl,
		receptionGetValues,
		receptionSetError,
		receptionClearErrors,
		receptionReset,
		listMedications,
		setListMedications,
		listLaboratory,
		setListLaboratory,
		listHospital,
		setListHospital,
		headerRef,
		setCustomFields,
		handleOnChangeCustomFields
	} = useContext(ContextMenu);
	const classes = useStyles();
	const queryClient = useQueryClient();

	// const { control, errors, getValues, setError, clearErrors, reset } = useForm({
	// 	mode: 'onBlur',
	// 	defaultValues: initialValues
	// });

	const [currentStatus, setCurrentStatus] = useState(INFORMATION);
	const [headerHeight, setHeaderHeight] = useState(60);

	// INFORMATION
	const { receptionUuid } = useParams();

	const { isLoading, data } = useQuery(
		[ENTITY.CLINIC_RECEPTION, receptionUuid],
		() => clinicService.getReceptionSupplement(receptionUuid).then(res => res.data),
		{ enabled: !!receptionUuid }
	);

	const readOnly = useMemo(() => isLoading || (data && data.completed), [isLoading, data]);
	// ADDITIONAL_EXAMINATION
	const { alertSuccess, alertError } = useAlert();
	const [currentAdditionalSurvey, setCurrentAdditionalSurvey] = useState(LABORATORY);

	const laboratoryReceptionCreate = useMutation(laboratoryService.createLaboratoryReceptions);

	const handleCreateLaboratoryReception = () => {
		const newListLaboratory = listLaboratory.map(list => ({
			cost: list.cost,
			count: list.count,
			service: list.product.uuid
		}));

		laboratoryReceptionCreate
			.mutateAsync({
				...receptionGetValues(),
				doctor: '',
				directive: data?.service?.doctor.uuid ?? null,
				patient: data?.patient.uuid,
				clinic_reception: receptionUuid,
				medications: [],
				services: newListLaboratory
			})
			.then(() => {
				ENTITY_DEPS.LABORATORY_RECEPTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Приём успешно создан');
				// setCurrentLaboratoryReceptionUuid(results.data.uuid);
				// onUpdate(results.data.uuid);
			})
			.catch(error => {
				// error.fieldErrors.forEach(item => {
				// 	receptionSetError(item.field, { message: item.message });
				// });
				alertError('Не удалось создать приём');
			});
	};

	const hospitalReceptionCreate = useMutation(hospitalService.createHospitalReceptions);
	const handleCreateReception = () => {
		receptionClearErrors();
		const newListHospital = listHospital.map(list => ({
			cost: list.cost,
			count: list.count,
			service: list.product.uuid
		}));

		hospitalReceptionCreate
			.mutateAsync({
				...receptionGetValues(),
				doctor: '',
				directive: data?.service?.doctor.uuid ?? null,
				patient: data?.patient.uuid,
				clinic_reception: receptionUuid,
				medications: [],
				services: newListHospital
			})
			.then(() => {
				ENTITY_DEPS.LABORATORY_RECEPTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Приём успешно создан');
				// setCurrentLaboratoryReceptionUuid(results.data.uuid);
				// onUpdate(results.data.uuid);
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					receptionSetError(item.field, { message: item.message });
				});
				alertError('Не удалось создать приём');
			});
	};

	useEffect(() => {
		if (!data) {
			return;
		}

		receptionReset({
			directive: data?.service?.doctor.uuid ?? null
		});
		setCustomFields(data.custom_fields);
	}, [data, receptionReset]);

	const changeHeight = useCallback(() => {
		setHeaderHeight(headerRef?.getBoundingClientRect().height);
	}, [headerRef]);

	useEffect(() => {
		if (headerRef) {
			changeHeight();
		}
		window.addEventListener('resize', changeHeight);
		return () => {
			window.removeEventListener('resize', changeHeight);
		};
	}, [headerRef, changeHeight]);

	useEffect(() => {
		const sumPlanCost = listMedications.reduce(
			(prev, current) =>
				prev + productsService.getProductCost(current, current.packing, current.plan_count, current.cost),
			0
		);
		const sumFactCost = listMedications.reduce(
			(prev, current) =>
				prev + productsService.getProductCost(current, current.packing, current.fact_count, current.cost),
			0
		);

		const totalCost = data?.service?.cost + sumPlanCost + sumFactCost;

		setMenu(
			<div className="flex">
				<div className="self-center mr-36 whitespace-no-wrap">Общая сумма приема: {totalCost} ₸</div>
				{data?.status && (
					<div>
						<BlockReceptionStatus status={data.status} />
					</div>
				)}
			</div>
		);
		return () => setMenu(null);
	}, [setMenu, data, listMedications]);

	return (
		<>
			<div className={classes.paymentContentWrapper}>
				<Paper className={`${classes.tabsPaper} fixed w-11/12 bg-white `} style={{ top: headerHeight + 64 }}>
					<Tabs
						value={currentStatus}
						onChange={(_, value) => setCurrentStatus(value)}
						indicatorColor="primary"
						textColor="primary"
						className="w-full"
						variant="scrollable"
					>
						<Tab className={classes.noPadding} label="Информация" value={INFORMATION} />
						<Tab
							className={`${classes.noPadding} max-w-full whitespace-no-wrap`}
							label="Дополнительное обследование"
							value={ADDITIONAL_EXAMINATION}
						/>
						<Tab className={classes.noPadding} label="Расход медикаментов" value={MEDICINES_CONSUMPTIONS} />
						<Tab className={classes.noPadding} label="Назначить лечение" value={PRESCRIBE_TREATMENT} />
					</Tabs>
				</Paper>
				<div style={{ marginTop: headerHeight + 64 }}>
					{currentStatus === INFORMATION && (
						<Information data={data} handleOnChangeCustomFields={handleOnChangeCustomFields} />
					)}
					{currentStatus === ADDITIONAL_EXAMINATION && (
						<Paper className="pt-px px-20 pb-36">
							<Typography
								color="secondary"
								variant="subtitle2"
								className="mt-32 font-bold text-l text-dark-blue"
							>
								Рекомендация для доп. обследования
							</Typography>
							<Paper className={classes.clinicTabsPaper}>
								<Tabs
									value={currentAdditionalSurvey}
									onChange={(_, value) => setCurrentAdditionalSurvey(value)}
									indicatorColor="primary"
									textColor="primary"
								>
									<StyledTab label="Лаборатория" value={LABORATORY} />
									<StyledTab label="Стационар" value={HOSPITAL} />
								</Tabs>
							</Paper>
							<div className="mt-20">
								{currentAdditionalSurvey === LABORATORY ? (
									<Controller
										control={reaceptionControl}
										name="laboratory_services"
										render={() => (
											<TableLaboratories
												readOnly={readOnly}
												laboratoryServices={listLaboratory}
												onChange={setListLaboratory}
											/>
										)}
									/>
								) : (
									<Controller
										control={reaceptionControl}
										name="hospital_services"
										render={() => (
											<TableHospital
												readOnly={readOnly}
												hospitalServices={listHospital}
												onChange={setListHospital}
											/>
										)}
									/>
								)}
							</div>
							<div className="mt-20 text-right">
								<Button
									customColor="primary"
									textNormal
									onClick={
										currentAdditionalSurvey === LABORATORY
											? handleCreateLaboratoryReception
											: handleCreateReception
									}
								>
									Создать прием
								</Button>
							</div>
						</Paper>
					)}
					{currentStatus === MEDICINES_CONSUMPTIONS && (
						<Paper className="p-40">
							<Typography
								color="secondary"
								variant="subtitle1"
								className="font-bold mb-10 text-dark-blue"
							>
								Автосписание расходных материалов
							</Typography>

							<Controller
								control={reaceptionControl}
								name="medications"
								render={() => (
									<TableMedicationsConsumption
										onClick={() => {}}
										// showBtn={!!commonReceptionUuid || !!operationUuid}
										readOnly={readOnly}
										medications={listMedications}
										onChange={setListMedications}
									/>
								)}
							/>
						</Paper>
					)}
					{currentStatus === PRESCRIBE_TREATMENT && (
						<Paper className="p-40">
							<FormTreatment
								commonReceptionUuid={receptionUuid}
								patient={data?.patient}
								doctor={data?.service?.doctor}
								readOnly={readOnly}
							/>
						</Paper>
					)}
				</div>
			</div>
		</>
	);
};
