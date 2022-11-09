import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Controller, useForm } from 'react-hook-form';
import { Grid, Typography, InputAdornment, IconButton } from '@material-ui/core';
import { Delete as DeleteIcon } from '@material-ui/icons';
import {
	InputMask,
	PhoneField,
	Button,
	TextField,
	DatePickerField,
	MenuItem,
	ServerAutocomplete
} from '../../bizKITUi';
import { ENTITY, ENTITY_DEPS, patientsService } from '../../services';
import { CallButton } from '../CallButton';
import { useAutoAge } from '../hooks/useAutoAge';
import { useAlert } from '../../hooks';
import { ErrorMessage } from '../ErrorMessage';
import { getFullName, removeEmptyValuesFromObject } from '../../utils';
import FuseLoading from '../../../@fuse/core/FuseLoading';
import { ModalPatientCallsHistory } from '../ModalPatientCallsHistory';
import { OptionPatient } from '../OptionPatient';

const initialFieldList = {
	last_name: '',
	first_name: '',
	middle_name: '',
	email: '',
	gender: '',
	birth_date: null,
	medical_card: '',
	iin: '',
	job: '',
	profession: '',
	position: '',
	main_phone: '',
	responsible: null,
	licence_number: '',
	licence_issuance_date: null,
	instagram_username: '',
	address: {
		region: '',
		locality: '',
		district: '',
		street: '',
		house: '',
		building: '',
		apartment: ''
	},
	phones: [],
	relative_contacts: []
};

