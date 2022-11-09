import React, { useState, useEffect } from 'react';
import { Typography, Grid } from '@material-ui/core';
import { useForm, Controller } from 'react-hook-form';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useQuery, useMutation, useQueryClient } from 'react-query';
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
	hospitalService,
	patientsService,
	ENTITY,
	ENTITY_DEPS,
	employeesService,
	productsService
} from '../../services';
import { useAlert } from '../../hooks';
import { ErrorMessage } from '../ErrorMessage';
import { ModalPatient } from '../ModalPatient';
import { getFullName } from '../../utils';
import {
	STATUS_HOSPITAL_RECEPTION_CONFIRMED,
	STATUS_HOSPITAL_RECEPTION_CASH,
	STATUS_HOSPITAL_RECEPTION_PAID,
	STATUS_HOSPITAL_RECEPTION_WAITING
} from '../../services/hospital/constants';
import {
	STATUS_RECEPTION_CASH,
	STATUS_RECEPTION_CONFIRMED,
	STATUS_RECEPTION_PAID,
	TYPE_SERVICE_HOSPITAL,
	STATUS_RECEPTION_WAITING,
	TYPE_SERVICE_COMMON
} from '../../services/clinic/constants';
import { BlockReceptionStatus } from '../BlockReceptionStatus';

const statusMap = {
	[STATUS_HOSPITAL_RECEPTION_CASH]: STATUS_RECEPTION_CASH,
	[STATUS_HOSPITAL_RECEPTION_PAID]: STATUS_RECEPTION_PAID,
	[STATUS_HOSPITAL_RECEPTION_CONFIRMED]: STATUS_RECEPTION_CONFIRMED,
	[STATUS_HOSPITAL_RECEPTION_WAITING]: STATUS_RECEPTION_WAITING
};

const initialValues = {
	doctor: null
};

