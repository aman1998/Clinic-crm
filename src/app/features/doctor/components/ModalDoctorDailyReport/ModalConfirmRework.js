import React from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import { Button, DialogSimpleTemplate, TextField } from '../../../../bizKITUi';
import { ENTITY_DEPS, employeesService } from '../../../../services';
import { useAlert } from '../../../../hooks';

const defaultValues = {
	text: ''
};

export function ModalConfirmRework({ workShiftUuid, isOpen, onClose }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	const { setError, errors, control, clearErrors, getValues } = useForm({
		mode: 'onBlur',
		defaultValues
	});

	const reworkReport = useMutation(({ uuid, data }) => employeesService.reworkResponsibleDoctorWorkShift(uuid, data));
	const handleRework = () => {
		clearErrors();

		reworkReport
			.mutateAsync({ uuid: workShiftUuid, data: getValues() })
			.then(() => {
				ENTITY_DEPS.DOCTOR_WORK_SHIFTS.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Смена успешно отправлена на доработку');
				onClose();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось отправить смену на доработку');
			});
	};

	return (
		<DialogSimpleTemplate
			isOpen={isOpen}
			onClose={onClose}
			header={<>Возврат смены на доработку</>}
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
				<Button textNormal onClick={handleRework} disabled={reworkReport.isLoading}>
					Вернуть на доработку
				</Button>
			</div>
		</DialogSimpleTemplate>
	);
}
ModalConfirmRework.propTypes = {
	workShiftUuid: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired
};
