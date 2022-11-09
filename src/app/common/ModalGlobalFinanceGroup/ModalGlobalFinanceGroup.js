import React from 'react';
import { Typography } from '@material-ui/core';
import { useForm, Controller } from 'react-hook-form';
import PropTypes from 'prop-types';
import { useMutation, useQueryClient } from 'react-query';
import { Button, TextField, DrawerTemplate } from '../../bizKITUi';
import { useAlert } from '../../hooks';
import { globalFinanceService, ENTITY_DEPS } from '../../services';
import { GROUP_TYPE_COMING, GROUP_TYPE_MOVING, GROUP_TYPE_SPENDING } from '../../services/globalFinance/constants';
import { removeEmptyValuesFromObject } from '../../utils';
import { SelectFinanceType } from '../SelectFinanceType';
import { useUniqueId } from '../../hooks/useUniqueId/useUniqueId';

const stateTypeList = globalFinanceService.getGroupsTypeList();

const defaultValues = {
	name: '',
	type: GROUP_TYPE_SPENDING
};

export function ModalGlobalFinanceGroup({ isOpen, width, initialValues, onClose }) {
	const queryClient = useQueryClient();
	const uniqueIdForm = useUniqueId();
	const { alertSuccess, alertError } = useAlert();

	const { control, errors, getValues, setError, clearErrors } = useForm({
		mode: 'onBlur',
		defaultValues: {
			...defaultValues,
			...removeEmptyValuesFromObject(initialValues)
		}
	});

	const createGroup = useMutation(data => globalFinanceService.createGroup(data));
	const handleOnCreateGroup = event => {
		event.preventDefault();
		clearErrors();

		createGroup
			.mutateAsync(getValues())
			.then(() => {
				alertSuccess('Новая группа финансовых статей успешно создана');

				ENTITY_DEPS.GLOBAL_FINANCE_GROUP.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});

				onClose();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать новую группу финансовых статей');
			});
	};

	return (
		<DrawerTemplate
			isOpen={isOpen}
			close={onClose}
			width={width}
			header={
				<Typography color="secondary" className="text-xl font-bold text-center">
					Новая группа финансовых статей
				</Typography>
			}
			content={
				<form id={uniqueIdForm} onSubmit={handleOnCreateGroup}>
					<div className="mb-24">
						<Controller
							as={<TextField />}
							control={control}
							fullWidth
							label="Наименование категории"
							name="name"
							type="text"
							variant="outlined"
							error={!!errors.name}
							helperText={errors.name?.message}
						/>
					</div>

					<div className="max-w-sm">
						<Controller
							control={control}
							name="type"
							render={({ onChange, onBlur, value }) => (
								<SelectFinanceType
									checked={value}
									name="type"
									onChange={event => onChange(Number(event.target.value))}
									valueComing={GROUP_TYPE_COMING}
									valueSpending={GROUP_TYPE_SPENDING}
									valueMoving={GROUP_TYPE_MOVING}
									onBlur={onBlur}
								/>
							)}
						/>
					</div>
				</form>
			}
			footer={
				<Button
					form={uniqueIdForm}
					variant="contained"
					color="primary"
					disabled={createGroup.isLoading}
					textNormal
					type="submit"
				>
					Сохранить
				</Button>
			}
		/>
	);
}
ModalGlobalFinanceGroup.defaultProps = {
	initialValues: {},
	width: 'md'
};
ModalGlobalFinanceGroup.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	initialValues: PropTypes.shape({
		name: PropTypes.string,
		type: PropTypes.oneOf(stateTypeList.map(item => item.type))
	}),
	onClose: PropTypes.func.isRequired,
	width: PropTypes.string
};
