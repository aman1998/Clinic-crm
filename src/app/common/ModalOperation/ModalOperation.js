import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Typography, MenuItem, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import FuseLoading from '@fuse/core/FuseLoading';
import PropTypes from 'prop-types';
import { PERMISSION } from 'app/services/auth/constants';
import { DialogSimpleTemplate, TextField, Button, ServerAutocomplete } from '../../bizKITUi';
import { Calendar } from '../Calendar';
import { ChartDoctorsSchedule } from '../ChartDoctorsSchedule';
import { numberFormat, getFullName, defaults } from '../../utils';
import { ErrorMessage } from '../ErrorMessage';
import { useAlert, useDebouncedFilterForm } from '../../hooks';
import { ModalPatient } from '../ModalPatient';
import { OptionPatient } from '../OptionPatient';
import {
	operationService,
	clinicService,
	employeesService,
	ENTITY,
	ENTITY_DEPS,
	patientsService
} from '../../services';
import { modalPromise } from '../ModalPromise';
import { TYPE_SERVICE_OPERATION } from '../../services/clinic/constants';
import { OPERATION_CREATED_STAGE_STATUS_IN_PROGRESS } from '../../services/operation/constants';
import { GuardCheckPermission } from '../GuardCheckPermission';

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
	comment: ''
};

