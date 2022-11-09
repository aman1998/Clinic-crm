import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Controller, useForm } from 'react-hook-form';
import { MenuItem, InputAdornment } from '@material-ui/core';
import { DialogSimpleTemplate, Autocomplete, Button, TextField, ServerAutocomplete } from '../../bizKITUi';
import { OptionPatient } from '../OptionPatient';
import { CallButton } from '../CallButton';
import { useSearchPatient } from '../hooks/useSearchPatient';
import { ModalPatient } from '../ModalPatient';
import { useAlert } from '../../hooks';
import { clinicService, employeesService, ENTITY, ENTITY_DEPS, patientsService } from '../../services';
import { TYPE_SERVICE_COMMON } from '../../services/clinic/constants';
import FuseLoading from '../../../@fuse/core/FuseLoading';
import { defaults, getFullName } from '../../utils';
import { ErrorMessage } from '../ErrorMessage';

const defaultValues = {
	doctor: null,
	direction: null,
	service: null,
	priority: '',
	comment: ''
};

const priorityList = clinicService.getPriorityReserve();

export function ModalReserve({ isOpen, reserveUuid, initialValues, onUpdate, onClose }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();
	const title = reserveUuid ? 'Редактирование резерва' : 'Добавить новый резерв';

	const { errors, control, watch, setError, setValue, reset, clearErrors, getValues } = useForm({
		mode: 'onBlur',
		defaultValues: defaults(initialValues, defaultValues)
	});
	const watchFields = watch(['direction', 'doctor', 'service']);

	const { isLoading, isError, data } = useQuery(
		[ENTITY.RESERVE, reserveUuid],
		({ queryKey }) => clinicService.getReserveByUuid(queryKey[1]).then(res => res.data),
		{ enabled: !!reserveUuid }
	);
	useEffect(() => {
		if (!data) {
			return;
		}
		reset(
			defaults(
				{
					doctor: data.service.doctor.uuid ?? null,
					direction: data.service.direction.uuid ?? null,
					service: data.service ?? null,
					priority: data.priority ?? '',
					comment: data.comment ?? ''
				},
				defaultValues
			)
		);
		actionsSearchPatient.getByUuid(data.patient.uuid);
	}, [data, actionsSearchPatient, reset]);

	const handleOnChangeClinicService = value => {
		setValue('service', value);
		setValue('direction', value?.direction ?? null);
		setValue('doctor', value?.doctor ?? null);
	};

	const { status: statusSearchPatient, actions: actionsSearchPatient, data: dataSearchPatient } = useSearchPatient();
	const { getByUuid: getByUuidSearchPatient } = actionsSearchPatient;
	useEffect(() => {
		if (!initialValues.patient) {
			return;
		}

		getByUuidSearchPatient(initialValues.patient);
	}, [getByUuidSearchPatient, initialValues.patient]);

	const [isShowModalPatient, setIsShowModalPatient] = useState(false);

	const displayNameSelectedPatient = dataSearchPatient.value ? getFullName(dataSearchPatient.value) : '';

	const createReserve = useMutation(payload => clinicService.createReserve(payload));
	const handleOnCreateReserve = () => {
		clearErrors();

		const values = getValues();
		const payload = {
			service: values.service?.uuid,
			patient: dataSearchPatient.value?.uuid,
			priority: values.priority,
			comment: values.comment
		};

		createReserve
			.mutateAsync(payload)
			.then(() => {
				ENTITY_DEPS.RESERVE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				onUpdate();
				onClose();
				alertSuccess('Резерв успешно создан');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать резерв');
			});
	};

	const updateReserve = useMutation(({ uuid, payload }) => clinicService.updateReserveByUuid(uuid, payload));
	const handleOnUpdateReserve = () => {
		clearErrors();

		const values = getValues();
		const payload = {
			service: values.service?.uuid,
			patient: dataSearchPatient.value?.uuid,
			priority: values.priority,
			comment: values.comment
		};

		updateReserve
			.mutateAsync({ uuid: reserveUuid, payload })
			.then(() => {
				ENTITY_DEPS.RESERVE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				onUpdate();
				onClose();
				alertSuccess('Резерв успешно изменён');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось изменить резерв');
			});
	};

	const handleOnSubmit = event => {
		event.preventDefault();

		if (reserveUuid) {
			handleOnUpdateReserve();
		} else {
			handleOnCreateReserve();
		}
	};

	return (
		<>
			<DialogSimpleTemplate isOpen={isOpen} onClose={onClose} header={<>{title}</>} maxWidth="xs">
				{isLoading ? (
					<FuseLoading />
				) : isError ? (
					<ErrorMessage />
				) : (
					<form onSubmit={handleOnSubmit}>
						<Autocomplete
							isLoading={statusSearchPatient.isLoading}
							options={dataSearchPatient.listPatient}
							getOptionLabel={option => option && getFullName(option)}
							filterOptions={options => options}
							getOptionSelected={(option, value) => option.uuid === value.uuid}
							onChange={(_, value) => actionsSearchPatient.setValue(value)}
							onOpen={() => actionsSearchPatient.update(dataSearchPatient.keyword)}
							onInputChange={(_, newValue) => actionsSearchPatient.update(newValue)}
							fullWidth
							value={dataSearchPatient.value}
							renderOption={option => <OptionPatient patient={option} />}
							renderInput={params => (
								<TextField {...params} label="Поиск по ФИО, телефону, ИИН" variant="outlined" />
							)}
						/>

						<div className="mt-12 text-right">
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
									onClick={() => setIsShowModalPatient(true)}
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
								value={displayNameSelectedPatient}
								name="patient"
								error={!!errors.patient}
								helperText={errors.patient?.message}
							/>
						</div>

						<TextField
							label="Номер телефона"
							variant="outlined"
							fullWidth
							className="mt-20"
							InputProps={{
								readOnly: true,
								endAdornment: (
									<InputAdornment position="end">
										<CallButton
											phoneNumber={patientsService.getPatientMainPhone(dataSearchPatient.value)}
										/>
									</InputAdornment>
								)
							}}
							value={patientsService.getPatientMainPhone(dataSearchPatient.value)}
						/>

						<TextField
							label="ИИН"
							variant="outlined"
							fullWidth
							className="mt-20"
							InputProps={{
								readOnly: true
							}}
							value={dataSearchPatient.value?.iin ?? ''}
						/>

						<Controller
							control={control}
							name="direction"
							render={({ onChange, ...props }) => (
								<ServerAutocomplete
									{...props}
									getOptionLabel={option => option.name}
									label="Направление"
									className="mt-20"
									onChange={value => onChange(value?.uuid ?? null)}
									onFetchList={name =>
										clinicService
											.getDirections({
												name,
												limit: 10,
												service_type: TYPE_SERVICE_COMMON,
												doctor: watchFields.doctor,
												service: watchFields.service?.uuid
											})
											.then(({ results }) => results)
									}
									onFetchItem={uuid => clinicService.getDirectionById(uuid)}
								/>
							)}
						/>

						<Controller
							control={control}
							name="doctor"
							render={({ onChange, ...props }) => (
								<ServerAutocomplete
									{...props}
									getOptionLabel={option => getFullName(option)}
									label="Врач"
									className="mt-20"
									onChange={value => onChange(value?.uuid ?? null)}
									onFetchList={search =>
										employeesService
											.getDoctors({
												search,
												limit: 10,
												service_type: TYPE_SERVICE_COMMON,
												direction: watchFields.direction,
												services: watchFields.service?.uuid
											})
											.then(res => res.data.results)
									}
									onFetchItem={uuid => employeesService.getDoctor(uuid).then(res => res.data)}
								/>
							)}
						/>

						<Controller
							control={control}
							name="service"
							render={({ onChange, ...props }) => (
								<ServerAutocomplete
									{...props}
									getOptionLabel={option => option.name}
									label="Услуга"
									className="mt-20"
									onChange={value => handleOnChangeClinicService(value)}
									onFetchList={search =>
										clinicService
											.getServices({
												search,
												limit: 10,
												type: TYPE_SERVICE_COMMON,
												direction: watchFields.direction,
												doctor: watchFields.doctor
											})
											.then(res => res.data.results)
									}
									onFetchItem={uuid => clinicService.getServiceById(uuid)}
									error={!!errors.service}
									helperText={errors.service?.message}
								/>
							)}
						/>

						<Controller
							control={control}
							name="priority"
							as={
								<TextField select label="Приоритет" variant="outlined" fullWidth className="mt-20">
									<MenuItem value="">Все</MenuItem>
									{priorityList.map(item => (
										<MenuItem key={item.type} value={item.type}>
											{item.name}
										</MenuItem>
									))}
								</TextField>
							}
						/>

						<Controller
							control={control}
							as={<TextField />}
							label="Комментарий"
							variant="outlined"
							fullWidth
							rows={3}
							multiline
							className="mt-20"
							name="comment"
							error={!!errors.message}
							helperText={errors.message?.message}
						/>

						<Button
							fullWidth
							type="submit"
							className="mt-20"
							textNormal
							disabled={createReserve.isLoading || updateReserve.isLoading}
						>
							Сохранить резерв
						</Button>
					</form>
				)}
			</DialogSimpleTemplate>
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
ModalReserve.defaultProps = {
	reserveUuid: null,
	initialValues: {},
	onUpdate: () => {}
};
ModalReserve.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	reserveUuid: PropTypes.string,
	initialValues: PropTypes.shape({
		doctor: PropTypes.string,
		direction: PropTypes.string,
		patient: PropTypes.string,
		service: PropTypes.string,
		priority: PropTypes.string,
		comment: PropTypes.string
	}),
	onClose: PropTypes.func.isRequired,
	onUpdate: PropTypes.func
};
