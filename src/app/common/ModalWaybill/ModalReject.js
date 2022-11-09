import React from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import { DialogSimpleTemplate, Button, TextField } from '../../bizKITUi';
import { ENTITY_DEPS, waybillsService } from '../../services';
import { useAlert } from '../../hooks';

export function ModalReject({ isOpen, onClose, waybillUuid }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	const { setError, errors, control, handleSubmit } = useForm({
		mode: 'onBlur',
		defaultValues: {
			text: ''
		}
	});

	const rejectWaybill = useMutation(({ uuid, payload }) => waybillsService.closeWaybill(uuid, payload));
	const onSubmit = async data => {
		rejectWaybill
			.mutateAsync({ uuid: waybillUuid, payload: data })
			.then(() => {
				ENTITY_DEPS.WAYBILL.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Накладная успешно отклонена');
				onClose();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось отклонить накладную');
			});
	};

	return (
		<DialogSimpleTemplate
			isOpen={isOpen}
			header={<>Отклонение накладной</>}
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
					label="Причина отклонения"
					variant="outlined"
					multiline
					rows={5}
					name="text"
					error={!!errors.text}
					helperText={errors.text?.message}
				/>

				<Button
					textNormal
					className="mt-20"
					customColor="secondary"
					type="submit"
					disabled={rejectWaybill.isLoading}
				>
					Отклонить
				</Button>
			</form>
		</DialogSimpleTemplate>
	);
}
ModalReject.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	waybillUuid: PropTypes.string.isRequired
};
