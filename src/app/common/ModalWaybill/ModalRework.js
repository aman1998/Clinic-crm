import React from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import { DialogSimpleTemplate, Button, TextField } from '../../bizKITUi';
import { ENTITY_DEPS, waybillsService } from '../../services';
import { useAlert } from '../../hooks';

export function ModalRework({ isOpen, onClose, waybillUuid }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	const { setError, errors, control, handleSubmit } = useForm({
		mode: 'onBlur',
		defaultValues: {
			text: ''
		}
	});

	const reworkWaybill = useMutation(({ uuid, payload }) => waybillsService.reworkWaybill(uuid, payload));
	const onSubmit = async data => {
		reworkWaybill
			.mutateAsync({ uuid: waybillUuid, payload: data })
			.then(() => {
				ENTITY_DEPS.WAYBILL.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Накладная успешно возвращена на доработку');
				onClose();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось вернуть накладную на доработку');
			});
	};

	return (
		<DialogSimpleTemplate
			isOpen={isOpen}
			header={<>Возврат накладной на дорабтоку</>}
			fullScreen={false}
			maxWidth="sm"
			fullWidth
			onClose={onClose}
		>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Controller
					as={<TextField />}
					control={control}
					fullWidth
					label="Причина возврата"
					variant="outlined"
					multiline
					rows={5}
					name="text"
					error={!!errors.text}
					helperText={errors.text?.message}
				/>

				<Button textNormal className="mt-20" type="submit" disabled={reworkWaybill.isLoading}>
					Вернуть на доработку
				</Button>
			</form>
		</DialogSimpleTemplate>
	);
}
ModalRework.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	waybillUuid: PropTypes.string.isRequired
};
