import React from 'react';
import { IconButton, InputAdornment } from '@material-ui/core';
import { Controller, useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { useMutation } from 'react-query';
import PropTypes from 'prop-types';
import { TextField, PhoneField, Button, ServerAutocomplete } from 'app/bizKITUi';
import { Delete as DeleteIcon } from '@material-ui/icons';
import { CallButton } from 'app/common/CallButton';
import { leadsServices } from 'app/services/leads';
import { authService } from 'app/services';
import { useAlert } from 'app/hooks';
import { getFullName } from 'app/utils';
import { Todo } from '../../Todo';

const initialValues = {
	deadline: 'oneDay',
	date: 'everytime',
	contacts: []
};

export function LeftSide() {
	// const [isShowModalPatient, setIsShowModalPatient] = useState(false);
	const { stageUuid } = useParams();
	const { alertSuccess, alertError } = useAlert();

	const { control, getValues, watch, reset, errors, clearErrors, setError } = useForm({
		mode: 'onBlur',
		defaultValues: { ...initialValues }
	});
	const watchFields = watch(['contacts']);

	const createLead = useMutation(payload => leadsServices.createLeadsTable(payload));
	const addLead = () => {
		clearErrors();
		const payload = {
			...getValues(),
			stage: stageUuid,
			contacts: ''
		};

		createLead
			.mutateAsync(payload)
			.then(() => {
				alertSuccess('Лид успешно создан');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать лид');
			});
	};

	const handleOnDeletePhoneField = index => {
		const values = getValues();
		const contacts = watchFields.contacts.slice();
		contacts.splice(index, 1);

		reset(
			{
				...values,
				contacts
			},

			{ errors: true }
		);
	};

	const handleOnAddPhoneField = () => {
		const values = getValues();
		const contacts = values.contacts ?? [];

		reset(
			{
				...values,
				contacts: [...contacts, { number: '' }]
			},
			{ errors: true }
		);
	};

	return (
		<div className="px-20 pt-28 sm:w-1/3 mb-24">
			<form>
				<Controller
					as={<TextField />}
					control={control}
					label="Имя"
					variant="outlined"
					fullWidth
					className="mb-10"
					name="first_name"
					error={!!errors.first_name}
					helperText={errors.first_name?.message}
				/>

				<Controller
					as={<TextField />}
					control={control}
					label="Фамилия"
					variant="outlined"
					fullWidth
					className="mb-10"
					name="last_name"
					error={!!errors.last_name}
					helperText={errors.last_name?.message}
				/>

				<Controller
					as={<TextField />}
					control={control}
					label="Отчество"
					variant="outlined"
					fullWidth
					className="mb-10"
					name="middle_name"
					error={!!errors.middle_name}
					helperText={errors.middle_name?.message}
				/>

				<div className="sm:hidden">
					<Todo />
				</div>

				<Controller
					control={control}
					name="phone_number"
					className="mb-10"
					render={props => (
						<PhoneField
							{...props}
							label="Номер телефона"
							fullWidth
							error={!!errors?.phone_number}
							helperText={errors?.phone_number?.message}
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

				{watchFields.contacts.map((item, index) => (
					<div key={index} className="flex items-center mt-16">
						<Controller
							control={control}
							className="mb-8"
							fullWidth
							name={`contacts[${index}].number`}
							render={props => (
								<PhoneField
									{...props}
									label="Номер телефона"
									fullWidth
									error={!!errors?.contacts?.[index]?.number}
									helperText={errors?.contacts?.[index]?.number?.message}
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

				<Button variant="text" textNormal className="mt-12" onClick={handleOnAddPhoneField}>
					+ Добавить контакт
				</Button>
				<Controller
					control={control}
					name="source"
					render={({ onChange, ...props }) => (
						<ServerAutocomplete
							{...props}
							getOptionLabel={option => option.name}
							// readOnly={!isNew}
							label="Источник лида"
							className="mb-10"
							fullWidth
							InputProps={{
								error: !!errors.source,
								helperText: errors.source?.message
							}}
							onFetchList={name =>
								leadsServices.getSourceHandbook({
									name,
									limit: 10
								})
							}
							// onFetchItem={uuid => leadsServices.getSourceHandbook(uuid)}
							onChange={value => onChange(value?.uuid ?? null)}
						/>
					)}
				/>

				<Controller
					control={control}
					name="responsible_user"
					render={({ onChange, ...props }) => (
						<ServerAutocomplete
							{...props}
							getOptionLabel={option => getFullName(option)}
							// readOnly={!isNew}
							label="Ответственный"
							className="mb-10"
							fullWidth
							InputProps={{
								error: !!errors.responsible_user,
								helperText: errors.responsible_user?.message
							}}
							onFetchList={authService.getUsers}
							// onFetchItem={uuid => leadsServices.getSourceHandbook(uuid)}
							onChange={value => onChange(value?.uuid ?? null)}
						/>
					)}
				/>

				<Button
					variant="contained"
					color="primary"
					className="py-12 px-32 mt-12 hidden sm:block"
					textNormal
					fullWidth
					// disabled={createPatient.isLoading || updatePatient.isLoading}
					onClick={addLead}
				>
					Создать лид
				</Button>
			</form>
		</div>
	);
}

LeftSide.propTypes = {
	setIsShowModalPatient: PropTypes.func
};

LeftSide.defaultProps = {
	setIsShowModalPatient: () => {}
};
