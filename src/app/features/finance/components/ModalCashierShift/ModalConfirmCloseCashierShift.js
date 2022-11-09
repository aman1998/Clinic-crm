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

export function ModalConfirmCloseCashierShift({ cashierShiftDate, isOpen, onClose }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	const { setError, errors, control, clearErrors, getValues } = useForm({
		mode: 'onBlur',
		defaultValues
	});

	const closeCashierShift = useMutation(({ date, data }) => financeService.closeCashierShift(date, data));
	const handleCloseCashierShift = () => {
		clearErrors();

		closeCashierShift
			.mutateAsync({ date: cashierShiftDate, data: getValues() })
			.then(() => {
				ENTITY_DEPS.CASHIER_WORK_SHIFT.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Кассовая смена успешно утверждена');
				onClose();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось закрыть кассовую смену');
			});
	};

	return (
		<DialogSimpleTemplate
			isOpen={isOpen}
			onClose={onClose}
			header={<>Утверждение закрытия смены</>}
			fullWidth
			maxWidth="sm"
		>
			<Controller
				as={<TextField />}
				control={control}
				fullWidth
				multiline
				rows={3}
				label="Комментарий / обратная связь"
				variant="outlined"
				name="text"
				error={!!errors.text}
				helperText={errors.text?.message}
			/>
			<div className="mt-16">
				<Button
					textNormal
					customColor="primary"
					onClick={handleCloseCashierShift}
					disabled={closeCashierShift.isLoading}
				>
					Утвердить
				</Button>
			</div>
		</DialogSimpleTemplate>
	);
}
ModalConfirmCloseCashierShift.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired
};
