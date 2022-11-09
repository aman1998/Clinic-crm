import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { Button, TextField, MenuItem, PhoneField } from '../../../../bizKITUi';
import { useAlert } from '../../../../hooks';
import { defaults } from '../../../../utils';
import { authService, companiesService, ENTITY, ENTITY_DEPS } from '../../../../services';
import { ModalResetPassword } from '../../../../common/ModalResetPassword';

const defaultValues = {
	first_name: '',
	middle_name: '',
	last_name: '',
	email: '',
	groups: [],
	main_phone: '',
	password: '',
	confirm_password: '',
	ate_user: '',
	branch: []
};

export function FormUser({ uuid, initialValues }) {
	const { alertSuccess, alertError } = useAlert();
	const queryClient = useQueryClient();

	const { setError, errors, control, clearErrors, getValues, reset } = useForm({
		mode: 'onBlur',
		defaultValues: defaults(initialValues, defaultValues)
	});

	const createUser = useMutation(payload => authService.createUser(payload));
	const handleOnCreate = () => {
		clearErrors();

		createUser
			.mutateAsync(getValues())
			.then(({ data }) => {
				alertSuccess('Пользователь успешно создан');
				ENTITY_DEPS.USER.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать пользователя');
			});
	};

	const updateUser = useMutation(({ id, payload }) => authService.updateUser(id, payload));
	const handleOnUpdate = () => {
		clearErrors();

		updateUser
			.mutateAsync({ id: uuid, payload: getValues() })
			.then(({ data }) => {
				alertSuccess('Пользователь успешно изменён');
				ENTITY_DEPS.USER.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось изменить пользователя');
			});
	};

	const { isLoading: isLoadingGroups, isError: isErrorGroups, data: listGroups } = useQuery([ENTITY.GROUP], () =>
		authService.getGroups()
	);
	const { isLoading: isLoadingUser, isError: isErrorLoadingUser, data } = useQuery([ENTITY.USER, uuid], () => {
		if (uuid) {
			return authService.getUser(uuid).then(({ data: results }) => results);
		}
		return Promise.resolve();
	});
	const { isLoading: isLoadingBranches, isError: isErrorBranches, data: branches } = useQuery(
		[ENTITY.COMPANY_BRANCH, { limit: Number.MAX_SAFE_INTEGER }],
		({ queryKey }) => companiesService.getCompaniesBranches(queryKey[1])
	);

	useEffect(() => {
		if (!data) {
			return;
		}

		reset(defaults({ ...data, groups: data.groups?.map(item => item.id) }, defaultValues));
	}, [data, reset]);

	const [isShowModalResetPassword, setIsShowModalResetPassword] = useState(false);
	const onResetPassword = () => {
		setIsShowModalResetPassword(true);
	};
	const handleOnCloseResetPassword = () => {
		setIsShowModalResetPassword(false);
	};

	if (isLoadingUser || isLoadingGroups || isLoadingBranches) {
		return <FuseLoading />;
	}
	if (isErrorLoadingUser || isErrorGroups || isErrorBranches) {
		return <ErrorMessage />;
	}
	return (
		<>
			<div className="flex flex-col flex-auto h-full">
				<Controller
					as={<TextField />}
					control={control}
					margin="normal"
					fullWidth
					label="Фамилия"
					variant="outlined"
					name="last_name"
					error={!!errors.last_name}
					helperText={errors.last_name?.message}
				/>
				<Controller
					as={<TextField />}
					control={control}
					margin="normal"
					fullWidth
					label="Имя"
					variant="outlined"
					name="first_name"
					error={!!errors.first_name}
					helperText={errors.first_name?.message}
				/>
				<Controller
					as={<TextField />}
					control={control}
					margin="normal"
					fullWidth
					label="Отчество"
					variant="outlined"
					name="middle_name"
					error={!!errors.middle_name}
					helperText={errors.middle_name?.message}
				/>
				<Controller
					as={<TextField />}
					control={control}
					margin="normal"
					fullWidth
					label="Email"
					type="email"
					variant="outlined"
					name="email"
					error={!!errors.email}
					helperText={errors.email?.message}
				/>
				<Controller
					as={<PhoneField />}
					control={control}
					margin="normal"
					fullWidth
					label="Телефон"
					variant="outlined"
					name="main_phone"
					error={!!errors.main_phone}
					helperText={errors.main_phone?.message}
				/>
				<Controller
					as={<TextField />}
					control={control}
					margin="normal"
					select
					fullWidth
					label="Права доступа"
					variant="outlined"
					name="groups"
					SelectProps={{ multiple: true }}
					error={!!errors.groups}
					helperText={errors.groups?.message}
				>
					{listGroups.results.map(item => (
						<MenuItem key={item.id} value={item.id}>
							{item.name}
						</MenuItem>
					))}
				</Controller>
				<Controller
					as={<TextField />}
					control={control}
					margin="normal"
					select
					fullWidth
					label="Филиал"
					variant="outlined"
					name="branch"
					SelectProps={{ multiple: true }}
					error={!!errors.branch}
					helperText={errors.branch?.message}
				>
					{branches.results.map(item => (
						<MenuItem key={item.uuid} value={item.uuid}>
							{item.name}
						</MenuItem>
					))}
				</Controller>
				{!uuid && (
					<>
						<Controller
							as={<TextField />}
							control={control}
							margin="normal"
							fullWidth
							label="Пароль"
							type="password"
							variant="outlined"
							name="password"
							error={!!errors.password}
							helperText={errors.password?.message}
						/>
						<Controller
							as={<TextField />}
							control={control}
							margin="normal"
							fullWidth
							label="Подтверждение пароля"
							type="password"
							variant="outlined"
							name="confirm_password"
							error={!!errors.confirm_password}
							helperText={errors.confirm_password?.message}
						/>
					</>
				)}
				{uuid && (
					<Controller
						as={<TextField />}
						control={control}
						margin="normal"
						fullWidth
						label="Логин KCell коммуникатора"
						type="text"
						variant="outlined"
						name="ate_user"
						error={!!errors.ate_user}
						helperText={errors.ate_user?.message}
					/>
				)}

				{uuid && onResetPassword && (
					<div className="pt-10">
						<Button textNormal variant="text" onClick={onResetPassword}>
							Изменить пароль
						</Button>
					</div>
				)}

				<div className="pt-20 mt-auto">
					<Button
						disabled={updateUser.isLoading || createUser.isLoading}
						textNormal
						onClick={uuid ? handleOnUpdate : handleOnCreate}
					>
						Сохранить
					</Button>
				</div>
			</div>

			{isShowModalResetPassword && <ModalResetPassword isOpen uuid={uuid} onClose={handleOnCloseResetPassword} />}
		</>
	);
}
FormUser.defaultProps = {
	uuid: null,
	initialValues: {}
};
FormUser.propTypes = {
	uuid: PropTypes.string,
	initialValues: PropTypes.shape({
		first_name: PropTypes.string,
		middle_name: PropTypes.string,
		last_name: PropTypes.string,
		email: PropTypes.string,
		main_phone: PropTypes.string,
		ate_user: PropTypes.string,
		groups: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))
	})
};
