import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import PropTypes from 'prop-types';
import { useQueryClient, useMutation } from 'react-query';
import { DialogSimpleTemplate, Button, TextField } from '../../../../bizKITUi';
import { ENTITY_DEPS, operationService } from '../../../../services';
import { useAlert } from '../../../../hooks';

export function ModalAcceptStage({ isOpen, onClose, stageUuid }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	const { setError, errors, control, clearErrors, getValues } = useForm({
		mode: 'onBlur',
		defaultValues: {
			comment: ''
		}
	});

	const nextStage = useMutation(({ uuid, payload }) => operationService.nextOperationCreatedStage(uuid, payload));
	const handleOnRejectFinance = event => {
		event.preventDefault();
		clearErrors();

		nextStage
			.mutateAsync({ uuid: stageUuid, payload: getValues() })
			.then(() => {
				alertSuccess('Этап успешно завершен');

				ENTITY_DEPS.OPERATION_CREATED_STAGE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});

				onClose();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось завершить этап');
			});
	};

	return (
		<DialogSimpleTemplate
			isOpen={isOpen}
			header={<>Следующий этап</>}
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

				<Button textNormal className="mt-20" customColor="primary" type="submit" disabled={nextStage.isLoading}>
					Перейти на следующий этап
				</Button>
			</form>
		</DialogSimpleTemplate>
	);
}
ModalAcceptStage.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	stageUuid: PropTypes.string.isRequired
};