export function ModalHospitalReception({ isOpen, hospitalReceptionUuid, onClose, onUpdate }) {
	const { alertSuccess, alertError } = useAlert();
	const queryClient = useQueryClient();
	const [currentHospitalReceptionUuid, setCurrentHospitalReceptionUuid] = useState(hospitalReceptionUuid);
	const { isLoading, isFetching, isError, data } = useQuery(
		[ENTITY.HOSPITAL_RECEPTION, currentHospitalReceptionUuid],
		() => {
			if (currentHospitalReceptionUuid) {
				return hospitalService.getHospitalReception(currentHospitalReceptionUuid);
			}
			return Promise.resolve();
		}
	);
	const hospitalReceptionCreate = useMutation(hospitalService.createHospitalReceptions);
	const hospitalReceptionUpdate = useMutation(({ uuid, payload }) => {
		return hospitalService.updateHospitalReception(uuid, payload);
	});
	const hospitalReceptionCheckout = useMutation(({ uuid, payload }) =>
		hospitalService.checkoutHospitalReception(uuid, payload)
	);

	const {
		status: statusSearchPatient,
		actions: { getByUuid, ...actionsSearchPatient },
		data: dataSearchPatient
	} = useSearchPatient();

	const statusIsConfirmed = data?.status === STATUS_HOSPITAL_RECEPTION_CONFIRMED;
	const statusIsWaiting = data?.status === STATUS_HOSPITAL_RECEPTION_WAITING;
	const isNew = !currentHospitalReceptionUuid;
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
			data.services.map(item => ({
				serviceUuid: item.service.uuid,
				name: item.service.name,
				amount: item.count,
				cost: item.service.cost,
				clinicPatient: false
			}))
		);
		setListMedications(
			data.medications.map(item => ({
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
			doctor: data.doctor?.uuid ?? null
		});

		if (data.patient) {
			getByUuid(data.patient.uuid);
		}
	}, [data, reset, getByUuid]);

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
		const servicesTotalCost = listServices.reduce((prev, current) => {
			if (!current.clinicPatient) {
				return prev + current.amount * current.cost;
			}
			return prev;
		}, 0);
		const medicationsTotalCost = listMedications?.reduce(
			(prev, current) =>
				prev + productsService.getProductCost(current, current.packing, current.amount, current.cost),
			0
		);

		return servicesTotalCost + medicationsTotalCost;
	};

	const handleOnCreateHospitalReception = () => {
		clearErrors();
		hospitalReceptionCreate
			.mutateAsync({
				...getValues(),
				services: getStructuredArrayListServicesForSend(),
				medications: getStructuredArrayListMedicationsForSend(),
				patient: dataSearchPatient.value?.uuid
			})
			.then(results => {
				ENTITY_DEPS.HOSPITAL_RECEPTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Приём успешно создан');
				setCurrentHospitalReceptionUuid(results.uuid);
				setIsEdit(false);
				onUpdate(results.uuid);
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});
				alertError('Не удалось создать приём');
			});
	};

	const handleOnUpdateHospitalReception = () => {
		clearErrors();
		hospitalReceptionUpdate
			.mutateAsync({
				uuid: currentHospitalReceptionUuid,
				payload: {
					...getValues(),
					services: getStructuredArrayListServicesForSend(),
					medications: getStructuredArrayListMedicationsForSend(),
					patient: dataSearchPatient.value?.uuid
				}
			})
			.then(results => {
				ENTITY_DEPS.HOSPITAL_RECEPTION.forEach(dep => {
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

	const handleOnCheckoutHospitalReception = () => {
		clearErrors();
		const payload = {
			...getValues(),
			services: getStructuredArrayListServicesForSend(),
			medications: getStructuredArrayListMedicationsForSend(),
			patient: dataSearchPatient.value,
			status: data.status,
			date_time: data?.date_time,
			doctor: data?.doctor
		};

		hospitalReceptionCheckout
			.mutateAsync({ uuid: currentHospitalReceptionUuid, payload })
			.then(results => {
				ENTITY_DEPS.HOSPITAL_RECEPTION.forEach(dep => {
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

	const hospitalReceptionConfirm = useMutation(({ uuid, payload }) =>
		hospitalService.confirmHospitalReception(uuid, payload)
	);
	const handleOnConfirmHospitalReception = () => {
		clearErrors();
		const payload = {
			...getValues(),
			services: getStructuredArrayListServicesForSend(),
			medications: getStructuredArrayListMedicationsForSend(),
			patient: dataSearchPatient.value,
			status: data.status,
			date_time: data?.date_time,
			doctor: data?.doctor
		};

		hospitalReceptionConfirm
			.mutateAsync({ uuid: currentHospitalReceptionUuid, payload })
			.then(results => {
				ENTITY_DEPS.HOSPITAL_RECEPTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Прием успешно подтвержден!');
				onUpdate(results.uuid);
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});
				alertError('Не удалось подтвердить прием');
			});
	};

	const isLoadingCreate = hospitalReceptionUuid && !data && isLoading;

	return (
		<>
			<DrawerTemplate
				isOpen={isOpen}
				close={onClose}
				width="md"
				isLoading={isLoadingCreate}
				header={
					<Typography color="secondary" className="text-xl font-bold text-center">
						Прием
					</Typography>
				}
				content={
					isLoadingCreate ? (
						<></>
					) : isError ? (
						<ErrorMessage />
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
															service_type: TYPE_SERVICE_HOSPITAL
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
										name="referring_physician"
										render={({ onChange, ...props }) => (
											<ServerAutocomplete
												{...props}
												getOptionLabel={option => getFullName(option)}
												label="Направляющий врач"
												readOnly={!isEdit}
												InputProps={{
													error: !!errors.referring_physician,
													helperText: errors.referring_physician?.message
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
										disabled={!isEdit}
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

								{data?.status && (
									<div>
										<span className="mr-10">Статус: </span>
										<BlockReceptionStatus status={statusMap[data?.status]} />
									</div>
								)}
							</div>
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
										hospitalReceptionCreate.isLoading ||
										hospitalReceptionUpdate.isLoading ||
										isFetching
									}
									onClick={handleOnCreateHospitalReception}
								>
									Сохранить прием
								</Button>
							)}

							{statusIsWaiting && (
								<Button
									variant="contained"
									textNormal
									customColor="accent"
									disabled={
										hospitalReceptionCreate.isLoading ||
										hospitalReceptionUpdate.isLoading ||
										isFetching
									}
									onClick={handleOnConfirmHospitalReception}
								>
									Подтвердить прием
								</Button>
							)}

							{statusIsConfirmed &&
								(isEdit ? (
									<Button
										variant="contained"
										color="primary"
										textNormal
										disabled={hospitalReceptionUpdate.isLoading || isFetching}
										onClick={handleOnUpdateHospitalReception}
									>
										Сохранить прием
									</Button>
								) : (
									<Button
										variant="contained"
										color="primary"
										textNormal
										disabled={hospitalReceptionUpdate.isLoading || isFetching}
										onClick={() => setIsEdit(true)}
									>
										Изменить прием
									</Button>
								))}

							{statusIsConfirmed && (
								<Button
									className="ml-10"
									variant="contained"
									color="primary"
									textNormal
									disabled={
										hospitalReceptionCheckout.isLoading ||
										hospitalReceptionUpdate.isLoading ||
										isFetching
									}
									onClick={handleOnCheckoutHospitalReception}
								>
									Отправить на кассу
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
					onUpdate={uuid => getByUuid(uuid)}
					patientsUuid={dataSearchPatient.value?.uuid ?? null}
				/>
			)}
		</>
	);
}
ModalHospitalReception.defaultProps = {
	hospitalReceptionUuid: null,
	onUpdate: () => {}
};
ModalHospitalReception.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	hospitalReceptionUuid: PropTypes.string,
	onClose: PropTypes.func.isRequired,
	onUpdate: PropTypes.func
};
