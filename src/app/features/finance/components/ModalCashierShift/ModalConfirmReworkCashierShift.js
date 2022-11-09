import React from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import { Button, DialogSimpleTemplate, TextField } from '../../../../bizKITUi';
import { financeService, ENTITY_DEPS } from '../../../../services';
import { useAlert } from '../../../../hooks';

const defaultValues = {
	text: ''
};

export function ModalConfirmReworkCashierShift({ cashierShiftDate, isOpen, onClose }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	const { setError, errors, control, clearErrors, getValues } = useForm({
		mode: 'onBlur',
		defaultValues
	});

	const reworkCashierShift = useMutation(({ date, data }) => financeService.reworkCashierShift(date, data));
	const handleReworkCashierShift = () => {
		clearErrors();

		reworkCashierShift
			.mutateAsync({ date: cashierShiftDate, data: getValues() })
			.then(() => {
				ENTITY_DEPS.CASHIER_WORK_SHIFT.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Кассовая смена успешно отправлена на доработку');
				onClose();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось отправить кассовую смену на доработку');
			});
	};

	return (
		<DialogSimpleTemplate
			isOpen={isOpen}
			onClose={onClose}
			header={<>Возврат закрытия смены на доработку</>}
			fullWidth
			maxWidth="sm"
		>
			<Controller
				as={<TextField />}
				control={control}
				fullWidth
				multiline
				rows={3}
				label="Причина возврата"
				variant="outlined"
				name="text"
				error={!!errors.text}
				helperText={errors.text?.message}
			/>
			<div className="mt-16">
				<Button textNormal onClick={handleReworkCashierShift} disabled={reworkCashierShift.isLoading}>
					Вернуть на доработку
				</Button>
			</div>
		</DialogSimpleTemplate>
	);
}
ModalConfirmReworkCashierShift.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired
};
