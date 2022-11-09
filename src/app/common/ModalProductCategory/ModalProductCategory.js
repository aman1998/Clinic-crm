import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Controller, useForm } from 'react-hook-form';
import { Typography } from '@material-ui/core';
import { DrawerTemplate, Button, TextField } from '../../bizKITUi';
import { useAlert } from '../../hooks';
import { ErrorMessage } from '../ErrorMessage';
import { ENTITY, ENTITY_DEPS, productsService } from '../../services';
import { defaults } from '../../utils';

const defaultValues = {
	name: ''
};

export function ModalProductCategory({ isOpen, onClose, productCategoryUuid, onUpdate }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	const { control, getValues, reset, errors, setError, clearErrors } = useForm({
		mode: 'onBlur',
		defaultValues
	});

	const { isLoading, isError, data } = useQuery(
		[ENTITY.PRODUCT_CATEGORY, productCategoryUuid],
		() => productsService.getProductCategory(productCategoryUuid).then(res => res.data),
		{ enabled: !!productCategoryUuid }
	);

	useEffect(() => {
		if (!data) {
			return;
		}

		reset(defaults(data, defaultValues));
	}, [data, reset]);

	const title = productCategoryUuid ? 'Изменить категорию' : 'Добавить новую категорию';

	const createCategory = useMutation(payload => productsService.createProductCategory(payload));
	const handleOnCreate = () => {
		clearErrors();

		createCategory
			.mutateAsync(getValues())
			.then(() => {
				ENTITY_DEPS.PRODUCT_CATEGORY.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Новая категория успешно создана');
				onClose();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать категорию');
			});
	};

	const updateCategory = useMutation(({ uuid, payload }) => productsService.updateProductCategory(uuid, payload));
	const handleOnUpdate = () => {
		clearErrors();

		updateCategory
			.mutateAsync({ uuid: productCategoryUuid, payload: getValues() })
			.then(() => {
				ENTITY_DEPS.PRODUCT_CATEGORY.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Категория успешно изменена');
				onClose();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось изменить категорию');
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
				isError ? (
					<ErrorMessage />
				) : isLoading ? (
					<></>
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
					</>
				)
			}
			footer={
				productCategoryUuid ? (
					<Button
						variant="contained"
						color="primary"
						textNormal
						disabled={updateCategory.isLoading}
						onClick={handleOnUpdate}
					>
						Изменить
					</Button>
				) : (
					<Button
						variant="contained"
						color="primary"
						textNormal
						disabled={createCategory.isLoading}
						onClick={handleOnCreate}
					>
						Сохранить
					</Button>
				)
			}
		/>
	);
}
ModalProductCategory.defaultProps = {
	productCategoryUuid: null,
	onUpdate: () => {}
};
ModalProductCategory.propTypes = {
	productCategoryUuid: PropTypes.string,
	onUpdate: PropTypes.func,
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired
};
