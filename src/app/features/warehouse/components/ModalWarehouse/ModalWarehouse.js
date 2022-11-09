import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Controller, useForm } from 'react-hook-form';
import { Switch, Typography } from '@material-ui/core';
import { DrawerTemplate, Button, TextField, MenuItem } from '../../../../bizKITUi';
import { warehousesService, authService, ENTITY, ENTITY_DEPS } from '../../../../services';
import { useAlert } from '../../../../hooks';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { getFullName } from '../../../../utils';

const defaultValues = {
	name: '',
	responsible: '',
	for_sale: false
};

export function ModalWarehouse({ isOpen, onClose, warehouseUuid }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	const { control, getValues, reset, errors, setError, clearErrors } = useForm({
		mode: 'onBlur',
		defaultValues
	});
	const { data: listUsers, isLoading: isLoadingListUsers, isError: isErrorListUsers } = useQuery(
		[ENTITY.USER, { limit: Number.MAX_SAFE_INTEGER }],
		({ queryKey }) => authService.getUsers(queryKey[1])
	);

	const { isLoading: isLoadingWarehouse, isError: isErrorWarehouse, data: dataWarehouse } = useQuery(
		[ENTITY.WAREHOUSE, warehouseUuid],
		() => {
			if (warehouseUuid) {
				return warehousesService.getWarehouse(warehouseUuid);
			}
			return Promise.resolve();
		}
	);

	useEffect(() => {
		if (!dataWarehouse) {
			return;
		}

		reset({
			name: dataWarehouse.name,
			responsible: dataWarehouse.responsible.uuid
		});
	}, [dataWarehouse, reset]);

	const createWarehouse = useMutation(payload => warehousesService.createWarehouse(payload));
	const handleOnCreateWarehouse = () => {
		clearErrors();

		createWarehouse
			.mutateAsync(getValues())
			.then(() => {
				ENTITY_DEPS.WAREHOUSE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Новый склад успешно создан');
				onClose();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать новый склад');
			});
	};

	const updateWarehouse = useMutation(({ uuid, payload }) => warehousesService.updateWarehouse(uuid, payload));
	const handleOnUpdateWarehouse = () => {
		clearErrors();

		updateWarehouse
			.mutateAsync({ uuid: warehouseUuid, payload: getValues() })
			.then(() => {
				ENTITY_DEPS.WAREHOUSE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Склад успешно изменён');
				onClose();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось изменить склад');
			});
	};

	const title = warehouseUuid ? 'Редактировать новый склад' : 'Добавить новый склад';
	const isLoadingModal = isLoadingListUsers || (warehouseUuid && isLoadingWarehouse);
	const isError = isErrorListUsers || isErrorWarehouse;
	const submitAction = warehouseUuid ? handleOnUpdateWarehouse : handleOnCreateWarehouse;

	return (
		<DrawerTemplate
			isOpen={isOpen}
			close={onClose}
			isLoading={isLoadingModal}
			header={
				<Typography color="secondary" className="text-xl font-bold text-center">
					{title}
				</Typography>
			}
			width="sm"
			content={
				isError ? (
					<ErrorMessage />
				) : isLoadingModal ? (
					<></>
				) : (
					<>
						<Controller
							as={<TextField />}
							control={control}
							variant="outlined"
							label="Наименование склада"
							name="name"
							fullWidth
							className="mt-16"
							error={!!errors.name}
							helperText={errors.name?.message}
						/>

						<Controller
							as={<TextField />}
							control={control}
							variant="outlined"
							label="Ответственный"
							name="responsible"
							className="mt-16"
							fullWidth
							select
							error={!!errors.responsible}
							helperText={errors.responsible?.message}
						>
							{listUsers?.results.map(item => (
								<MenuItem key={item.uuid} value={item.uuid}>
									{getFullName(item)}
								</MenuItem>
							))}
						</Controller>
						<div className="flex items-center">
							<Typography color="secondary" className="text-16">
								Склад участвует в продажах
							</Typography>
							<Controller
								control={control}
								name="for_sale"
								render={({ value, onChange }) => (
									<Switch
										checked={value}
										onChange={event => {
											onChange(event.target.checked);
										}}
									/>
								)}
							/>
						</div>
					</>
				)
			}
			footer={
				<Button
					variant="contained"
					color="primary"
					textNormal
					disabled={createWarehouse.isLoading || updateWarehouse.isLoading}
					onClick={submitAction}
				>
					Сохранить
				</Button>
			}
		/>
	);
}
ModalWarehouse.defaultProps = {
	warehouseUuid: null
};
ModalWarehouse.propTypes = {
	warehouseUuid: PropTypes.string,
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired
};
