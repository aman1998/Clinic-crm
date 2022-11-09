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

export function ModalConfirmClose({ workShiftUuid, isOpen, onClose }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	const { setError, errors, control, clearErrors, getValues } = useForm({
		mode: 'onBlur',
		defaultValues
	});

	const closeReport = useMutation(({ uuid, data }) => employeesService.closeDoctorWorkShift(uuid, data));
	const handleClose = () => {
		clearErrors();

		closeReport
			.mutateAsync({ uuid: workShiftUuid, data: getValues() })
			.then(() => {
				ENTITY_DEPS.DOCTOR_WORK_SHIFTS.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Смена успешно утверждена');
				onClose();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось утвердить смену');
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
				<Button textNormal customColor="primary" onClick={handleClose} disabled={closeReport.isLoading}>
					Утвердить
				</Button>
			</div>
		</DialogSimpleTemplate>
	);
}
ModalConfirmClose.propTypes = {
	workShiftUuid: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired
};
