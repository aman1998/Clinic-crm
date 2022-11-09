import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Controller, useForm } from 'react-hook-form';
import { Typography } from '@material-ui/core';
import { DrawerTemplate, Button, TextField } from '../../../../bizKITUi';
import { useAlert } from '../../../../hooks';
import { ENTITY, ENTITY_DEPS, sourceHandbooksService } from '../../../../services';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { defaults } from '../../../../utils';
import { ErrorMessage } from '../../../../common/ErrorMessage';

const defaultValues = {
	name: ''
};

export function ModalSourceHandbook({ isOpen, onClose, sourceUuid }) {
	const { alertSuccess, alertError } = useAlert();
	const queryClient = useQueryClient();

	const { control, getValues, reset, errors, setError, clearErrors } = useForm({
		mode: 'onBlur',
		defaultValues
	});

	const { isLoading, isError, data } = useQuery(
		[ENTITY.SOURCE_HANDBOOK, sourceUuid],
		() => sourceHandbooksService.getSource(sourceUuid),
		{ enabled: !!sourceUuid }
	);

	useEffect(() => {
		if (!data) {
			return;
		}

		reset(defaults(data, defaultValues));
	}, [data, reset]);

	const createSource = useMutation(payload => sourceHandbooksService.createSource(payload));
	const handleOnCreatePackage = () => {
		clearErrors();

		createSource
			.mutateAsync(getValues())
			.then(response => {
				ENTITY_DEPS.SOURCE_HANDBOOK.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				onClose();

				alertSuccess('Новый источник успешно создан');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать источник');
			});
	};

	const updateSource = useMutation(({ uuid, payload }) => sourceHandbooksService.updateSource(uuid, payload));
	const handleOnUpdatePackage = () => {
		clearErrors();

		updateSource
			.mutateAsync({ uuid: sourceUuid, payload: getValues() })
			.then(({ data: response }) => {
				ENTITY_DEPS.SOURCE_HANDBOOK.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				onClose();

				alertSuccess('Источник успешно изменён');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось обновить источник');
			});
	};

	const title = sourceUuid ? 'Изменить источник' : 'Новый источник';
	const action = sourceUuid ? handleOnUpdatePackage : handleOnCreatePackage;

	return (
		<DrawerTemplate
			isOpen={isOpen}
			close={onClose}
			isLoading={isLoading}
			header={
				<Typography color="secondary" className="text-xl font-bold text-center">
					{title}
				</Typography>
			}
			width="sm"
			content={
				isLoading ? (
					<FuseLoading />
				) : isError ? (
					<ErrorMessage />
				) : (
					<Controller
						as={<TextField />}
						control={control}
						variant="outlined"
						label="Наименование"
						name="name"
						fullWidth
						margin="normal"
						error={!!errors.name}
						helperText={errors.name?.message}
					/>
				)
			}
			footer={
				<Button
					variant="contained"
					color="primary"
					textNormal
					disabled={createSource.isLoading || updateSource.isLoading}
					onClick={action}
				>
					Сохранить
				</Button>
			}
		/>
	);
}
ModalSourceHandbook.defaultProps = {
	sourceUuid: null
};
ModalSourceHandbook.propTypes = {
	sourceUuid: PropTypes.string,
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired
};
