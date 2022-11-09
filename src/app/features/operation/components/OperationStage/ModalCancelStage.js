import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import PropTypes from 'prop-types';
import { useQueryClient, useMutation } from 'react-query';
import { DialogSimpleTemplate, Button, TextField } from '../../../../bizKITUi';
import { ENTITY_DEPS, operationService } from '../../../../services';
import { useAlert } from '../../../../hooks';

export function ModalCancelStage({ isOpen, onClose, stageUuid }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	const { setError, errors, control, clearErrors, getValues } = useForm({
		mode: 'onBlur',
		defaultValues: {
			comment: ''
		}
	});

	const cancelStage = useMutation(({ uuid, payload }) => operationService.cancelOperationCreatedStage(uuid, payload));
	const handleOnRejectFinance = event => {
		event.preventDefault();
		clearErrors();

		cancelStage
			.mutateAsync({ uuid: stageUuid, payload: getValues() })
			.then(() => {
				alertSuccess('Этап и операция успешно отклонены');

				ENTITY_DEPS.OPERATION_CREATED_STAGE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});

				onClose();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось отклонить этап');
			});
	};

	return (
		<DialogSimpleTemplate
			isOpen={isOpen}
			header={<>Отмена операции</>}
			fullScreen={false}
			maxWidth="sm"
			fullWidth
			onClose={onClose}
		>
			<form onSubmit={handleOnRejectFinance}>
				<Controller
					as={<TextField />}
					control={control}
					fullWidth
					label="Комментарий"
					variant="outlined"
					multiline
					rows={5}
					name="comment"
					error={!!errors.comment}
					helperText={errors.comment?.message}
				/>

				<Button
					textNormal
					className="mt-20"
					customColor="secondary"
					type="submit"
					disabled={cancelStage.isLoading}
				>
					Отклонить
				</Button>
			</form>
		</DialogSimpleTemplate>
	);
}
ModalCancelStage.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	stageUuid: PropTypes.string.isRequired
};
