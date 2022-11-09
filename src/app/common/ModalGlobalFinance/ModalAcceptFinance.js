import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import PropTypes from 'prop-types';
import { useQueryClient, useMutation } from 'react-query';
import { DialogSimpleTemplate, Button, TextField } from '../../bizKITUi';
import { ENTITY_DEPS, globalFinanceService } from '../../services';
import { useAlert } from '../../hooks';

export function ModalAcceptFinance({ isOpen, onClose, globalFinanceUuid }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	const { setError, errors, control, clearErrors, getValues } = useForm({
		mode: 'onBlur',
		defaultValues: {
			text: ''
		}
	});

	const acceptFinance = useMutation(({ uuid, payload }) => globalFinanceService.acceptAction(uuid, payload));
	const handleOnAcceptFinance = event => {
		event.preventDefault();
		clearErrors();

		acceptFinance
			.mutateAsync({ uuid: globalFinanceUuid, payload: getValues() })
			.then(() => {
				alertSuccess('Операция успешно подтверждена');

				ENTITY_DEPS.GLOBAL_FINANCE_ACTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});

				onClose();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось подтвердить операцию');
			});
	};

	return (
		<DialogSimpleTemplate
			isOpen={isOpen}
			header={<>Утверждение финансовой операции</>}
			fullScreen={false}
			maxWidth="sm"
			fullWidth
			onClose={onClose}
		>
			<form onSubmit={handleOnAcceptFinance}>
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
					disabled={acceptFinance.isLoading}
				>
					Утвердить
				</Button>
			</form>
		</DialogSimpleTemplate>
	);
}
ModalAcceptFinance.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	globalFinanceUuid: PropTypes.string.isRequired
};
