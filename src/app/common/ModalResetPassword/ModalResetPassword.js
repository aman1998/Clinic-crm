import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TextField, Typography } from '@material-ui/core';
import { DrawerTemplate, Button } from '../../bizKITUi';
import { useAlert } from '../../hooks';
import { authService } from '../../services/auth';

export function ModalResetPassword({ isOpen, onClose, uuid }) {
	const { alertSuccess, alertError } = useAlert();
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [errors, setErrors] = useState({});
	const [isLoadingSave, setIsLoadingSave] = useState(false);

	const handleOnUpdate = () => {
		if (password !== confirmPassword) {
			alertError('Пароли не совпадают');
			return;
		}
		setIsLoadingSave(true);
		authService
			.updateUserPassword(uuid, password)
			.then(() => {
				alertSuccess('Пароль успешно изменён');
				onClose();
			})
			.catch(error => {
				error?.fieldErrors?.forEach(item => {
					setErrors(old => ({ ...old, [item.field]: { message: item.message } }));
				});
				alertError('Не удалось изменить пароль');
			})
			.finally(() => {
				setIsLoadingSave(false);
			});
	};

	return (
		<>
			<DrawerTemplate
				isOpen={isOpen}
				close={onClose}
				width="sm"
				header={
					<Typography color="secondary" className="text-xl font-bold text-center">
						Изменение пароля
					</Typography>
				}
				content={
					<>
						<TextField
							margin="normal"
							fullWidth
							variant="outlined"
							type="password"
							label="Новый пароль"
							name="password"
							value={password}
							onChange={event => setPassword(event.target.value)}
							error={!!errors.password}
							helperText={errors.password?.message}
						/>
						<TextField
							margin="normal"
							fullWidth
							variant="outlined"
							type="password"
							label="Подтверждение пароля"
							name="confirmPassword"
							value={confirmPassword}
							onChange={event => setConfirmPassword(event.target.value)}
						/>
					</>
				}
				footer={
					<Button disabled={isLoadingSave} onClick={handleOnUpdate} textNormal>
						Сохранить
					</Button>
				}
			/>
		</>
	);
}
ModalResetPassword.defaultProps = {
	isOpen: false,
	onClose: () => {}
};
ModalResetPassword.propTypes = {
	isOpen: PropTypes.bool,
	onClose: PropTypes.func,
	uuid: PropTypes.string.isRequired
};
