import React from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQueryClient } from 'react-query';
import { Controller, useForm } from 'react-hook-form';
import { Typography } from '@material-ui/core';
import { TextField, DrawerTemplate, Button } from '../../bizKITUi';
import { ENTITY_DEPS, waybillsService } from '../../services';
import { useAlert } from '../../hooks';

export function ModalWaybillsWriteOffReason({ isOpen, onClose }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	const { control, getValues, errors, setError, clearErrors } = useForm({
		mode: 'onBlur',
		defaultValues: {
			text: ''
		}
	});

	const createReason = useMutation(payload => waybillsService.createWriteOffReason(payload));
	const handleOnCreateWriteOffReason = () => {
		clearErrors();

		createReason
			.mutateAsync(getValues())
			.then(() => {
				ENTITY_DEPS.WAYBILL_WRITEOFF_REASON.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				onClose();
				alertSuccess('Новая причина списания создана');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать причину списания');
			});
	};

	return (
		<DrawerTemplate
			isOpen={isOpen}
			close={onClose}
			header={
				<Typography color="secondary" className="text-xl font-bold text-center">
					Добавить причину списания
				</Typography>
			}
			width="sm"
			content={
				<Controller
					as={<TextField />}
					control={control}
					variant="outlined"
					label="Наименование"
					name="text"
					fullWidth
					className="mt-16"
					error={!!errors.text}
					helperText={errors.text?.message}
				/>
			}
			footer={
				<Button
					variant="contained"
					color="primary"
					textNormal
					disabled={createReason.isLoading}
					onClick={handleOnCreateWriteOffReason}
				>
					Сохранить
				</Button>
			}
		/>
	);
}
ModalWaybillsWriteOffReason.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired
};
