import React from 'react';
import { useMutation, useQueryClient } from 'react-query';
import PropTypes from 'prop-types';
import { Button, DialogSimpleTemplate, SelectField } from 'app/bizKITUi';
import { Controller, useForm } from 'react-hook-form';
import { removeEmptyValuesFromObject } from 'app/utils';
import { useAlert } from 'app/hooks';
import { MenuItem } from '@material-ui/core';
import { ENTITY_DEPS, treatmentService } from 'app/services';
import {
	TREATMENT_WAITING,
	TREATMENT_MISSED,
	TREATMENT_PASSED_NOT_PAID,
	TREATMENT_PAID,
	TREATMENT_CANCELED,
	TREATMENT_COMPLETED,
	TREATMENT_CANCELED_RU,
	TREATMENT_COMPLETED_RU,
	TREATMENT_MISSED_RU,
	TREATMENT_PAID_RU,
	TREATMENT_PASSED_NOT_PAID_RU,
	TREATMENT_WAITING_RU
} from './constants';

const statusList = [
	TREATMENT_WAITING_RU,
	TREATMENT_MISSED_RU,
	TREATMENT_PASSED_NOT_PAID_RU,
	TREATMENT_PAID_RU,
	TREATMENT_CANCELED_RU,
	TREATMENT_COMPLETED_RU
];

export function ModalTreatmentStatus({ onClose, isOpen, initialValues, treatmentUuid }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	const { errors, control, getValues } = useForm({
		mode: 'onBlur',
		defaultValues: { ...removeEmptyValuesFromObject(initialValues) }
	});

	const updateTreatmentStatus = useMutation(({ uuid, payload }) =>
		treatmentService.updateTreatmentStatus(uuid, payload)
	);
	const handleTreatmentStatusUpdate = () => {
		const values = [
			{
				...getValues(),
				item: initialValues.uuid
			}
		];

		updateTreatmentStatus
			.mutateAsync({ uuid: treatmentUuid, payload: values })
			.then(() => {
				ENTITY_DEPS.TREATMENTS_SCHEDULE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Статус успешно обновлен');
			})
			.catch(() => {
				alertError('Статус не обновлен');
			});
	};

	const getStatusValue = status => {
		switch (status) {
			case TREATMENT_WAITING_RU:
				return TREATMENT_WAITING;
			case TREATMENT_PASSED_NOT_PAID_RU:
				return TREATMENT_PASSED_NOT_PAID;
			case TREATMENT_MISSED_RU:
				return TREATMENT_MISSED;
			case TREATMENT_CANCELED_RU:
				return TREATMENT_CANCELED;
			case TREATMENT_COMPLETED_RU:
				return TREATMENT_COMPLETED;
			case TREATMENT_PAID_RU:
				return TREATMENT_PAID;
			default:
				return TREATMENT_WAITING;
		}
	};

	return (
		<DialogSimpleTemplate onClose={onClose} isOpen={isOpen} header={<>Статус</>}>
			<Controller
				as={
					<SelectField
						InputProps={{
							endAdornment: false
						}}
						isAdd={false}
					/>
				}
				control={control}
				className="mt-20 mb-16"
				fullWidth
				label="Статус"
				name="status"
				type="text"
				variant="outlined"
				select
				error={!!errors.status}
				helperText={errors.sender_money_account?.message}
				style={{ width: 200 }}
			>
				{statusList.map(item => (
					<MenuItem key={item} value={getStatusValue(item)}>
						{item}
					</MenuItem>
				))}
			</Controller>
			<Button
				style={{ width: 200 }}
				textNormal
				disabled={updateTreatmentStatus.isLoading}
				onClick={handleTreatmentStatusUpdate}
			>
				Сохранить
			</Button>
		</DialogSimpleTemplate>
	);
}

ModalTreatmentStatus.propTypes = {
	onClose: PropTypes.func.isRequired,
	isOpen: PropTypes.bool.isRequired,
	treatmentUuid: PropTypes.string.isRequired,
	initialValues: PropTypes.objectOf(PropTypes.object).isRequired
};
