import { Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { Button, DrawerTemplate, TextField } from '../../../../bizKITUi';
import { defaults } from '../../../../utils';
import { useAlert } from '../../../../hooks';
import { ENTITY, ENTITY_DEPS, equipmentsService } from '../../../../services';
import { FormServices } from './FormServices';

const defaultValues = {
	name: '',
	services: []
};

export function ModalEquipment({ isOpen, onClose, equipmentUuid }) {
	const queryClient = useQueryClient();

	const { alertSuccess, alertError } = useAlert();

	const { isLoading, isError, data: equipmentData } = useQuery(
		[ENTITY.EQUIPMENT, equipmentUuid],
		({ queryKey }) => equipmentsService.getEquipmentByUuid(queryKey[1]),
		{ enabled: !!equipmentUuid }
	);

	const form = useForm({
		mode: 'onBlur',
		defaultValues
	});
	const { reset, getValues, setError, control, errors, clearErrors } = form;

	useEffect(() => {
		if (!equipmentData) {
			return;
		}
		reset(defaults(equipmentData, defaultValues));
	}, [equipmentData, reset]);

	const getPreparedValues = () => {
		const values = getValues();
		return {
			...values,
			services: values.services.map(service => service.uuid)
		};
	};

	const createEquipment = useMutation(data => equipmentsService.createEquipment(data));
	const handleOnCreateEquipment = async () => {
		clearErrors();

		try {
			await createEquipment.mutateAsync(getPreparedValues());

			onClose();

			ENTITY_DEPS.EQUIPMENT.forEach(dep => {
				queryClient.invalidateQueries(dep);
			});

			alertSuccess('Оборудование создано');
		} catch (error) {
			error.fieldErrors.forEach(item => {
				setError(item.field, { message: item.message });
			});

			alertError('Не удалось создать оборудование');
		}
	};

	const updateEquipment = useMutation(({ uuid, payload }) => equipmentsService.updateEquipment(uuid, payload));
	const handleOnUpdateEquipment = async () => {
		clearErrors();

		try {
			await updateEquipment.mutateAsync({ uuid: equipmentUuid, payload: getPreparedValues() });

			onClose();

			ENTITY_DEPS.EQUIPMENT.forEach(dep => {
				queryClient.invalidateQueries(dep);
			});

			alertSuccess('Оборудование сохранено');
		} catch (error) {
			error.fieldErrors.forEach(item => {
				setError(item.field, { message: item.message });
			});

			alertError('Не удалось сохранить оборудование');
		}
	};

	const handleOnSave = equipmentUuid ? handleOnUpdateEquipment : handleOnCreateEquipment;

	const isDisableSaveButton = isError || createEquipment.isLoading || updateEquipment.isLoading;

	return (
		<DrawerTemplate
			isOpen={isOpen}
			close={onClose}
			isLoading={isLoading}
			width="md"
			header={
				<Typography color="secondary" className="text-xl font-bold text-center">
					Оборудование
				</Typography>
			}
			content={
				isError ? (
					<ErrorMessage />
				) : (
					<div>
						<div className="mb-24">
							<Controller
								as={<TextField />}
								control={control}
								fullWidth
								label="Наименование"
								name="name"
								type="text"
								variant="outlined"
								error={!!errors.name}
								helperText={errors.name?.message}
							/>
						</div>

						<Typography color="secondary" className="text-base font-bold mb-20">
							Услуги с использованием оборудования
						</Typography>

						<Controller
							control={control}
							name="services"
							render={({ value, onChange }) => <FormServices services={value} onChange={onChange} />}
						/>
						{!!errors.services && (
							<Typography color="error" className="text-xs mb-20">
								{errors.services?.message}
							</Typography>
						)}
					</div>
				)
			}
			footer={
				<>
					<Button textNormal onClick={handleOnSave} disabled={isDisableSaveButton}>
						Сохранить
					</Button>
				</>
			}
		/>
	);
}

ModalEquipment.defaultProps = {
	equipmentUuid: ''
};

ModalEquipment.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	equipmentUuid: PropTypes.string
};
