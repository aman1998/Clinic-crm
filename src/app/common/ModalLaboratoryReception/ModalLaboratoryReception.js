import React, { useState, useEffect } from 'react';
import { Typography, Grid } from '@material-ui/core';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
	Button,
	TextField,
	DrawerTemplate,
	DatePickerField,
	Autocomplete,
	ServerAutocomplete,
	Amount
} from '../../bizKITUi';
import { useSearchPatient } from '../hooks/useSearchPatient';
import { OptionPatient } from '../OptionPatient';
import { TableServices } from './TableServices';
import { TableProducts } from './TableProducts';
import {
	laboratoryService,
	ENTITY,
	ENTITY_DEPS,
	patientsService,
	employeesService,
	productsService
} from '../../services';
import { useAlert } from '../../hooks';
import { ErrorMessage } from '../ErrorMessage';
import { ModalPatient } from '../ModalPatient';
import { getFullName } from '../../utils';
import { Files } from './Files';
import {
	STATUS_LABORATORY_RECEPTION_CASH,
	STATUS_LABORATORY_RECEPTION_PAID,
	STATUS_LABORATORY_RECEPTION_CONFIRMED
} from '../../services/laboratory/constants';
import { BlockReceptionStatus } from '../BlockReceptionStatus';
import { TYPE_SERVICE_COMMON, TYPE_SERVICE_LABORATORY } from '../../services/clinic/constants';

const initialValues = {
	doctor: null,
	directive: null
};

