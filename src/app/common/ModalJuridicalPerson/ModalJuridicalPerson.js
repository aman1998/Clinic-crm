import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import { Grid, Typography } from '@material-ui/core';
import { Button, TextField, DrawerTemplate, PhoneField, InputMask, ServerAutocomplete } from '../../bizKITUi';
import { useAlert } from '../../hooks';
import { employeesService, ENTITY, ENTITY_DEPS, patientsService } from '../../services';
import { ErrorMessage } from '../ErrorMessage';
import { defaults, getFullName } from '../../utils';
import { OptionPatient } from '../OptionPatient';

const defaultValues = {
	patient: null,
	name: '',
	address: '',
	bin: '',
	bank: '',
	bic: '',
	iic: '',
	head_position: '',
	head_full_name: '',
	email: '',
	phone: ''
};

export function ModalJuridicalPerson({ isOpen, personUuid, initialValues, onClose }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	const { control, errors, getValues, setError, reset } = useForm({
		mode: 'onBlur',
		defaultValues: defaults(initialValues, defaultValues)
	});

	const { isLoading, isError, data } = useQuery(
		[ENTITY.JURIDICAL_PERSON, personUuid],
		() => employeesService.getJuridicalPerson(personUuid),
		{ enabled: !!personUuid }
	);
	useEffect(() => {
		if (!data) {
			return;
		}
		reset(defaults({ ...data, patient: data.patient?.uuid }, defaultValues));
	}, [data, reset]);

	const createPerson = useMutation(payload => employeesService.createJuridicalPerson(payload));
	const handleCreate = () => {
		createPerson
			.mutateAsync(getValues())
			.then(() => {
				ENTITY_DEPS.JURIDICAL_PERSON.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Юридическое лицо успешно создано');
				onClose();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать юридическое лицо');
			});
	};

	const updatePerson = useMutation(({ uuid, payload }) => employeesService.updateJuridicalPerson(uuid, payload));
	const handleUpdate = () => {
		updatePerson
			.mutateAsync({ uuid: personUuid, payload: getValues() })
			.then(() => {
				ENTITY_DEPS.JURIDICAL_PERSON.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Юридическое лицо успешно обновлено');
				onClose();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось обновить юридическое лицо');
			});
	};

	const title = personUuid ? 'Изменить юридическое лицо' : 'Добавить юридическое лицо';
	const action = personUuid ? handleUpdate : handleCreate;

	return (
		<>
			<DrawerTemplate
				isOpen={isOpen}
				close={onClose}
				width="sm"
				isLoading={isLoading}
				header={
					<Typography color="secondary" className="text-xl font-bold text-center">
						{title}
					</Typography>
				}
				content={
					isError ? (
						<ErrorMessage />
					) : (
						<>
							<Controller
								control={control}
								name="patient"
								render={({ onChange, ...props }) => (
									<ServerAutocomplete
										{...props}
										getOptionLabel={option => getFullName(option)}
										renderOption={option => <OptionPatient patient={option} />}
										label="Связанный пациент"
										margin="normal"
										fullWidth
										InputProps={{
											error: !!errors.patient,
											helperText: errors.patient?.message
										}}
										onFetchList={search =>
											patientsService
												.getPatients({
													search,
													limit: 10
												})
												.then(({ data: response }) => response.results)
										}
										onFetchItem={uuid =>
											patientsService.getPatientByUuid(uuid).then(res => res.data)
										}
										onChange={value => onChange(value?.uuid ?? null)}
									/>
								)}
							/>
							<Controller
								as={<TextField />}
								control={control}
								fullWidth
								required
								label="Юридическое наименование"
								name="name"
								type="text"
								margin="normal"
								variant="outlined"
								error={!!errors.name}
								helperText={errors.name?.message}
							/>
							<Controller
								as={<TextField />}
								control={control}
								fullWidth
								label="Юридический адрес"
								name="address"
								type="text"
								margin="normal"
								variant="outlined"
								error={!!errors.address}
								helperText={errors.address?.message}
							/>
							<Controller
								as={
									<InputMask mask="999999999999">
										<TextField />
									</InputMask>
								}
								control={control}
								fullWidth
								label="БИН/ИИН"
								name="bin"
								type="text"
								margin="normal"
								variant="outlined"
								error={!!errors.bin}
								helperText={errors.bin?.message}
							/>
							<Grid container spacing={2}>
								<Grid xs={6} item>
									<Controller
										as={<TextField />}
										control={control}
										fullWidth
										label="Банк"
										name="bank"
										type="text"
										margin="normal"
										variant="outlined"
										error={!!errors.bank}
										helperText={errors.bank?.message}
									/>
								</Grid>
								<Grid xs={6} item>
									<Controller
										as={<TextField />}
										control={control}
										fullWidth
										label="БИК"
										name="bic"
										type="text"
										margin="normal"
										variant="outlined"
										error={!!errors.bic}
										helperText={errors.bic?.message}
									/>
								</Grid>
							</Grid>
							<Controller
								as={
									<InputMask mask="99999999999999999999">
										<TextField />
									</InputMask>
								}
								control={control}
								fullWidth
								label="ИИК"
								name="iic"
								type="text"
								margin="normal"
								variant="outlined"
								error={!!errors.iic}
								helperText={errors.iic?.message}
							/>
							<Controller
								as={<TextField />}
								control={control}
								fullWidth
								label="Должность руководителя"
								name="head_position"
								type="text"
								margin="normal"
								variant="outlined"
								error={!!errors.head_position}
								helperText={errors.head_position?.message}
							/>
							<Controller
								as={<TextField />}
								control={control}
								fullWidth
								label="ФИО руководителя"
								name="head_full_name"
								type="text"
								margin="normal"
								variant="outlined"
								error={!!errors.head_full_name}
								helperText={errors.head_full_name?.message}
							/>
							<Controller
								as={<TextField />}
								control={control}
								fullWidth
								label="Email"
								name="email"
								type="email"
								margin="normal"
								variant="outlined"
								error={!!errors.email}
								helperText={errors.email?.message}
							/>
							<Controller
								as={<PhoneField />}
								control={control}
								fullWidth
								label="Телефон"
								name="phone"
								type="tel"
								margin="normal"
								variant="outlined"
								error={!!errors.phone}
								helperText={errors.phone?.message}
							/>
						</>
					)
				}
				footer={
					<Button
						variant="contained"
						color="primary"
						disabled={isError || createPerson.isLoading || updatePerson.isLoading}
						textNormal
						onClick={action}
					>
						Сохранить
					</Button>
				}
			/>
		</>
	);
}

ModalJuridicalPerson.defaultProps = {
	personUuid: null,
	initialValues: {}
};
ModalJuridicalPerson.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	initialValues: PropTypes.shape({
		patient: PropTypes.string,
		name: PropTypes.string,
		address: PropTypes.string,
		bin: PropTypes.string,
		bank: PropTypes.string,
		bic: PropTypes.string,
		iic: PropTypes.string,
		head_position: PropTypes.string,
		head_full_name: PropTypes.string,
		email: PropTypes.string,
		phone: PropTypes.string
	}),
	personUuid: PropTypes.string
};
