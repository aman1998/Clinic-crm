import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Controller, useForm } from 'react-hook-form';
import { Grid, MenuItem, Switch, Typography } from '@material-ui/core';
import { PRODUCT_PROMOTION_STATUS_TYPE_DISABLED } from 'app/services/products/constants';
import { Button, DatePickerField, DrawerTemplate, TextField } from '../../../../bizKITUi';
import { useAlert } from '../../../../hooks';
import {
	PROMOTION_STATUS_ACTIVE,
	PROMOTION_TYPE_CASHBACK,
	PROMOTION_TYPE_DISCOUNT
} from '../../../../services/finance/constants';
import { ENTITY, ENTITY_DEPS, productsService } from '../../../../services';
import { defaults } from '../../../../utils';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { normalizeNumberType } from '../../../../utils/normalizeNumber';
import { TableProducts } from './TableProducts';
import { TableCategories } from './TableCategories';

const defaultValues = {
	name: '',
	type: PROMOTION_TYPE_CASHBACK,
	status: '',
	date_time_start: null,
	date_time_end: null,
	accrual_percent: '',
	write_off_percent: '',
	write_off_limit: '',
	services: []
};

export function ModalPromotion({ promotionUuid, isOpen, onClose }) {
	const { alertSuccess, alertError } = useAlert();
	const queryClient = useQueryClient();

	const [currentPromotionUuid, setCurrentPromotionUuid] = useState(promotionUuid);
	const [showProductsCases, setShowProductsCases] = useState(false);
	const [showProductCategories, setShowProductCategories] = useState(false);

	const { setError, errors, control, clearErrors, getValues, watch, reset } = useForm({
		mode: 'onBlur',
		defaultValues
	});
	const watchFields = watch(['type']);

	const { isLoading, isError, data } = useQuery(
		[ENTITY.PROMOTION, currentPromotionUuid],
		() => productsService.getProductPromotion(currentPromotionUuid),
		{ enabled: !!currentPromotionUuid }
	);

	useEffect(() => {
		if (!data) {
			return;
		}
		if (data.services?.length > 0) {
			setShowProductsCases(true);
		}
		reset(defaults(data, defaultValues));
	}, [data, reset]);

	const createPromotion = useMutation(payload => productsService.createProductPromotion(payload));
	const handleCreate = () => {
		const values = getValues();
		const payload = {
			...values,
			products: showProductsCases ? values.products : [],
			categories: showProductCategories ? values.categoriesproducts : []
		};
		createPromotion
			.mutateAsync(payload)
			.then(({ data: results }) => {
				ENTITY_DEPS.PROMOTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				clearErrors();
				setCurrentPromotionUuid(results.uuid);
				alertSuccess('Акция успешно создана');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});
				alertError(error.userMessage || 'Не удалось создать акцию');
			});
	};

	const updatePromotion = useMutation(({ uuid, payload }) => productsService.updateProductPromotion(uuid, payload));
	const handleUpdate = () => {
		const values = getValues();
		const payload = {
			...values,
			products: showProductsCases ? values.products : [],
			categories: showProductCategories ? values.categoriesproducts : []
		};
		updatePromotion
			.mutateAsync({ uuid: currentPromotionUuid, payload })
			.then(() => {
				ENTITY_DEPS.PROMOTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				clearErrors();
				alertSuccess('Акция успешно сохранена');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});
				alertError(error.userMessage || 'Не удалось сохранить акцию');
			});
	};

	const activatePromotion = useMutation(uuid => productsService.activateProductPromotion(uuid));
	const handleActivate = () => {
		activatePromotion
			.mutateAsync(currentPromotionUuid)
			.then(() => {
				ENTITY_DEPS.PROMOTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				clearErrors();
				alertSuccess('Акция успешно активирована');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});
				alertError(error.userMessage || 'Не удалось активировать акцию');
			});
	};

	const completePromotion = useMutation(uuid => productsService.completeProductPromotion(uuid));
	const handleComplete = () => {
		completePromotion
			.mutateAsync(currentPromotionUuid)
			.then(() => {
				ENTITY_DEPS.PROMOTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				clearErrors();
				alertSuccess('Акция успешно завершена');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});
				alertError(error.userMessage || 'Не удалось завершить акцию');
			});
	};

	const isSomeLoading =
		isLoading ||
		createPromotion.isLoading ||
		updatePromotion.isLoading ||
		activatePromotion.isLoading ||
		completePromotion.isLoading;
	const isActive = data?.status === PROMOTION_STATUS_ACTIVE;
	const isCompleted = data?.status === PRODUCT_PROMOTION_STATUS_TYPE_DISABLED;

	return (
		<>
			<DrawerTemplate
				isOpen={isOpen}
				close={onClose}
				width="sm"
				isLoading={isLoading}
				header={
					<Typography color="secondary" className="text-xl font-bold text-center">
						{currentPromotionUuid ? 'Редактирование акции' : 'Новая акция'}
					</Typography>
				}
				content={
					isLoading ? (
						<></>
					) : isError ? (
						<ErrorMessage />
					) : (
						<>
							<Grid container spacing={2}>
								<Grid item xs={12}>
									<Controller
										control={control}
										name="name"
										as={
											<TextField
												label="Наименование"
												fullWidth
												margin="none"
												variant="outlined"
												error={!!errors.name}
												helperText={errors.name?.message}
											/>
										}
									/>
								</Grid>
								<Grid item xs={12} md={6}>
									<Controller
										control={control}
										name="type"
										as={
											<TextField
												label="Тип"
												select
												fullWidth
												margin="none"
												variant="outlined"
												InputProps={{ readOnly: !!currentPromotionUuid }}
												error={!!errors.type}
												helperText={errors.type?.message}
											>
												{productsService.getProductPromotionTypeList().map(item => (
													<MenuItem key={item.type} value={item.type}>
														{item.name}
													</MenuItem>
												))}
											</TextField>
										}
									/>
								</Grid>
								<Grid item xs={12} md={6}>
									<TextField
										label="Статус"
										value={productsService.getPromotionStatusNameByType(data?.status)}
										InputProps={{ readOnly: true }}
										fullWidth
										margin="none"
										variant="outlined"
									/>
								</Grid>
								<Grid item xs={12} md={6}>
									<Controller
										control={control}
										name="date_time_start"
										as={
											<DatePickerField
												label="Дата начала"
												fullWidth
												margin="none"
												variant="outlined"
												error={!!errors.date_time_start}
												helperText={errors.date_time_start?.message}
											/>
										}
									/>
								</Grid>
								<Grid item xs={12} md={6}>
									<Controller
										control={control}
										name="date_time_end"
										as={
											<DatePickerField
												label="Дата окончания"
												fullWidth
												margin="none"
												variant="outlined"
												error={!!errors.date_time_end}
												helperText={errors.date_time_end?.message}
											/>
										}
									/>
								</Grid>
								{watchFields.type === PROMOTION_TYPE_CASHBACK ? (
									<>
										<Grid item xs={12} md={6}>
											<Controller
												control={control}
												name="accrual_percent"
												as={
													<TextField
														label="Процент начисления"
														fullWidth
														margin="none"
														inputProps={{ min: 0, max: 100 }}
														variant="outlined"
														error={!!errors.accrual_percent}
														helperText={errors.accrual_percent?.message}
														onKeyPress={normalizeNumberType}
													/>
												}
											/>
										</Grid>
										<Grid item xs={12} md={6}>
											<Controller
												control={control}
												name="write_off_limit"
												as={
													<TextField
														label="Лимит списания"
														fullWidth
														inputProps={{ min: 0, max: 100 }}
														margin="none"
														variant="outlined"
														error={!!errors.write_off_limit}
														helperText={errors.write_off_limit?.message}
														onKeyPress={normalizeNumberType}
													/>
												}
											/>
										</Grid>
									</>
								) : watchFields.type === PROMOTION_TYPE_DISCOUNT ? (
									<Grid item xs={12} md={6}>
										<Controller
											control={control}
											name="write_off_percent"
											as={
												<TextField
													label="Процент списания"
													fullWidth
													inputProps={{ min: 0, max: 100 }}
													margin="none"
													variant="outlined"
													error={!!errors.write_off_percent}
													helperText={errors.write_off_percent?.message}
													onKeyPress={normalizeNumberType}
												/>
											}
										/>
									</Grid>
								) : null}
							</Grid>

							<div className="flex justify-between items-center my-16">
								<Typography className="font-bold">Использовать в определенных товарах</Typography>
								<Switch
									checked={showProductsCases}
									onChange={event => {
										setShowProductsCases(event.target.checked);
										setShowProductCategories(false);
									}}
								/>
							</div>

							{showProductsCases && (
								<Controller
									control={control}
									name="products"
									render={({ value, onChange }) => (
										<TableProducts products={value} onChange={onChange} />
									)}
								/>
							)}

							<div className="flex justify-between items-center my-16">
								<Typography className="font-bold">
									Использовать в определенных категориях товаров
								</Typography>
								<Switch
									checked={showProductCategories}
									onChange={event => {
										setShowProductCategories(event.target.checked);
										setShowProductsCases(false);
									}}
								/>
							</div>

							{showProductCategories && (
								<Controller
									control={control}
									name="categories"
									render={({ value, onChange }) => (
										<TableCategories categories={value} onChange={onChange} />
									)}
								/>
							)}
						</>
					)
				}
				footer={
					<>
						<Button
							textNormal
							disabled={isSomeLoading}
							onClick={currentPromotionUuid ? handleUpdate : handleCreate}
						>
							Сохранить
						</Button>
						{isActive && (
							<Button
								className="ml-16"
								customColor="secondary"
								textNormal
								disabled={isSomeLoading}
								onClick={handleComplete}
							>
								Завершить акцию
							</Button>
						)}
						{isCompleted && (
							<Button
								className="ml-16"
								customColor="primary"
								textNormal
								disabled={isSomeLoading}
								onClick={handleActivate}
							>
								Включить акцию
							</Button>
						)}
					</>
				}
			/>
		</>
	);
}

ModalPromotion.defaultProps = {
	promotionUuid: null
};

ModalPromotion.propTypes = {
	promotionUuid: PropTypes.string,
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired
};