export function FormPatient({ initialValues, patientsUuid, onUpdate, setPatientUuid }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();
	const { form: formAutoAge, handleOnChangeAge, handleOnChangeDate } = useAutoAge();

	const { control, getValues, watch, reset, errors, setError, clearErrors, setValue } = useForm({
		mode: 'onBlur',
		defaultValues: { ...initialFieldList, ...removeEmptyValuesFromObject(initialValues) }
	});
	const watchFields = watch(['responsible', 'phones', 'birth_date', 'relative_contacts']);

	const setErrors = ({ fieldErrors }) => {
		fieldErrors?.forEach(item => {
			if (item.field === 'address') {
				item.message?.forEach(({ field, message }) => {
					setError(`address.${field}`, { message });
				});

				return;
			}
			if (item.field === 'relative_contacts') {
				item.message?.forEach((items, index) => {
					items?.forEach(({ field, message }) => {
						setError(`relative_contacts.${index}.${field}`, { message });
					});
				});

				return;
			}

			setError(item.field, { message: item.message });
		});
	};

	const [currentPatientUuid, setCurrentPatientUuid] = useState(patientsUuid);
	const { isLoading: isLoadingPatient, isError: isErrorPatient, data: dataPatient } = useQuery(
		[ENTITY.PATIENT, currentPatientUuid],
		() => patientsService.getPatientByUuid(currentPatientUuid).then(({ data }) => data),
		{ enabled: !!currentPatientUuid }
	);

	useEffect(() => {
		if (!dataPatient) {
			return;
		}

		const newValues = Object.fromEntries(Object.entries(dataPatient).filter(([_, item]) => !!item));
		const address = dataPatient.address
			? Object.fromEntries(Object.entries(dataPatient.address).filter(([_, item]) => !!item))
			: {};

		reset({
			...initialFieldList,
			...removeEmptyValuesFromObject(initialValues),
			...newValues,
			...address
		});
	}, [dataPatient, initialValues, reset]);

	const [isShowModalPatientCallsHistory, setIsShowModalPatientCallsHistory] = useState(false);

	const createPatient = useMutation(payload => patientsService.createPatient(payload));
	const handleOnCreatePatient = () => {
		clearErrors();

		const values = getValues();
		const payload = {
			...values,
			responsible: values.responsible?.uuid
		};

		createPatient
			.mutateAsync(payload)
			.then(({ data }) => {
				onUpdate(data.uuid);
				ENTITY_DEPS.PATIENT.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Новый пациент добавлен');
				setPatientUuid(data.uuid);
			})
			.catch(error => {
				setErrors(error);
				alertError('Не удалось добавить пациента');
			});
	};

	const updatePatient = useMutation(({ uuid, payload }) => patientsService.updatePatientByUuid(uuid, payload));
	const handleOnUpdatePatient = () => {
		clearErrors();

		const values = getValues();
		const payload = {
			...values,
			responsible: values.responsible?.uuid
		};

		updatePatient
			.mutateAsync({ uuid: currentPatientUuid, payload })
			.then(({ data }) => {
				onUpdate(data.uuid);
				ENTITY_DEPS.PATIENT.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Информация успешно изменена');
			})
			.catch(error => {
				setErrors(error);
				alertError('Не удалось изменить информацию');
			});
	};

	const handleOnAddPhoneField = () => {
		const values = getValues();
		const phones = values.phones ?? [];

		reset(
			{
				...values,
				relative_contacts: watchFields.relative_contacts,
				phones: [...phones, { number: '' }]
			},
			{ errors: true }
		);
	};
	const handleOnDeletePhoneField = index => {
		const values = getValues();
		const phones = watchFields.phones.slice();

		phones.splice(index, 1);

		reset(
			{
				...values,
				relative_contacts: watchFields.relative_contacts,
				phones
			},

			{ errors: true }
		);
	};

	const handleOnAddRelativeContactField = () => {
		const values = getValues();
		const relative_contacts = values.relative_contacts ?? [];

		reset(
			{
				...values,
				phones: watchFields.phones,
				relative_contacts: [...relative_contacts, { name: '', number: '' }]
			},
			{ errors: true }
		);
	};
	const handleOnDeleteRelativeContactField = index => {
		const values = getValues();
		const relative_contacts = watchFields.relative_contacts.slice();

		relative_contacts.splice(index, 1);

		reset(
			{
				...values,
				phones: watchFields.phones,
				relative_contacts
			},

			{ errors: true }
		);
	};

	const patientGenderList = patientsService.getGenderList();

	useEffect(() => {
		setValue('birth_date', formAutoAge.date);
	}, [formAutoAge.date, setValue]);
	useEffect(() => {
		if (watchFields.birth_date) {
			handleOnChangeDate(watchFields.birth_date);
		}
	}, [handleOnChangeDate, watchFields.birth_date]);

	const submitAction = currentPatientUuid ? handleOnUpdatePatient : handleOnCreatePatient;

	return isLoadingPatient ? (
		<FuseLoading />
	) : isErrorPatient ? (
		<ErrorMessage />
	) : (
		<>
			<Controller
				as={<TextField />}
				control={control}
				variant="outlined"
				label="Фамилия"
				name="last_name"
				fullWidth
				className="mt-16"
				error={!!errors.last_name}
				helperText={errors.last_name?.message}
			/>

			<Controller
				as={<TextField />}
				control={control}
				variant="outlined"
				label="Имя"
				name="first_name"
				fullWidth
				className="mt-16"
				error={!!errors.first_name}
				helperText={errors.first_name?.message}
			/>

			<Controller
				as={<TextField />}
				control={control}
				variant="outlined"
				label="Отчество"
				name="middle_name"
				fullWidth
				className="mt-16"
				error={!!errors.middle_name}
				helperText={errors.middle_name?.message}
			/>

			<Controller
				as={<TextField />}
				control={control}
				variant="outlined"
				label="Email"
				type="email"
				name="email"
				fullWidth
				className="mt-16"
				error={!!errors.email}
				helperText={errors.email?.message}
			/>

			<Grid container spacing={2} className="mt-10">
				<Grid item md={4} xs={12}>
					<Controller
						as={<TextField />}
						control={control}
						variant="outlined"
						label="Пол"
						name="gender"
						fullWidth
						select
						error={!!errors.gender}
						helperText={errors.gender?.message}
					>
						{patientGenderList.map(item => (
							<MenuItem key={item.type} value={item.type}>
								{item.name}
							</MenuItem>
						))}
					</Controller>
				</Grid>

				<Grid item md={5} xs={12}>
					<Controller
						as={<DatePickerField />}
						control={control}
						label="Дата рождения"
						fullWidth
						onlyValid
						name="birth_date"
						error={!!errors.birth_date}
						helperText={errors.birth_date?.message}
					/>
				</Grid>

				<Grid item md={3} xs={12}>
					<TextField
						variant="outlined"
						label="Возраст"
						fullWidth
						value={formAutoAge.age}
						onChange={event => handleOnChangeAge(event.target.value)}
					/>
				</Grid>
			</Grid>

			<Grid container spacing={2} className="mt-10">
				<Grid item md={6} xs={12}>
					<Controller
						as={<TextField />}
						control={control}
						variant="outlined"
						label="Номер медицинской карты"
						name="medical_card"
						fullWidth
						error={!!errors.medical_card}
						helperText={errors.medical_card?.message}
					/>
				</Grid>

				<Grid item md={6} xs={12}>
					<Controller
						control={control}
						name="iin"
						render={props => (
							<InputMask
								{...props}
								mask="999999999999"
								variant="outlined"
								label="ИИН"
								fullWidth
								error={!!errors.iin}
								helperText={errors.iin?.message}
							>
								<TextField />
							</InputMask>
						)}
					/>
				</Grid>
			</Grid>

			<Grid container spacing={2} className="mt-10">
				<Grid item xs={12}>
					<Controller
						as={<TextField />}
						control={control}
						variant="outlined"
						label="Instagram"
						name="instagram_username"
						fullWidth
						error={!!errors.instagram_username}
						helperText={errors.instagram_username?.message}
					/>
				</Grid>
			</Grid>

			<Typography variant="subtitle1" className="mt-28 font-bold">
				Ответственный
			</Typography>
			<Grid container spacing={2}>
				<Grid item md={8} xs={12}>
					<Controller
						as={ServerAutocomplete}
						control={control}
						name="responsible"
						getOptionLabel={option => getFullName(option)}
						renderOption={option => <OptionPatient patient={option} />}
						label="Поиск по ФИО, телефону, ИИН"
						className="mt-16"
						InputProps={{
							error: !!errors.responsible,
							helperText: errors.responsible?.message
						}}
						onFetchList={(search, limit) =>
							patientsService.getPatients({ search, limit }).then(({ data }) => data)
						}
						onFetchItem={fetchUuid => patientsService.getPatientByUuid(fetchUuid).then(({ data }) => data)}
					/>
				</Grid>

				<Grid item md={4} xs={12}>
					<PhoneField
						value={watchFields.responsible?.main_phone ?? ''}
						variant="outlined"
						label="Телефон"
						fullWidth
						InputProps={{
							readOnly: true
						}}
						className="mt-16"
					/>
				</Grid>
			</Grid>

			<div className="flex justify-between mt-28">
				<Typography variant="subtitle1" className="font-bold">
					Номера телефонов
				</Typography>
				{dataPatient?.uuid && (
					<Button
						edge="end"
						textNormal
						variant="text"
						onClick={() => setIsShowModalPatientCallsHistory(true)}
					>
						История звонков
					</Button>
				)}
			</div>

			<ServerAutocomplete
				getOptionLabel={option => getFullName(option)}
				fullWidth
				label="Поиск по ФИО, телефону, ИИН"
				className="mt-16"
				renderOption={option => <OptionPatient patient={option} />}
				onFetchList={(search, limit) => patientsService.getPatients({ search, limit }).then(res => res.data)}
				onFetchItem={fetchUuid => patientsService.getPatientByUuid(fetchUuid).then(res => res.data)}
				onChange={value => setCurrentPatientUuid(value?.uuid ?? null)}
			/>

			<Controller
				control={control}
				name="main_phone"
				render={props => (
					<PhoneField
						{...props}
						label="Номер телефона"
						fullWidth
						className="mt-16"
						error={!!errors.main_phone}
						helperText={errors.main_phone?.message}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<CallButton phoneNumber={props.value} />
								</InputAdornment>
							)
						}}
					/>
				)}
			/>
			{watchFields.phones.map((item, index) => (
				<div key={index} className="flex items-center mt-16">
					<Controller
						key={index}
						control={control}
						name={`phones[${index}].number`}
						render={props => (
							<PhoneField
								{...props}
								label="Номер телефона"
								fullWidth
								error={!!errors.phones?.[index]?.number}
								helperText={errors.phones?.[index]?.number?.message}
							/>
						)}
					/>

					<IconButton
						aria-label="Удалить поле с номером телефона"
						className="ml-10"
						onClick={() => handleOnDeletePhoneField(index)}
					>
						<DeleteIcon />
					</IconButton>
				</div>
			))}

			<Button variant="text" textNormal className="mt-10" onClick={handleOnAddPhoneField}>
				+ Добавить номер
			</Button>

			<Typography variant="subtitle1" className="font-bold mt-28">
				Контакты близких
			</Typography>

			{watchFields.relative_contacts.map((item, index) => (
				<div key={index} className="flex items-top mt-16">
					<Controller
						as={<TextField />}
						control={control}
						key={`name-${index}`}
						variant="outlined"
						label="Имя"
						className="mr-12"
						name={`relative_contacts[${index}].name`}
						fullWidth
						error={!!errors.relative_contacts?.[index]?.name}
						helperText={errors.relative_contacts?.[index]?.name?.message}
					/>
					<Controller
						key={`number-${index}`}
						control={control}
						name={`relative_contacts[${index}].number`}
						render={props => (
							<PhoneField
								{...props}
								label="Номер телефона"
								fullWidth
								error={!!errors.relative_contacts?.[index]?.number}
								helperText={errors.relative_contacts?.[index]?.number?.message}
							/>
						)}
					/>

					<IconButton
						aria-label="Удалить поле контакта"
						className="ml-10"
						onClick={() => handleOnDeleteRelativeContactField(index)}
					>
						<DeleteIcon />
					</IconButton>
				</div>
			))}

			<Button variant="text" textNormal className="mt-10" onClick={handleOnAddRelativeContactField}>
				+ Добавить контакт
			</Button>

			<Typography variant="subtitle1" className="font-bold mt-28">
				Адрес
			</Typography>

			<Grid container spacing={2} className="mt-10">
				<Grid item md={6} xs={12}>
					<Controller
						as={<TextField />}
						control={control}
						variant="outlined"
						label="Область"
						name="address.region"
						fullWidth
						error={!!errors.address?.region}
						helperText={errors.address?.region?.message}
					/>
				</Grid>
				<Grid item md={6} xs={12}>
					<Controller
						as={<TextField />}
						control={control}
						variant="outlined"
						label="Населенный пункт"
						name="address.locality"
						fullWidth
						error={!!errors.address?.locality}
						helperText={errors.address?.locality?.message}
					/>
				</Grid>
			</Grid>

			<Grid container spacing={2} className="mt-10">
				<Grid item md={6} xs={12}>
					<Controller
						as={<TextField />}
						control={control}
						variant="outlined"
						label="Район"
						name="address.district"
						fullWidth
						error={!!errors.address?.district}
						helperText={errors.address?.district?.message}
					/>
				</Grid>
				<Grid item md={6} xs={12}>
					<Controller
						as={<TextField />}
						control={control}
						variant="outlined"
						label="Улица"
						name="address.street"
						fullWidth
						error={!!errors.address?.street}
						helperText={errors.address?.street?.message}
					/>
				</Grid>
			</Grid>

			<Grid container spacing={2} className="mt-10">
				<Grid item md={4} xs={12}>
					<Controller
						as={<TextField />}
						control={control}
						variant="outlined"
						label="Дом"
						name="address.house"
						fullWidth
						error={!!errors.address?.house}
						helperText={errors.address?.house?.message}
					/>
				</Grid>
				<Grid item md={4} xs={12}>
					<Controller
						as={<TextField />}
						control={control}
						variant="outlined"
						label="Корпус"
						name="address.building"
						fullWidth
						error={!!errors.address?.building}
						helperText={errors.address?.building?.message}
					/>
				</Grid>
				<Grid item md={4} xs={12}>
					<Controller
						as={<TextField />}
						control={control}
						variant="outlined"
						label="Квартира"
						name="address.apartment"
						fullWidth
						error={!!errors.address?.apartment}
						helperText={errors.address?.apartment?.message}
					/>
				</Grid>
			</Grid>

			<Typography variant="subtitle1" className="font-bold mt-28">
				Удостоверение личности
			</Typography>

			<Grid container spacing={2} className="mt-10">
				<Grid item md={6} xs={12}>
					<Controller
						as={<TextField />}
						control={control}
						variant="outlined"
						label="№ удостверения"
						name="licence_number"
						fullWidth
						error={!!errors.licence_number}
						helperText={errors.licence_number?.message}
					/>
				</Grid>
				<Grid item md={6} xs={12}>
					<Controller
						as={<DatePickerField />}
						control={control}
						label="Дата выдачи"
						name="licence_issuance_date"
						onlyValid
						fullWidth
						error={!!errors.licence_issuance_date}
						helperText={errors.licence_issuance_date?.message}
					/>
				</Grid>
			</Grid>

			<Typography variant="subtitle1" className="font-bold mt-28">
				Место работы
			</Typography>

			<Controller
				as={<TextField />}
				control={control}
				variant="outlined"
				label="Место работы/службы"
				name="job"
				fullWidth
				className="mt-16"
				error={!!errors.job}
				helperText={errors.job?.message}
			/>
			<Controller
				as={<TextField />}
				control={control}
				variant="outlined"
				label="Профессия"
				name="profession"
				fullWidth
				className="mt-16"
				error={!!errors.profession}
				helperText={errors.profession?.message}
			/>
			<Controller
				as={<TextField />}
				control={control}
				variant="outlined"
				label="Должность"
				name="position"
				fullWidth
				className="mt-16"
				error={!!errors.position}
				helperText={errors.position?.message}
			/>

			<Button
				variant="contained"
				color="primary"
				className="mt-32"
				textNormal
				disabled={createPatient.isLoading || updatePatient.isLoading}
				onClick={submitAction}
			>
				Сохранить
			</Button>

			{isShowModalPatientCallsHistory && (
				<ModalPatientCallsHistory
					isOpen
					patientUuid={dataPatient?.uuid}
					onClose={() => setIsShowModalPatientCallsHistory(false)}
				/>
			)}
		</>
	);
}
FormPatient.defaultProps = {
	initialValues: {},
	patientsUuid: null,
	onUpdate: () => {},
	setPatientUuid: () => {}
};
FormPatient.propTypes = {
	initialValues: PropTypes.shape({
		main_phone: PropTypes.string,
		instagram_username: PropTypes.string
	}),
	patientsUuid: PropTypes.string,
	onUpdate: PropTypes.func,
	setPatientUuid: PropTypes.func
};
