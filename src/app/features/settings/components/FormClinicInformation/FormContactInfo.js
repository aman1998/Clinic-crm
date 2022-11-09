import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQueryClient } from 'react-query';
import { Controller, useForm } from 'react-hook-form';
import { Card, CardHeader, CardContent, Typography, Divider, IconButton } from '@material-ui/core';
import { Delete as DeleteIcon } from '@material-ui/icons';
import { PhoneField, Button, TextField } from '../../../../bizKITUi';
import { clinicService, ENTITY_DEPS } from '../../../../services';
import { useAlert } from '../../../../hooks';
import { defaults } from '../../../../utils';

const defaultValues = {
	uuid: '',
	address: '',
	phones: [],
	email: '',
	website: '',
	working_time: ''
};

export function FormContactInfo({ contact, uuid }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	const { control, getValues, watch, reset, errors, setError, clearErrors } = useForm({
		mode: 'onBlur',
		defaultValues
	});

	useEffect(() => {
		if (contact) reset(defaults(contact, defaultValues));
	}, [contact, reset]);

	const watchFields = watch(['phones']);
	const handleAddPhone = () => {
		const values = getValues();
		const phones = values.phones ?? [];

		reset(
			{
				...values,
				phones: [...phones, { phone: '' }]
			},
			{ errors: true }
		);
	};
	const handleDeletePhone = index => {
		const values = getValues();
		const phones = watchFields.phones.slice();

		phones.splice(index, 1);

		reset(
			{
				...values,
				phones
			},
			{ errors: true }
		);
	};

	const { mutateAsync: updateContactInfo, isLoading: isLoadingUpdateContactInfo } = useMutation(payload =>
		clinicService.updateContactInfo(payload, uuid)
	);
	const { mutateAsync: createContactInfo, isLoading: isLoadingCreateContactInfo } = useMutation(payload =>
		clinicService.createContactInfo(payload)
	);
	const handleSubmit = event => {
		event.preventDefault();
		clearErrors();

		if (contact) {
			updateContactInfo(getValues())
				.then(data => {
					queryClient.setQueryData(ENTITY_DEPS.CLINIC_INFORMATION, data);
					alertSuccess('Контактная информация сохранена');
				})
				.catch(error => {
					error?.fieldErrors?.forEach(item => {
						setError(item.field, { message: item.message });
					});
					alertError('Не удалось изменить информацию');
				});
		} else {
			createContactInfo(getValues())
				.then(data => {
					queryClient.setQueryData(ENTITY_DEPS.CLINIC_INFORMATION, data);
					alertSuccess('Контактная информация сохранена');
				})
				.catch(error => {
					error?.fieldErrors?.forEach(item => {
						setError(item.field, { message: item.message });
					});
					alertError('Не удалось изменить информацию');
				});
		}
	};

	return (
		<Card>
			<CardHeader
				title={
					<Typography color="secondary" variant="body1">
						Контактная информация
					</Typography>
				}
			/>
			<Divider />
			<CardContent>
				<form onSubmit={handleSubmit}>
					<Controller
						as={<TextField />}
						control={control}
						variant="outlined"
						label="Адрес"
						name="address"
						fullWidth
						margin="normal"
						error={!!errors.address}
						helperText={errors.address?.message}
					/>
					{watchFields.phones.map((item, index) => (
						<div key={index} className="flex items-center">
							<Controller
								key={index}
								control={control}
								name={`phones[${index}].phone`}
								render={props => (
									<PhoneField
										{...props}
										label="Номер телефона"
										fullWidth
										margin="normal"
										error={!!errors.phones?.message?.[index]?.phone}
										helperText={errors.phones?.message?.[index]?.phone?.message}
									/>
								)}
							/>

							<IconButton
								aria-label="Удалить поле с номером телефона"
								className="ml-10"
								onClick={() => handleDeletePhone(index)}
							>
								<DeleteIcon />
							</IconButton>
						</div>
					))}

					<Button variant="text" textNormal onClick={handleAddPhone}>
						+ Добавить номер телефона
					</Button>

					<Controller
						as={<TextField />}
						control={control}
						variant="outlined"
						label="Email"
						name="email"
						fullWidth
						margin="normal"
						error={!!errors.email}
						helperText={errors.email?.message}
					/>
					<Controller
						as={<TextField />}
						control={control}
						variant="outlined"
						label="Сайт"
						name="website"
						fullWidth
						margin="normal"
						error={!!errors.website}
						helperText={errors.website?.message}
					/>
					<Controller
						as={<TextField />}
						control={control}
						variant="outlined"
						label="Рабочее время"
						name="working_time"
						fullWidth
						margin="normal"
						error={!!errors.working_time}
						helperText={errors.working_time?.message}
					/>

					<Button
						disabled={isLoadingCreateContactInfo || isLoadingUpdateContactInfo}
						type="submit"
						className="mt-16"
						textNormal
					>
						Сохранить
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}

FormContactInfo.propTypes = {
	contact: PropTypes.shape({
		uuid: PropTypes.string,
		address: PropTypes.string,
		phones: PropTypes.arrayOf(PropTypes.string),
		email: PropTypes.string,
		website: PropTypes.string,
		working_time: PropTypes.string
	}).isRequired,
	uuid: PropTypes.string.isRequired
};
