import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Divider, List, ListItem, ListItemSecondaryAction, ListItemText, Switch, Typography } from '@material-ui/core';
import { Button, DrawerTemplate, TextField } from '../../../../bizKITUi';
import { authService, ENTITY, ENTITY_DEPS } from '../../../../services';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { useUniqueId } from '../../../../hooks/useUniqueId/useUniqueId';
import { useAlert } from '../../../../hooks';

const defaultValues = {
	name: '',
	permissions: []
};

const transformData = values => {
	return { ...values, permissions: values.permissions.filter(item => item.active).map(item => item.id) };
};

export function ModalGroup({ groupId, isOpen, onClose }) {
	const { alertSuccess, alertError } = useAlert();
	const queryClient = useQueryClient();
	const { isLoading, isError, data } = useQuery([ENTITY.GROUP, groupId], () => {
		if (groupId) {
			return authService.getGroup(groupId);
		}
		return Promise.resolve();
	});
	const { isLoading: isLoadingPermissions, isError: isErrorPermissions, data: listPermissions } = useQuery(
		[ENTITY.PERMISSION, { limit: Number.MAX_SAFE_INTEGER }],
		({ queryKey }) => authService.getPermissions(queryKey[1])
	);

	const { errors, reset, register, handleSubmit, control } = useForm({
		mode: 'onBlur',
		defaultValues
	});
	const { fields } = useFieldArray({ control, name: 'permissions' });

	const [isPopulated, setIsPopulated] = useState(false);
	useEffect(() => {
		if ((groupId && !data) || !listPermissions) {
			return;
		}
		reset({
			name: data?.name ?? defaultValues.name,
			permissions: listPermissions.results.map(item => ({
				...item,
				active: data?.permissions?.some(p => p.id === item.id) ?? false
			}))
		});
		setIsPopulated(true);
	}, [data, groupId, listPermissions, reset]);

	const createGroup = useMutation(payload => authService.createGroup(payload));
	const handleCreate = values => {
		createGroup
			.mutateAsync(transformData(values))
			.then(() => {
				ENTITY_DEPS.GROUP.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				onClose();
				alertSuccess('Группа успешно создана');
			})
			.catch(() => {
				alertError('Не удалось создать группу');
			});
	};

	const updateGroup = useMutation(({ id, payload }) => authService.updateGroup(id, payload));
	const handleUpdate = values => {
		updateGroup
			.mutateAsync({ id: groupId, payload: transformData(values) })
			.then(() => {
				ENTITY_DEPS.GROUP.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				onClose();
				alertSuccess('Группа успешно обновлена');
			})
			.catch(() => {
				alertError('Не удалось обновить группу');
			});
	};

	const formId = useUniqueId();
	const title = groupId ? 'Редактирование группы' : 'Новая группа пользователей';
	const submitAction = groupId ? handleUpdate : handleCreate;

	return (
		<>
			<DrawerTemplate
				isOpen={isOpen}
				isLoading={!isPopulated || isLoading || isLoadingPermissions}
				close={onClose}
				width="sm"
				header={
					<Typography color="secondary" className="text-xl font-bold text-center">
						{title}
					</Typography>
				}
				content={
					<>
						{!isPopulated || isLoading || isLoadingPermissions ? (
							<></>
						) : isError || isErrorPermissions ? (
							<ErrorMessage />
						) : (
							<form id={formId} onSubmit={handleSubmit(values => submitAction(values))}>
								<Controller
									as={<TextField />}
									control={control}
									fullWidth
									label="Наименование группы"
									variant="outlined"
									name="name"
									error={!!errors.name}
									helperText={errors.name?.message}
								/>
								<List>
									{fields.map((field, idx) => (
										<Fragment key={field.id}>
											<ListItem>
												<ListItemText>{field.name}</ListItemText>
												<ListItemSecondaryAction>
													<input
														ref={register()}
														type="hidden"
														name={`permissions[${idx}].id`}
														value={field.id}
													/>
													<Controller
														name={`permissions[${idx}].active`}
														defaultValue={field.active}
														control={control}
														render={({ value, onChange, onBlur, name }) => (
															<Switch
																edge="end"
																name={name}
																checked={value}
																onChange={e => onChange(e.target.checked)}
																onBlur={onBlur}
															/>
														)}
													/>
												</ListItemSecondaryAction>
											</ListItem>
											<Divider />
										</Fragment>
									))}
								</List>
							</form>
						)}
					</>
				}
				footer={
					<Button
						disabled={createGroup.isLoading || updateGroup.isLoading}
						type="submit"
						form={formId}
						textNormal
					>
						Сохранить
					</Button>
				}
			/>
		</>
	);
}
ModalGroup.propTypes = {
	groupId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired
};
