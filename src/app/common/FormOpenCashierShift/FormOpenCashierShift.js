import React from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQueryClient } from 'react-query';
import { Controller, useForm } from 'react-hook-form';
import { Button, CurrencyTextField, ServerAutocomplete } from '../../bizKITUi';
import { financeService, authService, ENTITY_DEPS } from '../../services';
import { useAlert } from '../../hooks';
import { getFullName } from '../../utils';
import { PERMISSION } from '../../services/auth/constants';

const defaultValues = {
	responsible: null,
	cash_deposited: ''
};

export function FormOpenCashierShift({ onSuccess }) {
	const { alertError, alertSuccess } = useAlert();
	const queryClient = useQueryClient();

	const { control, errors, getValues, setError, clearErrors } = useForm({
		mode: 'onBlur',
		defaultValues
	});

	const startCashierShift = useMutation(data => financeService.startCashierShift(data));
	const handleSubmit = event => {
		event.preventDefault();
		clearErrors();

		startCashierShift
			.mutateAsync(getValues())
			.then(() => {
				ENTITY_DEPS.CASHIER_WORK_SHIFT.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Кассовая смена открыта');
				onSuccess();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError(error.userMessage || 'Не удалось открыть кассовую смену');
			});
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className="mt-16" />
			<Controller
				control={control}
				name="responsible"
				render={({ onChange, ...props }) => (
					<ServerAutocomplete
						{...props}
						margin="normal"
						getOptionLabel={option => getFullName(option)}
						label="Ответственный"
						InputProps={{
							error: !!errors.responsible,
							helperText: errors.responsible?.message
						}}
						onFetchList={(search, limit) =>
							authService.getUsers({
								search,
								limit,
								permissions: [
									PERMISSION.FINANCE.VIEW_CASHIER_WORKSHIFT,
									PERMISSION.FINANCE.ADD_CASHIER_WORKSHIFT,
									PERMISSION.FINANCE.CHANGE_CASHIER_WORKSHIFT,
									PERMISSION.FINANCE.DELETE_CASHIER_WORKSHIFT
								]
							})
						}
						onFetchItem={uuid => authService.getUser(uuid).then(({ data }) => data)}
						onChange={newValue => onChange(newValue?.uuid ?? null)}
					/>
				)}
			/>

			<Controller
				control={control}
				name="cash_deposited"
				render={({ value, onChange, onBlur }) => (
					<CurrencyTextField
						variant="outlined"
						label="Сумма наличных для размена"
						fullWidth
						margin="normal"
						value={value}
						error={!!errors.cash_deposited}
						helperText={errors.cash_deposited?.message}
						onBlur={onBlur}
						onChange={(_, newValue) => onChange(newValue)}
					/>
				)}
			/>

			<Button textNormal className="mt-16" type="submit" disabled={startCashierShift.isLoading}>
				Открыть смену
			</Button>
		</form>
	);
}
FormOpenCashierShift.defaultProps = {
	onSuccess: () => {}
};
FormOpenCashierShift.propTypes = {
	onSuccess: PropTypes.func
};
