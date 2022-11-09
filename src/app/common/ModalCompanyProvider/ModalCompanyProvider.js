import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Controller, useForm } from 'react-hook-form';
import { Typography } from '@material-ui/core';
import { DrawerTemplate, Button, TextField, PhoneField } from '../../bizKITUi';
import { useAlert } from '../../hooks';
import { ErrorMessage } from '../ErrorMessage';
import { companiesService, ENTITY, ENTITY_DEPS } from '../../services';
import FuseLoading from '../../../@fuse/core/FuseLoading';
import { defaults } from '../../utils';

const defaultValues = {
	name: '',
	phone: '',
	email: '',
	address: '',
	description: ''
};

export function ModalCompanyProvider({ isOpen, onClose, companyProviderUuid, onUpdate }) {
	const { alertSuccess, alertError } = useAlert();
	const queryClient = useQueryClient();

	const { control, getValues, reset, errors, setError, clearErrors } = useForm({
		mode: 'onBlur',
		defaultValues
	});

	const { isLoading, isError, data } = useQuery([ENTITY.PROVIDER, companyProviderUuid], () => {
		if (companyProviderUuid) {
			return companiesService.getCompanyProvider(companyProviderUuid).then(({ data: results }) => results);
		}
		return Promise.resolve();
	});

	useEffect(() => {
		if (!data) {
			return;
		}

		reset(defaults(data, defaultValues));
	}, [data, reset]);

	const title = companyProviderUuid ? 'Изменить поставщика' : 'Новый поставщик';

	const createProvider = useMutation(payload => companiesService.createCompanyProvider(payload));
	const handleOnCreateCompanyProvider = () => {
		clearErrors();

		createProvider
			.mutateAsync(getValues())
			.then(({ data: response }) => {
				ENTITY_DEPS.PROVIDER.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				onUpdate(response.uuid);
				onClose();

				alertSuccess('Новый поставщик успешно создан');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать поставщика');
			});
	};

	const updateProvider = useMutation(({ uuid, payload }) => companiesService.updateCompanyProvider(uuid, payload));
	const handleOnUpdateCompanyProvider = () => {
		clearErrors();

		updateProvider
			.mutateAsync({ uuid: companyProviderUuid, payload: getValues() })
			.then(({ data: response }) => {
				ENTITY_DEPS.PROVIDER.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				onUpdate(response.uuid);
				onClose();

				alertSuccess('Поставщик успешно изменён');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось обновить поставщика');
			});
	};

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
					<>
						<Controller
							as={<TextField />}
							control={control}
							variant="outlined"
							label="Наименование"
							name="name"
							fullWidth
							className="mt-16"
							error={!!errors.name}
							helperText={errors.name?.message}
						/>

						<Controller
							as={<PhoneField />}
							control={control}
							variant="outlined"
							label="Телефон"
							name="phone"
							fullWidth
							className="mt-16"
							error={!!errors.phone}
							helperText={errors.phone?.message}
						/>

						<Controller
							as={<TextField />}
							control={control}
							variant="outlined"
							label="Email"
							name="email"
							fullWidth
							className="mt-16"
							error={!!errors.email}
							helperText={errors.email?.message}
						/>

						<Controller
							as={<TextField />}
							control={control}
							variant="outlined"
							label="Адрес"
							name="address"
							fullWidth
							className="mt-16"
							error={!!errors.address}
							helperText={errors.address?.message}
						/>

						<Controller
							as={<TextField />}
							control={control}
							variant="outlined"
							label="Описание"
							name="description"
							fullWidth
							className="mt-16"
							error={!!errors.description}
							helperText={errors.description?.message}
						/>
					</>
				)
			}
			footer={
				companyProviderUuid ? (
					<Button
						variant="contained"
						color="primary"
						textNormal
						disabled={updateProvider.isLoading}
						onClick={handleOnUpdateCompanyProvider}
					>
						Изменить
					</Button>
				) : (
					<Button
						variant="contained"
						color="primary"
						textNormal
						disabled={createProvider.isLoading}
						onClick={handleOnCreateCompanyProvider}
					>
						Сохранить
					</Button>
				)
			}
		/>
	);
}
ModalCompanyProvider.defaultProps = {
	companyProviderUuid: null,
	onUpdate: () => {}
};
ModalCompanyProvider.propTypes = {
	companyProviderUuid: PropTypes.string,
	onUpdate: PropTypes.func,
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired
};
