import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import { Typography } from '@material-ui/core';
import { Button, TextField, DrawerTemplate } from '../../bizKITUi';
import { useAlert } from '../../hooks';
import { ErrorMessage } from '../ErrorMessage';
import { clinicService, ENTITY, ENTITY_DEPS } from '../../services';

const defaultValues = {
	name: ''
};

export function ModalClinicDirection({ isOpen, uuid, onClose, onUpdate }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	const { setError, errors, control, clearErrors, getValues, reset } = useForm({
		mode: 'onBlur',
		defaultValues
	});

	const createDirection = useMutation(data => clinicService.createClinicDirection(data));
	const handleOnCreateClinicDirection = () => {
		clearErrors();

		createDirection
			.mutateAsync(getValues())
			.then(() => {
				onUpdate();
				onClose();
				alertSuccess('Направление успешно создано');
				ENTITY_DEPS.DIRECTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать направление');
			});
	};

	const updateDirection = useMutation(({ id, payload }) => clinicService.updateClinicDirection(id, payload));
	const handleOnUpdateClinicDirection = () => {
		clearErrors();

		updateDirection
			.mutateAsync({ id: uuid, payload: getValues() })
			.then(() => {
				onUpdate();
				onClose();
				alertSuccess('Направление успешно обновлено');
				ENTITY_DEPS.DIRECTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось обновить направление');
			});
	};

	const { isLoading: isLoadingDirection, isError: isErrorDirection, data: dataDirection } = useQuery(
		[ENTITY.DIRECTION, uuid],
		() => {
			if (uuid) {
				return clinicService.getDirectionById(uuid);
			}
			return Promise.resolve();
		}
	);
	useEffect(() => {
		if (!dataDirection) {
			return;
		}

		reset({
			name: dataDirection.name
		});
	}, [dataDirection, reset]);

	const actionHandler = uuid ? handleOnUpdateClinicDirection : handleOnCreateClinicDirection;

	return (
		<>
			<DrawerTemplate
				isOpen={isOpen}
				close={onClose}
				width="sm"
				isLoading={isLoadingDirection}
				header={
					<Typography color="secondary" className="text-xl font-bold text-center">
						{uuid ? 'Редактировать направление' : 'Добавить новое направление'}
					</Typography>
				}
				content={
					isErrorDirection ? (
						<ErrorMessage />
					) : (
						<>
							<Typography color="secondary" className="text-16 font-bold">
								Общая информация
							</Typography>
							<Controller
								as={<TextField />}
								control={control}
								className="mt-20"
								fullWidth
								label="Наименование"
								variant="outlined"
								name="name"
								error={!!errors.name}
								helperText={errors.name?.message}
							/>
						</>
					)
				}
				footer={
					!isErrorDirection && (
						<Button
							textNormal
							type="submit"
							disabled={createDirection.isLoading || updateDirection.isLoading}
							onClick={actionHandler}
						>
							Сохранить
						</Button>
					)
				}
			/>
		</>
	);
}
ModalClinicDirection.defaultProps = {
	uuid: null,
	onUpdate: () => {}
};
ModalClinicDirection.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onUpdate: PropTypes.func,
	uuid: PropTypes.string
};
