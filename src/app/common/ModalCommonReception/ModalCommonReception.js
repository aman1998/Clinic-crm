import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import moment from 'moment';
import { Typography, Grid, makeStyles, Tabs, Paper } from '@material-ui/core';
import { PERMISSION } from 'app/services/auth/constants';
import { FormTreatment } from 'app/features/treatment/components/FormTreatment';
import { Button, TextField, DrawerTemplate, DatePickerField, InputMask, DateTimePickerField } from '../../bizKITUi';
import { ErrorMessage } from '../ErrorMessage';
import { numberFormat, getFullName, defaults } from '../../utils';
import { useAlert } from '../../hooks';
import { clinicService, ENTITY, ENTITY_DEPS, operationService, receptionsCommonService } from '../../services';
import { FormDisplayCustomFields } from '../FormDisplayCustomFields';
import { TableMedications } from './TableMedications';
import { modalPromise } from '../ModalPromise';
import { ModalOperation } from '../ModalOperation';
import { OPERATION_STAGE_OPERATION } from '../../services/operation/constants';
import { GuardCheckPermission } from '../GuardCheckPermission';
import { TableLaboratories } from './TableLaboratories';
import { TableHospital } from './TableHospital';
import { StyledTab } from './Tabs';

const defaultValues = {
	diagnosis: '',
	appeal_type: '',
	inspection_date_time: null,
	sent_by: '',
	complaints: '',
	anamnesis_morbi: '',
	recommendation: '',
	fact_start_date: null,
	fact_end_date: null,
	medications: [],
	laboratory_services: [],
	hospital_services: []
};

const LABORATORY = 'laboratory';
const HOSPITAL = 'hospital';

const useStyles = makeStyles({
	btnList: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
		width: '100%'
	},
	tabsPaper: {
		width: 'fit-content',
		marginBottom: 32,
		boxShadow: 'none'
	},
	button: {
		width: 200
	}
});

