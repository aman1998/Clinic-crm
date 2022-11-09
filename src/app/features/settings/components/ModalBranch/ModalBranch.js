import { Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { Button, DrawerTemplate, TextField } from '../../../../bizKITUi';
import { defaults } from '../../../../utils';
import { useAlert } from '../../../../hooks';
import { useUniqueId } from '../../../../hooks/useUniqueId/useUniqueId';
import { ENTITY, ENTITY_DEPS, companiesService } from '../../../../services';

const defaultValues = {
	name: '',
	address: ''
};

export function ModalBranch({ isOpen, onClose, branchUuid }) {
	const queryClient = useQueryClient();
	const uniqueId = useUniqueId();

	const { alertSuccess, alertError } = useAlert();

	const { isLoading, isFetching, isError, data } = useQuery(
		[ENTITY.COMPANY_BRANCH, branchUuid],
		({ queryKey }) => companiesService.getCompanyBranch(queryKey[1]),
		{ enabled: !!branchUuid }
	);

	const { reset, getValues, setError, control, errors, clearErrors } = useForm({
		mode: 'onBlur',
		defaultValues
	});

	useEffect(() => {
		if (!data) {
			return;
		}

		reset(defaults(data, defaultValues));
	}, [branchUuid, data, reset]);

	const createBranch = useMutation(payload => companiesService.createCompanyBranch(payload));
	const handleOnCreateBranch = () => {
		clearErrors();

		createBranch
			.mutateAsync(getValues())
			.then(() => {
				ENTITY_DEPS.COMPANY_BRANCH.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});

				onClose();

				alertSuccess('Филиал успешно создан');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать филиал');
			});
	};

	const updateBranch = useMutation(({ uuid, payload }) => companiesService.updateCompanyBranch(uuid, payload));
	const handleOnUpdateBranch = () => {
		clearErrors();

		updateBranch
			.mutateAsync({ uuid: branchUuid, payload: getValues() })
			.then(() => {
				ENTITY_DEPS.COMPANY_BRANCH.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});

				onClose();

				alertSuccess('Филиал сохранён');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось сохранить филиал');
			});
	};

	const handleOnSave = branchUuid ? handleOnUpdateBranch : handleOnCreateBranch;
	const title = branchUuid ? 'Редактирование филиала' : 'Добавление филиала';

	return (
		<DrawerTemplate
			isOpen={isOpen}
			close={onClose}
			isLoading={isLoading}
			width="sm"
			header={
				<Typography color="secondary" className="text-16 sm:text-xl font-bold text-center">
					{title}
				</Typography>
			}
			content={
				isError ? (
					<ErrorMessage />
				) : (
					<form id={uniqueId}>
						<Controller
							as={<TextField />}
							control={control}
							fullWidth
							label="Наименование"
							name="name"
							type="text"
							variant="outlined"
							margin="normal"
							error={!!errors.name}
							helperText={errors.name?.message}
						/>

						<Controller
							as={<TextField />}
							control={control}
							fullWidth
							label="Адрес"
							name="address"
							type="text"
							variant="outlined"
							margin="normal"
							error={!!errors.address}
							helperText={errors.address?.message}
						/>
					</form>
				)
			}
			footer={
				<>
					<Button
						form={uniqueId}
						textNormal
						onClick={handleOnSave}
						disabled={isLoading || isFetching || updateBranch.isLoading || createBranch.isLoading}
					>
						Сохранить
					</Button>
				</>
			}
		/>
	);
}
ModalBranch.defaultProps = {
	branchUuid: null
};
ModalBranch.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	branchUuid: PropTypes.string
};