export function ModalOperation({
	isOpen,
	operationUuid,
	receptionSupplementUuid,
	initialValues,
	onClose,
	isCancelModal
}) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();
	const classes = useStyles();

	const [errors, setErrors] = useState({});
	const { form, debouncedForm, setInForm, setForm } = useDebouncedFilterForm(defaults(initialValues, defaultValues));

	const { isLoading: isLoadingOperation, isError: isErrorOperation, data: operation, refetch } = useQuery(
		[ENTITY.OPERATION, operationUuid],
		({ queryKey }) => operationService.getOperation(queryKey[1]),
		{ enabled: !!operationUuid }
	);

	const { data: stages } = useQuery(
		[ENTITY.OPERATION_CREATED_STAGE, { operation: operationUuid, limit: Number.MAX_SAFE_INTEGER }],
		({ queryKey }) => operationService.getOperationCreatedStages(queryKey[1])
	);
	const sortedList = stages?.results.sort((a, b) => a.number - b.number);

	useEffect(() => {
		if (!operation) {
			return;
		}

		setForm({
			...defaults(operation, defaultValues),
			dateTime: moment(operation.date_time).toDate(),
			doctor: operation.service.doctor.uuid,
			direction: operation.service.direction.uuid
		});
	}, [operation, setForm]);

	const { isLoading: isLoadingReception, isError: isErrorReception, data: reception } = useQuery(
		[ENTITY.CLINIC_RECEPTION, receptionSupplementUuid],
		({ queryKey }) => clinicService.getReceptionSupplement(queryKey[1]).then(res => res.data),
		{ enabled: !!receptionSupplementUuid }
	);
	useEffect(() => {
		if (!receptionSupplementUuid) {
			return;
		}

		setForm({
			...defaultValues,
			patient: reception.patient,
			doctor: reception.service.doctor.uuid
		});
	}, [reception, receptionSupplementUuid, setForm]);

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

	const getPreparedValues = () => {
		return {
			comment: form.comment,
			patient: form.patient?.uuid,
			service: form.service?.uuid,
			date_time: chartValue ? moment(chartValue.dateTime).toISOString() : null,
			reception: receptionSupplementUuid
		};
	};

	const createOperation = useMutation(payload => operationService.createOperation(payload));
	const handleOnCreateOperation = () => {
		createOperation
			.mutateAsync(getPreparedValues())
			.then(() => {
				setChartValue(null);

				ENTITY_DEPS.OPERATION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Операция успешно создана');
			})
			.catch(error => {
				const fieldErrors = getErrorsFields(error.fieldErrors);
				const errorMessage = fieldErrors.date_time
					? `Ошибка при выборе времени (${fieldErrors.date_time})`
					: 'Не удалось создать операцию.';

				setErrors(fieldErrors);
				alertError(errorMessage);
			});
	};

	const updateOperation = useMutation(({ uuid, payload }) => operationService.updateOperation(uuid, payload));
	const handleOnUpdateOperation = () => {
		updateOperation
			.mutateAsync({ uuid: operationUuid, payload: getPreparedValues() })
			.then(() => {
				setChartValue(null);

				ENTITY_DEPS.OPERATION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Операция успешно изменена');
			})
			.catch(error => {
				const fieldErrors = getErrorsFields(error.fieldErrors);
				const errorMessage = fieldErrors.date_time
					? `Ошибка при выборе времени (${fieldErrors.date_time})`
					: 'Не удалось изменить операцию.';

				setErrors(fieldErrors);
				alertError(errorMessage);
			});
	};

	const cancelOperation = useMutation(({ uuid, payload }) =>
		operationService.cancelOperationCreatedStage(uuid, payload)
	);
	const handleCancelOperation = () => {
		const { comment } = getPreparedValues();
		const data = sortedList.find(item => item.status === OPERATION_CREATED_STAGE_STATUS_IN_PROGRESS);
		cancelOperation.mutateAsync({ uuid: data.uuid, payload: { comment } }).then(() => {
			onClose();
			refetch();
			alertSuccess('Операция успешно отменена');
		});
	};

	const displayDateTime = operation ? moment(operation.date_time).format('DD MMMM YYYY, HH:mm') : '';
	const modalTitle =
		operationUuid && !isCancelModal
			? `Редактирование операции на ${displayDateTime}`
			: operationUuid && isCancelModal
			? 'Отмена операции'
			: 'Создание операции';
	const isError = isErrorOperation || isErrorReception;
	const isLoading = isLoadingOperation || isLoadingReception;

	const disableOnTrue = flag => {
		return {
			opacity: flag ? 0.15 : 1,
			pointerEvents: flag ? 'none' : 'initial'
		};
	};

	return (
		<>
			<DialogSimpleTemplate
				isOpen={isOpen}
				onClose={onClose}
				contentPadding={false}
				fullScreen
				header={
					<Typography variant="h6" component="h2">
						{modalTitle}
					</Typography>
				}
			>
				{isError ? (
					<ErrorMessage />
				) : isLoading ? (
					<div className={classes.container}>
						<FuseLoading />
					</div>
				) : (
					<div className={classes.container}>
						<div className={classes.centerContent} style={disableOnTrue(isCancelModal)}>
							<Typography variant="subtitle1" className="mb-10 font-bold">
								Выбор направления и врача
							</Typography>
							<div className={classes.filters}>
								<ServerAutocomplete
									label="Направление"
									value={form.direction}
									InputProps={{
										size: 'small'
									}}
									getOptionLabel={option => option.name}
									onFetchList={search =>
										clinicService
											.getDirections({
												search,
												limit: 10,
												service_type: TYPE_SERVICE_OPERATION,
												service: form.service?.uuid,
												doctor: form.doctor
											})
											.then(({ results }) => results)
									}
									onFetchItem={fetchUuid => clinicService.getDirectionById(fetchUuid)}
									onChange={value => setInForm('direction', value?.uuid ?? null)}
								/>

								<ServerAutocomplete
									label="Врач"
									value={form.doctor}
									InputProps={{
										size: 'small'
									}}
									getOptionLabel={option => getFullName(option)}
									onFetchList={search =>
										employeesService
											.getDoctors({
												search,
												service_type: TYPE_SERVICE_OPERATION,
												direction: form.direction,
												service: form.service?.uuid
											})
											.then(({ data }) => data.results)
									}
									onFetchItem={fetchUuid =>
										employeesService.getDoctor(fetchUuid).then(({ data }) => data)
									}
									onChange={value => setInForm('doctor', value?.uuid ?? null)}
								/>
								<div>
									<ServerAutocomplete
										value={form.service}
										name="service"
										label="Услуга"
										InputProps={{
											size: 'small',
											error: !!errors.service,
											helperText: errors.service
										}}
										getOptionLabel={option => option.name}
										onFetchList={name =>
											clinicService
												.getServicesNested({
													name,
													type: TYPE_SERVICE_OPERATION,
													direction: form.direction,
													doctor: form.doctor
												})
												.then(({ results }) => results)
										}
										onFetchItem={fetchUuid => clinicService.getServiceById(fetchUuid)}
										onChange={handleOnChangeService}
									/>
								</div>

								<TextField
									value={numberFormat.currency(form.service?.cost)}
									label="Стоимость"
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
									onChange={setChartValue}
								/>
							) : (
								<Typography variant="subtitle2" className="mt-20 font-bold">
									Выберите услугу
								</Typography>
							)}
						</div>

						<div className={classes.rightContent}>
							<div className={classes.contentPadding}>
								<div style={disableOnTrue(isCancelModal)}>
									<Calendar
										value={form.dateTime}
										disabledDates={[]}
										onChange={date => setInForm('dateTime', date)}
									/>
								</div>

								<Typography
									variant="subtitle1"
									className="mt-20 font-bold"
									style={disableOnTrue(isCancelModal)}
								>
									Информация о пациенте
								</Typography>
								<div className="mt-20" style={disableOnTrue(isCancelModal)}>
									{!operationUuid && (
										<ServerAutocomplete
											value={form.patient}
											label="Поиск по ФИО, телефону, ИИН"
											fullWidth
											InputProps={{
												size: 'small'
											}}
											getOptionLabel={option => getFullName(option)}
											renderOption={option => <OptionPatient patient={option} />}
											onFetchList={search =>
												patientsService
													.getPatients({ limit: 10, search })
													.then(({ data }) => data.results)
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

								<div className="mt-12 text-right" style={disableOnTrue(isCancelModal)}>
									{form.patient ? (
										<Button
											size="small"
											variant="text"
											className="mb-6"
											textNormal
											onClick={handleOnOpenModalPatient}
										>
											Редактировать пациента
										</Button>
									) : (
										<Button
											size="small"
											variant="text"
											className="mb-6"
											textNormal
											onClick={handleOnOpenModalPatient}
										>
											Создать пациента
										</Button>
									)}
									<TextField
										label="Ф.И.О пациента"
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
									label="Номер телефона"
									variant="outlined"
									fullWidth
									className="mt-20"
									size="small"
									error={!!errors.patient}
									helperText={errors.patient}
									InputProps={{
										readOnly: true
									}}
									style={disableOnTrue(isCancelModal)}
									value={patientsService.getPatientMainPhone(form.patient)}
								/>

								<TextField
									label="ИИН"
									variant="outlined"
									fullWidth
									className="mt-20"
									size="small"
									InputProps={{
										readOnly: true
									}}
									style={disableOnTrue(isCancelModal)}
									value={form.patient?.iin ?? ''}
								/>

								<TextField
									select
									label="Источник"
									variant="outlined"
									fullWidth
									className="mt-20"
									size="small"
									style={disableOnTrue(isCancelModal)}
								>
									<MenuItem>Все</MenuItem>
								</TextField>

								<TextField
									value={form.comment}
									label="Комментарий"
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
							</div>

							<Divider className="mt-20" />

							<div className={classes.contentPadding}>
								{operationUuid && !isCancelModal ? (
									<GuardCheckPermission permission={PERMISSION.OPERATIONS.EDIT_OPERATION}>
										{() => (
											<Button
												textNormal
												fullWidth
												className="my-20"
												disabled={updateOperation.isLoading}
												onClick={handleOnUpdateOperation}
											>
												Изменить операцию
											</Button>
										)}
									</GuardCheckPermission>
								) : operationUuid && isCancelModal ? (
									<GuardCheckPermission permission={PERMISSION.OPERATIONS.EDIT_OPERATION}>
										{() => (
											<Button
												customColor="secondary"
												variant="outlined"
												textNormal
												fullWidth
												className="my-20"
												disabled={cancelOperation.isLoading}
												onClick={handleCancelOperation}
											>
												Отменить операцию
											</Button>
										)}
									</GuardCheckPermission>
								) : (
									<GuardCheckPermission permission={PERMISSION.OPERATIONS.ADD_OPERATION}>
										{() => (
											<Button
												textNormal
												fullWidth
												className="my-20"
												disabled={createOperation.isLoading}
												onClick={handleOnCreateOperation}
											>
												Создать операцию
											</Button>
										)}
									</GuardCheckPermission>
								)}
							</div>
						</div>
					</div>
				)}
			</DialogSimpleTemplate>
		</>
	);
}
ModalOperation.defaultProps = {
	operationUuid: null,
	receptionSupplementUuid: null,
	initialValues: {},
	isCancelModal: false
};
ModalOperation.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	operationUuid: PropTypes.string,
	receptionSupplementUuid: PropTypes.string,
	isCancelModal: PropTypes.bool,
	initialValues: PropTypes.shape({
		dateTime: PropTypes.instanceOf(Date),
		doctor: PropTypes.string,
		direction: PropTypes.string,
		patientNumber: PropTypes.string,
		patient: PropTypes.string,
		service: PropTypes.string,
		comment: PropTypes.string
	}),
	onClose: PropTypes.func.isRequired
};