export function ModalCommonReception({ isOpen, commonReceptionUuid, operationUuid, onClose, onUpdate }) {
	const { alertSuccess, alertError } = useAlert();

	const [currentAdditionalSurvey, setCurrentAdditionalSurvey] = useState(LABORATORY);

	const queryClient = useQueryClient();
	const classes = useStyles();

	const {
		isLoading: isLoadingReceptionSupplement,
		isFetching: isFetchingReceptionSupplement,
		isError: isErrorReceptionSupplement,
		data: receptionSupplement
	} = useQuery(
		[ENTITY.CLINIC_RECEPTION, commonReceptionUuid],
		() => clinicService.getReceptionSupplement(commonReceptionUuid).then(res => res.data),
		{ enabled: !!commonReceptionUuid }
	);

	// const { data: list } = useQuery([ENTITY.CLINIC_RECEPTION_MEDICATIONS, commonReceptionUuid], () =>
	// 	clinicService.getClinicReceptionMedications(commonReceptionUuid)
	// );
	//
	// console.log('list =>', list?.results);

	const {
		isLoading: isLoadingOperationSupplement,
		isFetching: isFetchingOperationSupplement,
		isError: isErrorOperationSupplement,
		data: operationSupplement
	} = useQuery(
		[ENTITY.OPERATION_SUPPLEMENT, operationUuid],
		() => operationService.getOperationSupplement(operationUuid),
		{
			enabled: !!operationUuid
		}
	);

	const data = useMemo(() => receptionSupplement || operationSupplement, [operationSupplement, receptionSupplement]);

	const { control, errors, getValues, setError, clearErrors, reset } = useForm({
		mode: 'onBlur',
		defaultValues
	});

	const [customFields, setCustomFields] = useState(null);

	useEffect(() => {
		if (!data) {
			return;
		}

		setCustomFields(data.custom_fields);

		reset(defaults(data, defaultValues));
	}, [data, reset]);

	const patientAge = data?.patient.birth_date ? moment().diff(data.patient.birth_date, 'year') : '';

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

	const handleOnPrintCheck = () => {
		if (commonReceptionUuid) {
			receptionsCommonService.printReceptionActionCheck(commonReceptionUuid).catch(() => {
				alertError('Не удалось распечатать файл');
			});
		}
		if (operationUuid) {
			operationService.printOperationActionCheck(operationUuid).catch(() => {
				alertError('Не удалось распечатать файл');
			});
		}
	};

	const updateSupplement = useMutation(({ payload }) => {
		if (commonReceptionUuid) {
			return clinicService.updateReceptionSupplement(commonReceptionUuid, payload).then(response => {
				ENTITY_DEPS.CLINIC_RECEPTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});

				return response;
			});
		}
		if (operationUuid) {
			return operationService.updateOperationSupplement(operationUuid, payload).then(response => {
				ENTITY_DEPS.OPERATION_SUPPLEMENT.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				return response;
			});
		}

		return Promise.resolve(null);
	});

	// eslint-disable-next-line consistent-return
	const updateMedicine = useMutation(({ payload }) => {
		if (commonReceptionUuid) {
			return clinicService.updateReceptionsMedicineByUuid(commonReceptionUuid, payload).then(response => {
				ENTITY_DEPS.CLINIC_RECEPTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});

				return response;
			});
		}
		if (operationUuid) {
			return clinicService.updateOperationsMedicineByUuid(operationUuid, payload).then(response => {
				ENTITY_DEPS.CLINIC_RECEPTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});

				return response;
			});
		}
	});

	const handleOnUpdateMedications = () => {
		clearErrors();
		const values = getValues();
		const payload = {
			medications: values.medications.map(item => ({
				amount_in_package: item.amount_in_package,
				cost: item.cost,
				fact_count: item.fact_count,
				minimum_unit_of_measure: item.minimum_unit_of_measure?.uuid,
				packing: item.packing?.uuid,
				product: item.product?.uuid,
				written_off: item.written_off,
				plan_count: item.plan_count
			}))
		};

		updateMedicine
			.mutateAsync({
				payload
			})
			.then(() => {
				alertSuccess('Успешно сохранён');
				onUpdate();
			})
			.catch(() => {
				alertError(`Не удалось сохранить`);
			});
	};

	const handleOnUpdateSupplement = () => {
		clearErrors();
		const values = getValues();

		const payload = {
			...values,
			custom_fields: customFields,
			medications: values.medications.map(item => ({
				...item,
				minimum_unit_of_measure: item.minimum_unit_of_measure?.uuid,
				packing: item.packing?.uuid,
				packing_unit: item.packing_unit?.uuid,
				product: item.product?.uuid
			}))
		};

		updateSupplement
			.mutateAsync({
				payload
			})
			.then(() => {
				alertSuccess('Услуга успешно сохранён');
				onUpdate();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});
				alertError(`Не удалось сохранить услуга: ${error.userMessage}`);
			});
	};

	const handleOnOpenModalOperation = () => {
		modalPromise.open(({ onClose: onCloseModal }) => (
			<ModalOperation isOpen receptionSupplementUuid={commonReceptionUuid} onClose={onCloseModal} />
		));
	};

	const isLoading = isLoadingReceptionSupplement || isLoadingOperationSupplement;
	const isError = isErrorReceptionSupplement || isErrorOperationSupplement;

	const readOnly = useMemo(
		() =>
			updateSupplement.isLoading ||
			isFetchingReceptionSupplement ||
			isFetchingOperationSupplement ||
			(data && data.completed) ||
			(data.stage && data.stage.type === OPERATION_STAGE_OPERATION),
		[updateSupplement.isLoading, isFetchingReceptionSupplement, isFetchingOperationSupplement, data]
	);

	return (
		<>
			<DrawerTemplate
				isOpen={isOpen}
				close={onClose}
				width="md"
				isLoading={isLoading}
				header={
					<Typography color="secondary" className="text-xl font-bold text-center">
						Услуга
					</Typography>
				}
				content={
					isError ? (
						<ErrorMessage />
					) : isLoading ? (
						<></>
					) : (
						<>
							<Typography color="secondary" className="text-lg font-bold">
								Основная информация
							</Typography>
							<Grid container spacing={2}>
								<Grid item md={6} xs={12}>
									<TextField
										label="Услуга"
										variant="outlined"
										fullWidth
										className="mt-20"
										value={data.service.name}
										InputProps={{
											readOnly: true
										}}
									/>
								</Grid>

								<Grid item md={6} xs={12}>
									<TextField
										label="Врач"
										variant="outlined"
										fullWidth
										className="mt-20"
										value={getFullName(data.service.doctor)}
										InputProps={{
											readOnly: true
										}}
									/>
								</Grid>
							</Grid>
							<Grid container spacing={2}>
								<Grid item md={6} xs={12}>
									<DatePickerField
										label="Дата обращения"
										inputVariant="outlined"
										className="mt-20"
										fullWidth
										readOnly
										value={data.created_at}
									/>
								</Grid>

								<Grid item md={6} xs={12}>
									<TextField
										label="Сумма"
										variant="outlined"
										fullWidth
										className="mt-20"
										value={numberFormat.currency(data.service.cost)}
										InputProps={{
											readOnly: true
										}}
									/>
								</Grid>
							</Grid>

							<Typography color="secondary" className="mt-28 text-lg font-bold">
								Пациент
							</Typography>
							<Grid container spacing={2}>
								<Grid item md={6} xs={12}>
									<TextField
										label="Ф.И.О пациента"
										variant="outlined"
										fullWidth
										className="mt-20"
										value={getFullName(data.patient)}
										InputProps={{
											readOnly: true
										}}
									/>
								</Grid>

								<Grid item md={3} xs={12}>
									<DatePickerField
										label="Дата рождения"
										inputVariant="outlined"
										className="mt-20"
										fullWidth
										readOnly
										value={data.patient.birth_date ?? null}
									/>
								</Grid>

								<Grid item md={3} xs={12}>
									<TextField
										label="Возраст"
										variant="outlined"
										fullWidth
										className="mt-20"
										value={patientAge}
										InputProps={{
											readOnly: true
										}}
									/>
								</Grid>
							</Grid>
							<Grid container spacing={2}>
								<Grid item md={6} xs={12}>
									<TextField
										label="Номер медицинской карты"
										variant="outlined"
										fullWidth
										className="mt-20"
										value={data.patient.medical_card ?? ''}
										InputProps={{
											readOnly: true
										}}
									/>
								</Grid>

								<Grid item md={6} xs={12}>
									<InputMask
										mask="+9 999 999 99 99"
										variant="outlined"
										label="Номер телефона"
										fullWidth
										className="mt-20"
										value={data.patient.main_phone ?? ''}
										InputProps={{
											readOnly: true
										}}
									>
										<TextField />
									</InputMask>
								</Grid>
							</Grid>

							{operationUuid && (
								<Grid container spacing={2}>
									<Grid item md={6} xs={12}>
										<Typography color="secondary" className="mt-28 text-lg font-bold">
											Фактическое дата начало
										</Typography>
										<Controller
											as={<DateTimePickerField />}
											control={control}
											className="mt-10"
											fullWidth
											label="Дата обращения"
											name="fact_start_date"
											type="text"
											inputVariant="outlined"
											onlyValid
											error={!!errors.fact_start_date}
											helperText={errors.fact_start_date?.message}
											readOnly={readOnly}
										/>
									</Grid>
									<Grid item md={6} xs={12}>
										<Typography color="secondary" className="mt-28 text-lg font-bold">
											Фактическое дата завершение
										</Typography>
										<Controller
											as={<DateTimePickerField />}
											control={control}
											className="mt-10"
											fullWidth
											label="Дата обращения"
											name="fact_end_date"
											type="text"
											inputVariant="outlined"
											onlyValid
											error={!!errors.fact_end_date}
											helperText={errors.fact_end_date?.message}
											disabled={readOnly}
										/>
									</Grid>
								</Grid>
							)}

							<Typography color="secondary" className="mt-28 text-lg font-bold">
								Анкета осмотра
							</Typography>
							<Grid container spacing={2}>
								<Grid item md={6} xs={12}>
									<Controller
										as={<TextField />}
										control={control}
										className="mt-20"
										fullWidth
										label="Диагноз"
										variant="outlined"
										name="diagnosis"
										error={!!errors.diagnosis}
										helperText={errors.diagnosis?.message}
										disabled={readOnly}
									/>
								</Grid>
								<Grid item md={6} xs={12}>
									<Controller
										as={<TextField />}
										control={control}
										className="mt-20"
										fullWidth
										label="Тип обращения"
										variant="outlined"
										name="appeal_type"
										error={!!errors.appeal_type}
										helperText={errors.appeal_type?.message}
										disabled={readOnly}
									/>
								</Grid>
							</Grid>

							<Grid container spacing={2}>
								<Grid item md={6} xs={12}>
									<Controller
										as={<DatePickerField />}
										control={control}
										className="mt-20"
										fullWidth
										label="Дата и время осмотра"
										name="inspection_date_time"
										type="text"
										inputVariant="outlined"
										onlyValid
										error={!!errors.inspection_date_time}
										helperText={errors.inspection_date_time?.message}
										disabled={readOnly}
									/>
								</Grid>

								<Grid item md={6} xs={12}>
									<Controller
										as={<TextField />}
										control={control}
										className="mt-20"
										fullWidth
										label="Кто направил"
										variant="outlined"
										name="sent_by"
										error={!!errors.sent_by}
										helperText={errors.sent_by?.message}
										disabled={readOnly}
									/>
								</Grid>
							</Grid>

							<Controller
								as={<TextField />}
								control={control}
								variant="outlined"
								label="Жалобы"
								name="complaints"
								fullWidth
								className="mt-20"
								rows={4}
								multiline
								error={!!errors.complaints}
								helperText={errors.complaints?.message}
								disabled={readOnly}
							/>

							<Controller
								as={<TextField />}
								control={control}
								variant="outlined"
								label="Anamnesis morbi"
								name="anamnesis_morbi"
								fullWidth
								className="mt-20"
								rows={4}
								multiline
								error={!!errors.anamnesis_morbi}
								helperText={errors.anamnesis_morbi?.message}
								disabled={readOnly}
							/>

							{customFields && (
								<FormDisplayCustomFields
									fields={customFields.sections}
									onChangeData={handleOnChangeCustomFields}
								/>
							)}

							<Typography color="secondary" className="mt-28 text-lg font-bold">
								Рекомендации
							</Typography>
							<Controller
								as={<TextField />}
								control={control}
								variant="outlined"
								label="Список рекомендаций для пациента"
								name="recommendation"
								fullWidth
								className="mt-20"
								rows={4}
								multiline
								error={!!errors.recommendation}
								helperText={errors.recommendation?.message}
								disabled={readOnly}
							/>

							<div className="mt-32">
								<Typography color="secondary" variant="subtitle1" className="font-bold mb-10">
									Автосписание расходных материалов
								</Typography>

								<Controller
									control={control}
									name="medications"
									render={({ value, onChange }) => (
										<TableMedications
											onClick={handleOnUpdateMedications}
											showBtn={!!commonReceptionUuid || !!operationUuid}
											readOnly={readOnly}
											medications={value}
											onChange={onChange}
										/>
									)}
								/>
								<Typography color="secondary" variant="subtitle2" className="mt-32 font-bold text-lg">
									Рекомендация для доп. обследования
								</Typography>
								<Paper className={classes.tabsPaper}>
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
											control={control}
											name="laboratory_services"
											render={({ value, onChange }) => (
												<TableLaboratories
													readOnly={readOnly}
													laboratoryServices={value}
													onChange={onChange}
												/>
											)}
										/>
									) : (
										<Controller
											control={control}
											name="hospital_services"
											render={({ value, onChange }) => (
												<TableHospital
													readOnly={readOnly}
													hospitalServices={value}
													onChange={onChange}
												/>
											)}
										/>
									)}
								</div>

								<Grid item>
									<FormTreatment
										readOnly={readOnly}
										commonReceptionUuid={commonReceptionUuid}
										doctor={data?.service?.doctor}
										patient={data?.patient}
									/>
								</Grid>
							</div>
						</>
					)
				}
				footer={
					!isError && (
						<div className={`gap-10 ${classes.btnList}`}>
							<Button
								variant="contained"
								color="primary"
								textNormal
								disabled={readOnly}
								onClick={handleOnUpdateSupplement}
							>
								Сохранить услугу
							</Button>

							{commonReceptionUuid && (
								<GuardCheckPermission permission={PERMISSION.OPERATIONS.ADD_OPERATION}>
									{() => (
										<Button
											variant="outlined"
											color="primary"
											textNormal
											disabled={readOnly}
											onClick={handleOnOpenModalOperation}
										>
											Создать операцию
										</Button>
									)}
								</GuardCheckPermission>
							)}

							{(commonReceptionUuid || operationUuid) && (
								<Button onClick={handleOnPrintCheck} variant="outlined" color="primary" textNormal>
									Печать
								</Button>
							)}
						</div>
					)
				}
			/>
		</>
	);
}

ModalCommonReception.defaultProps = {
	commonReceptionUuid: null,
	operationUuid: null,
	onUpdate: () => {}
};
ModalCommonReception.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	commonReceptionUuid: PropTypes.string,
	operationUuid: PropTypes.string,
	onClose: PropTypes.func.isRequired,
	onUpdate: PropTypes.func
};
