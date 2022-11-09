import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { Button, TextField, PhoneField, MenuItem } from '../../../../bizKITUi';
import { useAlert } from '../../../../hooks';
import { defaults } from '../../../../utils';
import { companiesService, employeesService, ENTITY, ENTITY_DEPS } from '../../../../services';
import { ModalResetPassword } from '../../../../common/ModalResetPassword';

const defaultValues = {
	first_name: '',
	middle_name: '',
	last_name: '',
	email: '',
	main_phone: '',
	password: '',
	confirm_password: '',
	branch: []
};

export function FormDoctor({ uuid: doctorUuid }) {
	const { alertSuccess, alertError } = useAlert();
	const queryClient = useQueryClient();

	const { setError, errors, control, clearErrors, getValues, reset } = useForm({
		mode: 'onBlur',
		defaultValues
	});

	const createDoctor = useMutation(payload => employeesService.createDoctor(payload));
	const handleOnCreate = () => {
		clearErrors();

		createDoctor
			.mutateAsync(getValues())
			.then(({ data }) => {
				alertSuccess('Врач успешно создан');
				ENTITY_DEPS.DOCTOR.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
			})
			.catch(error => {
				error?.fieldErrors?.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать врача');
			});
	};

	const updateDoctor = useMutation(({ uuid, payload }) => employeesService.updateDoctor(uuid, payload));
	const handleOnUpdate = () => {
		clearErrors();

		updateDoctor
			.mutateAsync({ uuid: doctorUuid, payload: getValues() })
			.then(({ data }) => {
				alertSuccess('Врач успешно изменён');
				ENTITY_DEPS.DOCTOR.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось изменить врача');
			});
	};

	const { isLoading: isLoadingUser, isError: isErrorLoadingUser, data } = useQuery(
		[ENTITY.DOCTOR, doctorUuid],
		() => {
			if (doctorUuid) {
				return employeesService.getDoctor(doctorUuid).then(({ data: results }) => results);
			}
			return Promise.resolve();
		}
	);

	const { isLoading: isLoadingBranches, isError: isErrorBranches, data: branches } = useQuery(
		[ENTITY.COMPANY_BRANCH, { limit: Number.MAX_SAFE_INTEGER }],
		({ queryKey }) => companiesService.getCompaniesBranches(queryKey[1])
	);

	useEffect(() => {
		if (!data) {
			return;
		}

		reset(defaults({ ...data, branch: data?.user?.branch }, defaultValues));
	}, [data, reset]);

	const [isShowModalResetPassword, setIsShowModalResetPassword] = useState(false);
	const onResetPassword = () => {
		if (!data?.user) {
			alertError('Доктор не привязан ни к одному из пользователей');
			return;
		}
		setIsShowModalResetPassword(true);
	};
	const handleOnCloseResetPassword = () => {
		setIsShowModalResetPassword(false);
	};

	if (isLoadingUser || isLoadingBranches) {
		return <FuseLoading />;
	}
	if (isErrorLoadingUser || isErrorBranches) {
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
				{!doctorUuid && (
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

				{doctorUuid && onResetPassword && (
					<div className="pt-10">
						<Button textNormal variant="text" onClick={onResetPassword}>
							Изменить пароль
						</Button>
					</div>
				)}

				<div className="pt-20 mt-auto">
					<Button
						disabled={updateDoctor.isLoading || createDoctor.isLoading}
						textNormal
						onClick={doctorUuid ? handleOnUpdate : handleOnCreate}
					>
						Сохранить
					</Button>
				</div>
			</div>

			{isShowModalResetPassword && (
				<ModalResetPassword isOpen uuid={data?.user?.uuid} onClose={handleOnCloseResetPassword} />
			)}
		</>
	);
}
FormDoctor.defaultProps = {
	uuid: null
};
FormDoctor.propTypes = {
	uuid: PropTypes.string
};
