import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import PropTypes from 'prop-types';
import { useQueryClient, useMutation } from 'react-query';
import { DialogSimpleTemplate, Button, TextField } from '../../bizKITUi';
import { ENTITY_DEPS, globalFinanceService } from '../../services';
import { useAlert } from '../../hooks';

export function ModalCloseFinance({ isOpen, onClose, globalFinanceUuid }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	const { setError, errors, control, clearErrors, getValues } = useForm({
		mode: 'onBlur',
		defaultValues: {
			text: ''
		}
	});

	const rejectFinance = useMutation(({ uuid, payload }) => globalFinanceService.closeAction(uuid, payload));
	const handleOnRejectFinance = event => {
		event.preventDefault();
		clearErrors();

		rejectFinance
			.mutateAsync({ uuid: globalFinanceUuid, payload: getValues() })
			.then(() => {
				alertSuccess('Операция успешно отклонена');

				ENTITY_DEPS.GLOBAL_FINANCE_ACTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});

				onClose();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось отклонить операцию');
			});
	};

	return (
		<DialogSimpleTemplate
			isOpen={isOpen}
			header={<>Отклонение финансовой операции</>}
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
					disabled={rejectFinance.isLoading}
				>
					Отклонить
				</Button>
			</form>
		</DialogSimpleTemplate>
	);
}
ModalCloseFinance.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	globalFinanceUuid: PropTypes.string.isRequired
};
