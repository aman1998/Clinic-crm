import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Controller, useForm } from 'react-hook-form';
import { Typography } from '@material-ui/core';
import { DrawerTemplate, Button, TextField } from '../../bizKITUi';
import { useAlert } from '../../hooks';
import { ErrorMessage } from '../ErrorMessage';
import { packagesService, ENTITY, ENTITY_DEPS } from '../../services';
import FuseLoading from '../../../@fuse/core/FuseLoading';
import { defaults } from '../../utils';
import { PACKAGE_TYPE_PACK, PACKAGE_TYPE_PIECE } from '../../services/packages/constants';

const defaultValues = {
	name: ''
};

export function ModalPackage({ isOpen, onClose, packageUuid, packageType, initialValues }) {
	const { alertSuccess, alertError } = useAlert();
	const queryClient = useQueryClient();

	const { control, getValues, reset, errors, setError, clearErrors } = useForm({
		mode: 'onBlur',
		defaultValues: defaults(initialValues, defaultValues)
	});

	const { isLoading, isError, data } = useQuery(
		[ENTITY.PACKAGE, packageUuid],
		() => packagesService.getPackage(packageUuid),
		{ enabled: !!packageUuid }
	);

	useEffect(() => {
		if (!data) {
			return;
		}

		reset(defaults(data, defaultValues));
	}, [data, reset]);

	const createPackage = useMutation(payload => packagesService.createPackage(payload));
	const handleOnCreatePackage = () => {
		clearErrors();

		const values = {
			...getValues(),
			type: packageType
		};

		createPackage
			.mutateAsync(values)
			.then(response => {
				ENTITY_DEPS.PACKAGE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				onClose();

				alertSuccess('Новая единица измерения успешно создана');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать единицу измерения');
			});
	};

	const updatePackage = useMutation(({ uuid, payload }) => packagesService.updatePackage(uuid, payload));
	const handleOnUpdatePackage = () => {
		clearErrors();

		const values = {
			...getValues(),
			type: packageType
		};

		updatePackage
			.mutateAsync({ uuid: packageUuid, payload: values })
			.then(({ data: response }) => {
				ENTITY_DEPS.PACKAGE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				onClose();

				alertSuccess('Единица измерения успешно изменена');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось обновить единицу измерения');
			});
	};

	const title = packageUuid ? 'Изменить единицу измерения' : 'Новая единица измерения';
	const action = packageUuid ? handleOnUpdatePackage : handleOnCreatePackage;

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
					disabled={createPackage.isLoading || updatePackage.isLoading}
					onClick={action}
				>
					Сохранить
				</Button>
			}
		/>
	);
}
ModalPackage.defaultProps = {
	packageUuid: null,
	initialValues: {}
};
ModalPackage.propTypes = {
	packageUuid: PropTypes.string,
	packageType: PropTypes.oneOf([PACKAGE_TYPE_PIECE, PACKAGE_TYPE_PACK]).isRequired,
	initialValues: PropTypes.shape({
		name: PropTypes.string
	}),
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired
};
