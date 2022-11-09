import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import { Grid, InputAdornment, Typography } from '@material-ui/core';
import FuseLoading from '../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../ErrorMessage';
import { Button, TextField, CurrencyTextField, SelectField, MenuItem, ServerAutocomplete } from '../../bizKITUi';
import { ModalClinicDirection } from '../ModalClinicDirection';
import { useAlert } from '../../hooks';
import { clinicService, employeesService, ENTITY, ENTITY_DEPS } from '../../services';
import { removeEmptyValuesFromObject, getFullName, defaults } from '../../utils';
import { modalPromise } from '../ModalPromise';
import { TableMedications } from './TableMedications';
import { TablePayouts } from './TablePayouts';
import { TableStates } from './TableStates';
import { normalizeNumberType } from '../../utils/normalizeNumber';

const defaultValues = {
	name: '',
	type: '',
	direction: '',
	duration: 5,
	doctor: null,
	cost: '',
	medications: [],
	payouts: [],
	states: []
};

export function FormService({ uuid, initialValues, onSave }) {
	const history = useHistory();
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	const listServiceTypes = clinicService.getServiceTypes();
	const { setError, errors, control, clearErrors, getValues, reset } = useForm({
		mode: 'onBlur',
		defaultValues: { ...defaultValues, ...removeEmptyValuesFromObject(initialValues) }
	});

	const { isLoading: isLoadingDirections, isError: isErrorLoadingDirections, data: listDirections } = useQuery(
		[ENTITY.DIRECTION, { limit: Number.MAX_SAFE_INTEGER }],
		({ queryKey }) => clinicService.getDirections(queryKey[1])
	);

	const getMedicationsForUpdate = () =>
		getValues('medications').map(medication => ({
			count: medication.count,
			product: medication.product.uuid,
			packing_unit: medication.packing_unit?.uuid,
			minimum_unit_of_measure: medication.minimum_unit_of_measure.uuid,
			amount_in_package: medication.amount_in_package,
			packing: medication.packing.uuid
		}));

	const getPayoutsForUpdate = () =>
		getValues('payouts').map(payout => ({
			...payout,
			counterparty: payout.counterparty?.uuid,
			group: payout.group?.id
		}));

	const getStatesForUpdate = () =>
		getValues('states').map(state => ({
			...state,
			state: state.state?.uuid
		}));

	const createService = useMutation(payload => clinicService.createClinicService(payload));
	const handleOnCreateClinicService = isCopy => {
		clearErrors();

		const payload = {
			...getValues(),
			medications: getMedicationsForUpdate(),
			states: getStatesForUpdate(),
			payouts: getPayoutsForUpdate()
		};

		createService
			.mutateAsync(payload)
			.then(({ data }) => {
				ENTITY_DEPS.SERVICE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess(isCopy ? 'Услуга успешно скопирована' : 'Услуга успешно создана');
				if (isCopy) {
					history.push(`/settings/service/${data.uuid}/edit`);
				}
				onSave();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать услугу');
			});
	};

	const updateService = useMutation(({ serviceUuid, payload }) =>
		clinicService.patchClinicService(serviceUuid, payload)
	);
	const handleOnUpdateClinicService = () => {
		clearErrors();

		const payload = {
			...getValues(),
			medications: getMedicationsForUpdate(),
			states: getStatesForUpdate(),
			payouts: getPayoutsForUpdate()
		};

		updateService
			.mutateAsync({ serviceUuid: uuid, payload })
			.then(() => {
				ENTITY_DEPS.SERVICE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Услуга успешно изменена');
				onSave();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось изменить услугу');
			});
	};

	const { isLoading: isLoadingService, isError: isErrorService, data } = useQuery([ENTITY.SERVICE, uuid], () => {
		if (uuid) {
			return clinicService.getServiceById(uuid);
		}
		return Promise.resolve();
	});

	useEffect(() => {
		if (!data) {
			return;
		}

		reset(
			defaults(
				{
					...data,
					direction: data.direction?.uuid,
					doctor: data.doctor?.uuid
				},
				defaultValues
			)
		);
	}, [data, reset]);

	const submitAction = uuid ? handleOnUpdateClinicService : handleOnCreateClinicService;

	if (isLoadingService || isLoadingDirections) {
		return <FuseLoading />;
	}
	if (isErrorService || isErrorLoadingDirections) {
		return <ErrorMessage />;
	}
	return (
		<div className="flex flex-col flex-auto h-full">
			<Grid container spacing={2}>
				<Grid item md={6} xs={12}>
					<Controller
						as={<TextField />}
						control={control}
						fullWidth
						label="Наименование"
						variant="outlined"
						name="name"
						error={!!errors.name}
						helperText={errors.name?.message}
					/>
				</Grid>

				<Grid item md={6} xs={12}>
					<Controller
						as={<TextField />}
						control={control}
						fullWidth
						label="Тип"
						variant="outlined"
						name="type"
						select
						error={!!errors.type}
						helperText={errors.type?.message}
					>
						<MenuItem value="">Все</MenuItem>
						{listServiceTypes.map(item => (
							<MenuItem key={item.type} value={item.type}>
								{item.name}
							</MenuItem>
						))}
					</Controller>
				</Grid>
			</Grid>

			<Grid container spacing={2}>
				<Grid item md={6} xs={12}>
					<Controller
						as={<SelectField />}
						control={control}
						className="mt-12"
						fullWidth
						label="Направление"
						variant="outlined"
						onAdd={() =>
							modalPromise.open(({ onClose }) => <ModalClinicDirection isOpen onClose={onClose} />)
						}
						name="direction"
						select
						error={!!errors.direction}
						helperText={errors.direction?.message}
					>
						<MenuItem value="">Все</MenuItem>
						{listDirections.results.map(item => (
							<MenuItem key={item.uuid} value={item.uuid}>
								{item.name}
							</MenuItem>
						))}
					</Controller>
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
								className="mt-12"
								InputProps={{
									error: !!errors.doctor,
									helperText: errors.doctor?.message
								}}
								onChange={value => onChange(value?.uuid ?? null)}
								onFetchList={(search, limit) =>
									employeesService.getDoctors({ search, limit }).then(res => res.data)
								}
								onFetchItem={fetchUuid => employeesService.getDoctor(fetchUuid).then(res => res.data)}
							/>
						)}
					/>
				</Grid>
			</Grid>

			<Grid container spacing={2}>
				<Grid item md={6} xs={12}>
					<Controller
						control={control}
						name="cost"
						render={({ value, onChange, onBlur }) => (
							<CurrencyTextField
								variant="outlined"
								label="Стоимость услуги"
								fullWidth
								className="mt-16"
								value={value}
								error={!!errors.cost}
								helperText={errors.cost?.message}
								onBlur={onBlur}
								onChange={(_, newValue) => onChange(newValue)}
							/>
						)}
					/>
				</Grid>

				<Grid item md={6} xs={12}>
					<Controller
						as={<TextField />}
						control={control}
						margin="normal"
						fullWidth
						inputProps={{ min: 5, step: 5 }}
						// eslint-disable-next-line react/jsx-no-duplicate-props
						InputProps={{
							endAdornment: <InputAdornment position="end">Минут</InputAdornment>
						}}
						label="Длительность"
						name="duration"
						variant="outlined"
						error={!!errors.duration}
						helperText={errors.duration?.message}
						onKeyPress={normalizeNumberType}
					/>
				</Grid>
			</Grid>

			<div className="mt-32">
				<Typography color="secondary" variant="subtitle1" className="font-bold mb-10">
					Автосписание медикаментов и расходников
				</Typography>

				<Controller
					control={control}
					name="medications"
					render={({ value, onChange }) => <TableMedications medications={value} onChange={onChange} />}
				/>
			</div>

			<div className="mt-32">
				<Typography color="secondary" variant="subtitle1" className="font-bold mb-10">
					Учёт расходных статей
				</Typography>

				<Controller
					control={control}
					name="states"
					render={({ value, onChange }) => <TableStates states={value} onChange={onChange} />}
				/>
			</div>

			<div className="mt-32">
				<Typography color="secondary" variant="subtitle1" className="font-bold mb-10">
					Выплаты партнерам/сотрудникам
				</Typography>

				<Controller
					control={control}
					name="payouts"
					render={({ value, onChange }) => <TablePayouts payouts={value} onChange={onChange} />}
				/>
			</div>

			<div className="flex pt-20 mt-auto">
				<Button
					textNormal
					type="submit"
					disabled={createService.isLoading || updateService.isLoading}
					onClick={() => submitAction()}
				>
					Сохранить
				</Button>
				{uuid && (
					<Button
						textNormal
						type="submit"
						variant="outlined"
						className="ml-10"
						disabled={createService.isLoading || updateService.isLoading}
						onClick={() => handleOnCreateClinicService(true)}
					>
						Копировать
					</Button>
				)}
			</div>
		</div>
	);
}

FormService.defaultProps = {
	uuid: null,
	initialValues: {},
	onSave: () => {}
};
FormService.propTypes = {
	uuid: PropTypes.string,
	initialValues: PropTypes.shape({
		name: PropTypes.string,
		type: PropTypes.oneOf(clinicService.getServiceTypes().map(({ type }) => type)),
		direction: PropTypes.string,
		doctor: PropTypes.instanceOf(Date),
		cost: PropTypes.string
	}),
	onSave: PropTypes.func
};
