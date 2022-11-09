import React from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import { ENTITY_DEPS, waybillsService } from '../../services';
import { Button, TextField, DialogSimpleTemplate } from '../../bizKITUi';
import { useAlert } from '../../hooks';

export function ModalAccept({ isOpen, onClose, waybillUuid }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	const { setError, errors, control, handleSubmit } = useForm({
		mode: 'onBlur',
		defaultValues: {
			text: ''
		}
	});

	const acceptWaybill = useMutation(({ uuid, payload }) => waybillsService.acceptWaybill(uuid, payload));
	const onSubmit = async data => {
		acceptWaybill
			.mutateAsync({ uuid: waybillUuid, payload: data })
			.then(() => {
				ENTITY_DEPS.WAYBILL.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Накладная успешно подтверждена');
				onClose();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось подтвердить накладную');
			});
	};

	return (
		<DialogSimpleTemplate
			isOpen={isOpen}
			header={<>Утверждение накладной</>}
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
					label="Комментарий / обратная связь"
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
					customColor="primary"
					type="submit"
					disabled={acceptWaybill.isLoading}
				>
					Утвердить
				</Button>
			</form>
		</DialogSimpleTemplate>
	);
}
ModalAccept.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	waybillUuid: PropTypes.string.isRequired
};