export function ModalLaboratoryReception({ isOpen, laboratoryReceptionUuid, onClose, onUpdate }) {
	const { alertSuccess, alertError } = useAlert();
	const queryClient = useQueryClient();
	const [currentLaboratoryReceptionUuid, setCurrentLaboratoryReceptionUuid] = useState(laboratoryReceptionUuid);

	const { isLoading, isFetching, isError, data } = useQuery(
		[ENTITY.LABORATORY_RECEPTION, currentLaboratoryReceptionUuid],
		() => {
			if (currentLaboratoryReceptionUuid) {
				return laboratoryService.getLaboratoryReception(currentLaboratoryReceptionUuid).then(res => res.data);
			}
			return Promise.resolve();
		}
	);

	const laboratoryReceptionCreate = useMutation(laboratoryService.createLaboratoryReceptions);
	const laboratoryReceptionUpdate = useMutation(({ uuid, payload }) => {
		return laboratoryService.updateLaboratoryReception(uuid, payload);
	});
	const laboratoryReceptionCheckout = useMutation(laboratoryService.checkoutLaboratoryReception);

	const laboratoryReceptionSendResult = useMutation(laboratoryService.sendLaboratoryReceptionResults);

	const { status: statusSearchPatient, actions: actionsSearchPatient, data: dataSearchPatient } = useSearchPatient();

	const [isSend, setIsSend] = useState(false);

	const statusIsConfirmed = data?.status === STATUS_LABORATORY_RECEPTION_CONFIRMED;
	const isNew = !currentLaboratoryReceptionUuid;
	const [listServices, setListServices] = useState([]);
	const [listMedications, setListMedications] = useState([]);
	const [isEdit, setIsEdit] = useState(isNew);
	const patientAge = dataSearchPatient.value?.birth_date
		? moment().diff(dataSearchPatient.value.birth_date, 'year')
		: '';

	const [isShowModalPatient, setIsShowModalPatient] = useState(false);

	const { register, control, errors, getValues, setError, clearErrors, reset } = useForm({
		mode: 'onBlur',
		defaultValues: initialValues
	});

	useEffect(() => {
		if (!data) {
			return;
		}

		setListServices(
			data?.services?.map(item => ({
				serviceUuid: item.service.uuid,
				name: item.service.name,
				amount: item.count,
				cost: item.service.cost
			}))
		);
		setListMedications(
			data?.medications?.map(item => ({
				productUuid: item.product.uuid,
				name: item.product.name,
				amount: item.count,
				cost: item.product.sale_price,
				packing: item.packing,
				minimum_unit_of_measure: item.minimum_unit_of_measure,
				packing_unit: item.packing_unit,
				amount_in_package: item.amount_in_package
			}))
		);

		reset({
			directive: data.directive ?? null,
			doctor: data.doctor?.uuid ?? null,
			partner: data.partner?.uuid ?? ''
		});

		if (data.patient) {
			actionsSearchPatient.getByUuid(data.patient.uuid);
		}

		setIsSend(data.sent_results);
	}, [actionsSearchPatient, data, reset]);

	const getStructuredArrayListServicesForSend = () =>
		listServices.map(item => ({
			service: item.serviceUuid,
			count: item.amount
		}));

	const getStructuredArrayListMedicationsForSend = () =>
		listMedications.map(item => ({
			product: item.productUuid,
			count: item.amount,
			packing: item.packing.uuid,
			minimum_unit_of_measure: item.minimum_unit_of_measure.uuid,
			packing_unit: item.packing_unit?.uuid,
			amount_in_package: item.amount_in_package
		}));

	const getTotalCost = () => {
		const servicesTotalCost = listServices?.reduce((prev, current) => prev + current.cost * current.amount, 0);
		const medicationsTotalCost = listMedications?.reduce(
			(prev, current) =>
				prev + productsService.getProductCost(current, current.packing, current.amount, current.cost),
			0
		);

		return servicesTotalCost + medicationsTotalCost;
	};

	const statusForBlockReception = {
		[STATUS_LABORATORY_RECEPTION_CASH]: 'CASH',
		[STATUS_LABORATORY_RECEPTION_PAID]: 'PAID',
		[STATUS_LABORATORY_RECEPTION_CONFIRMED]: 'CONFIRMED'
	}[data?.status];

	const handleOnCreateLaboratoryReception = () => {
		clearErrors();
		laboratoryReceptionCreate
			.mutateAsync({
				...getValues(),
				services: getStructuredArrayListServicesForSend(),
				medications: getStructuredArrayListMedicationsForSend(),
				patient: dataSearchPatient.value?.uuid
			})
			.then(results => {
				ENTITY_DEPS.LABORATORY_RECEPTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Приём успешно создан');
				setCurrentLaboratoryReceptionUuid(results.data.uuid);
				setIsEdit(false);
				onUpdate(results.data.uuid);
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});
				alertError('Не удалось создать приём');
			});
	};

	const handleOnUpdateLaboratoryReception = () => {
		clearErrors();
		laboratoryReceptionUpdate
			.mutateAsync({
				uuid: currentLaboratoryReceptionUuid,
				payload: {
					...getValues(),
					services: getStructuredArrayListServicesForSend(),
					medications: getStructuredArrayListMedicationsForSend(),
					patient: dataSearchPatient.value?.uuid
				}
			})
			.then(results => {
				ENTITY_DEPS.LABORATORY_RECEPTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Приём успешно обновлен');
				setIsEdit(false);
				onUpdate(results.uuid);
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});
				alertError('Не удалось обновить приём');
			});
	};

	const handleOnCheckoutLaboratoryReception = () => {
		clearErrors();
		laboratoryReceptionCheckout
			.mutateAsync(currentLaboratoryReceptionUuid)
			.then(results => {
				ENTITY_DEPS.LABORATORY_RECEPTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Успешно отправлено на кассу');
				onUpdate(results.uuid);
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});
				alertError('Не удалось отправить на кассу');
			});
	};

	const handleOnSendLaboratoryReceptionResults = () => {
		laboratoryReceptionSendResult
			.mutateAsync(currentLaboratoryReceptionUuid)
			.then(results => {
				ENTITY_DEPS.LABORATORY_RECEPTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Результат отправлен на почту');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});
				alertError(`Не удалось отправить результат на почту. ${error.userMessage}`);
			});
	};

	return (
		<>
			<DrawerTemplate
				isOpen={isOpen}
				close={onClose}
				width="md"
				isLoading={isLoading}
				header={
					<Typography color="secondary" className="text-xl font-bold text-center">
						Прием лаборатории
					</Typography>
				}
				content={
					isError ? (
						<ErrorMessage />
					) : isLoading ? (
						<></>
					) : (
						<div>
							<Typography color="secondary" className="text-lg font-bold">
								Основная информация
							</Typography>
							<Grid container spacing={2}>
								<Grid item md={6} xs={12}>
									<DatePickerField
										className="mt-20"
										fullWidth
										label="Дата обращения"
										type="text"
										variant="outlined"
										readOnly
										value={data?.created_at ?? null}
									/>
								</Grid>

								<Grid item md={6} xs={12}>
									<Controller
										control={control}
										name="doctor"
										render={({ onChange, ...props }) => (
											<ServerAutocomplete
												{...props}
												getOptionLabel={option => getFullName(option)}
												label="Врач"
												readOnly={!isEdit}
												className="mt-20"
												InputProps={{
													error: !!errors.doctor,
													helperText: errors.doctor?.message
												}}
												onChange={value => onChange(value?.uuid ?? null)}
												onFetchList={search =>
													employeesService
														.getDoctors({
															search,
															limit: 10,
															service_type: TYPE_SERVICE_LABORATORY
														})
														.then(res => res.data.results)
												}
												onFetchItem={fetchUuid =>
													employeesService.getDoctor(fetchUuid).then(res => res.data)
												}
											/>
										)}
									/>
								</Grid>
								<Grid item md={6} xs={12}>
									<Controller
										control={control}
										readOnly={!isEdit}
										name="directive"
										render={({ onChange, ...props }) => (
											<ServerAutocomplete
												{...props}
												getOptionLabel={option => getFullName(option)}
												label="Направляющий врач"
												readOnly={!isEdit}
												InputProps={{
													error: !!errors.directive,
													helperText: errors.directive?.message
												}}
												onChange={value => onChange(value?.uuid ?? null)}
												onFetchList={search =>
													employeesService
														.getDoctors({
															search,
															limit: 10,
															service_type: TYPE_SERVICE_COMMON
														})
														.then(res => res.data.results)
												}
												onFetchItem={fetchUuid =>
													employeesService.getDoctor(fetchUuid).then(res => res.data)
												}
											/>
										)}
									/>
								</Grid>
							</Grid>

							<div className=" flex justify-between mt-28">
								<Typography color="secondary" className="text-lg font-bold">
									Пациент
								</Typography>

								{dataSearchPatient.value ? (
									<Button
										size="small"
										variant="text"
										className="mb-6"
										textNormal
										onClick={() => setIsShowModalPatient(true)}
									>
										Редактировать пациента
									</Button>
								) : (
									<Button
										size="small"
										variant="text"
										className="mb-6"
										textNormal
										disabled={!isEdit}
										onClick={() => setIsShowModalPatient(true)}
									>
										Создать пациента
									</Button>
								)}
							</div>
							<Grid container spacing={2}>
								<Grid item md={6} xs={12}>
									<Autocomplete
										isLoading={statusSearchPatient.isLoading}
										options={dataSearchPatient.listPatient}
										className="mt-20"
										getOptionLabel={option => option && getFullName(option)}
										filterOptions={options => options}
										getOptionSelected={(option, value) => option.uuid === value.uuid}
										onChange={(_, value) => actionsSearchPatient.setValue(value)}
										onOpen={() => actionsSearchPatient.update(dataSearchPatient.keyword)}
										onInputChange={(_, newValue) => actionsSearchPatient.update(newValue)}
										fullWidth
										readOnly={!isEdit}
										value={dataSearchPatient.value}
										renderOption={option => <OptionPatient patient={option} />}
										renderInput={params => (
											<TextField
												{...params}
												InputProps={{ inputRef: register, ...params.InputProps }}
												label="Поиск по ФИО, телефону, ИИН"
												name="patient"
												variant="outlined"
												error={!!errors.patient}
												helperText={errors.patient?.message}
											/>
										)}
									/>
								</Grid>

								<Grid item md={6} xs={12}>
									<TextField
										label="Ф.И.О пациента"
										variant="outlined"
										fullWidth
										className="mt-20"
										value={dataSearchPatient.value ? getFullName(dataSearchPatient.value) : ''}
										InputProps={{
											readOnly: true
										}}
									/>
								</Grid>
							</Grid>
							<Grid container spacing={2}>
								<Grid item md={6} xs={12}>
									<TextField
										label="Номер телефона"
										variant="outlined"
										fullWidth
										className="mt-20"
										value={patientsService.getPatientMainPhone(dataSearchPatient.value)}
										InputProps={{
											readOnly: true
										}}
									/>
								</Grid>

								<Grid item md={3} xs={12}>
									<DatePickerField
										label="Дата рождения"
										variant="outlined"
										fullWidth
										className="mt-20"
										value={dataSearchPatient.value?.birth_date ?? null}
										readOnly
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
										value={dataSearchPatient.value?.medical_card ?? ''}
										InputProps={{
											readOnly: true
										}}
									/>
								</Grid>

								<Grid item md={6} xs={12}>
									<TextField
										label="ИИН"
										variant="outlined"
										fullWidth
										className="mt-20"
										value={dataSearchPatient.value?.iin ?? ''}
										InputProps={{
											readOnly: true
										}}
									/>
								</Grid>
							</Grid>
							<Grid container spacing={2}>
								<Grid item md={6} xs={12}>
									<TextField
										label="Email"
										variant="outlined"
										fullWidth
										className="mt-20"
										value={dataSearchPatient.value?.email ?? ''}
										InputProps={{
											readOnly: true
										}}
									/>
								</Grid>
							</Grid>

							<div className="mt-28">
								<Typography color="secondary" className="text-lg font-bold">
									Услуги
								</Typography>

								<div className="mt-20">
									<TableServices
										initialList={listServices}
										isEdit={isEdit}
										onChange={setListServices}
									/>
								</div>
							</div>
							<div className="mt-28">
								<Typography color="secondary" className="text-lg font-bold">
									Медикаменты
								</Typography>

								<div className="mt-20">
									<TableProducts
										initialList={listMedications}
										isEdit={isEdit}
										onChange={setListMedications}
									/>
								</div>
							</div>
							<div className="flex justify-between mt-36">
								<div className="text-16 font-bold">
									Общая сумма приема: <Amount value={getTotalCost()} />
								</div>

								{statusForBlockReception && (
									<div>
										<span className="mr-10">Статус: </span>
										<BlockReceptionStatus status={statusForBlockReception} />
									</div>
								)}
							</div>

							{!isNew && (
								<div className="mt-36">
									<div className="flex justify-between">
										<Typography color="secondary" className="mb-20 text-lg font-bold">
											Результаты исследований
										</Typography>

										{isSend && <p className="text-success font-bold">Результаты были отправлены</p>}
									</div>

									<Files
										receptionUuid={currentLaboratoryReceptionUuid}
										isSend={!!data?.sent_results}
									/>
								</div>
							)}
						</div>
					)
				}
				footer={
					!isError && (
						<div className="flex">
							{isNew && (
								<Button
									variant="contained"
									color="primary"
									textNormal
									disabled={
										laboratoryReceptionCreate.isLoading ||
										laboratoryReceptionUpdate.isLoading ||
										isFetching
									}
									onClick={handleOnCreateLaboratoryReception}
								>
									Сохранить прием
								</Button>
							)}

							{statusIsConfirmed &&
								(isEdit ? (
									<Button
										variant="contained"
										color="primary"
										textNormal
										disabled={laboratoryReceptionUpdate.isLoading || isFetching}
										onClick={handleOnUpdateLaboratoryReception}
									>
										Сохранить прием
									</Button>
								) : (
									<Button
										variant="contained"
										color="primary"
										textNormal
										disabled={
											laboratoryReceptionCreate.isLoading ||
											laboratoryReceptionUpdate.isLoading ||
											isFetching
										}
										onClick={() => setIsEdit(true)}
									>
										Изменить прием
									</Button>
								))}

							{statusIsConfirmed && (
								<Button
									className="mx-10"
									variant="contained"
									color="primary"
									textNormal
									disabled={
										laboratoryReceptionCreate.isLoading ||
										laboratoryReceptionUpdate.isLoading ||
										laboratoryReceptionCheckout.isLoading ||
										isFetching
									}
									onClick={handleOnCheckoutLaboratoryReception}
								>
									Отправить на кассу
								</Button>
							)}

							{!isNew && (
								<Button
									variant="contained"
									color="primary"
									textNormal
									disabled={laboratoryReceptionSendResult.isLoading}
									onClick={handleOnSendLaboratoryReceptionResults}
								>
									Отправить результаты на почту
								</Button>
							)}
						</div>
					)
				}
			/>

			{isShowModalPatient && (
				<ModalPatient
					isOpen
					onClose={() => setIsShowModalPatient(false)}
					onUpdate={uuid => actionsSearchPatient.getByUuid(uuid)}
					patientsUuid={dataSearchPatient.value?.uuid ?? null}
				/>
			)}
		</>
	);
}
ModalLaboratoryReception.defaultProps = {
	laboratoryReceptionUuid: null,
	onUpdate: () => {}
};
ModalLaboratoryReception.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	laboratoryReceptionUuid: PropTypes.string,
	onClose: PropTypes.func.isRequired,
	onUpdate: PropTypes.func
};
