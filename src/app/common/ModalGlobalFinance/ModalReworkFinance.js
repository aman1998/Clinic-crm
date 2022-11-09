import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import PropTypes from 'prop-types';
import { useQueryClient, useMutation } from 'react-query';
import { DialogSimpleTemplate, Button, TextField } from '../../bizKITUi';
import { globalFinanceService, ENTITY_DEPS } from '../../services';
import { useAlert } from '../../hooks';

export function ModalReworkFinance({ isOpen, onClose, globalFinanceUuid }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	const { setError, errors, control, clearErrors, getValues } = useForm({
		mode: 'onBlur',
		defaultValues: {
			text: ''
		}
	});

	const reworkGlobalFinance = useMutation(({ uuid, data }) => globalFinanceService.reworkAction(uuid, data));
	const onSubmit = event => {
		event.preventDefault();
		clearErrors();

		reworkGlobalFinance
			.mutateAsync({ uuid: globalFinanceUuid, data: getValues() })
			.then(() => {
				alertSuccess('Операция успешно возвращена на доработку');

				ENTITY_DEPS.GLOBAL_FINANCE_ACTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});

				onClose();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось вернуть операцию на доработку');
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
			<form onSubmit={onSubmit}>
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

				<Button textNormal className="mt-20" type="submit" disabled={reworkGlobalFinance.isLoading}>
					Вернуть на доработку
				</Button>
			</form>
		</DialogSimpleTemplate>
	);
}
ModalReworkFinance.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	globalFinanceUuid: PropTypes.string.isRequired
};
