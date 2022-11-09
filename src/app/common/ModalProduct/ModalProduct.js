import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Controller, useForm } from 'react-hook-form';
import { Typography, Grid, InputAdornment } from '@material-ui/core';
import { DrawerTemplate, Button, TextField, CurrencyTextField, ServerAutocomplete } from '../../bizKITUi';
import { productsService, companiesService, ENTITY_DEPS, ENTITY, packagesService } from '../../services';
import { useAlert } from '../../hooks';
import { ErrorMessage } from '../ErrorMessage';
import { defaults } from '../../utils';
import { ModalProductCategory } from '../ModalProductCategory';
import { ModalCompanyProvider } from '../ModalCompanyProvider';
import { TableProductCostHistory } from './TableProductCostHistory';
import { modalPromise } from '../ModalPromise';
import { PACKAGE_TYPE_PACK, PACKAGE_TYPE_PIECE } from '../../services/packages/constants';
import { ModalPackage } from '../ModalPackage';
import { normalizeNumberType } from '../../utils/normalizeNumber';

const defaultValues = {
	name: '',
	category: null,
	vendor_code: '',
	manufacturer: '',
	notification_minimum_amount: '',
	selling_price_percent: '',
	provider: null,
	purchase_price: '',
	sale_price: '',
	description: '',
	packing_unit: null,
	minimum_unit_of_measure: null,
	amount_in_package: '',
	bonus: null
};

export function ModalProduct({ isOpen, onClose, productUuid }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	const { control, getValues, reset, errors, setError, watch, clearErrors } = useForm({
		mode: 'onBlur',
		defaultValues
	});
	const watchFields = watch(['packing_unit']);

	const { isLoading: isLoadingProduct, isError: isErrorProduct, data: dataProduct } = useQuery(
		[ENTITY.PRODUCT, productUuid],
		() => {
			if (productUuid) {
				return productsService.getProduct(productUuid).then(res => res.data);
			}
			return Promise.resolve();
		}
	);

	useEffect(() => {
		if (!dataProduct) {
			return;
		}

		const data = defaults(
			{
				...dataProduct,
				category: dataProduct.category?.uuid
			},
			defaultValues
		);

		reset(data);
	}, [dataProduct, reset]);

	const getPreparedValues = () => {
		const { provider, ...values } = getValues();
		return {
			...values,
			bonus: Number(getValues().bonus),
			provider: provider?.uuid ? provider.uuid : provider,
			packing_unit: values.packing_unit?.uuid,
			minimum_unit_of_measure: values.minimum_unit_of_measure?.uuid
		};
	};

	const createProduct = useMutation(payload => productsService.createProduct(payload));
	const handleOnCreateProduct = () => {
		clearErrors();

		createProduct
			.mutateAsync(getPreparedValues())
			.then(({ data }) => {
				ENTITY_DEPS.PRODUCT.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				onClose();
				alertSuccess('Новый товар успешно создан');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать новый товар');
			});
	};

	const updateProduct = useMutation(({ uuid, payload }) => productsService.updateProduct(uuid, payload));
	const handleOnUpdateProduct = () => {
		clearErrors();
		const { amount_in_package } = getPreparedValues();
		if (amount_in_package < 1) setError('amount_in_package', { message: 'Количество не должно быть меньше 1' });
		else {
			updateProduct
				.mutateAsync({ uuid: productUuid, payload: getPreparedValues() })
				.then(({ data }) => {
					ENTITY_DEPS.PRODUCT.forEach(dep => {
						queryClient.invalidateQueries(dep);
					});
					onClose();
					alertSuccess('Продукт успешно изменён');
				})
				.catch(error => {
					error.fieldErrors.forEach(item => {
						setError(item.field, { message: item.message });
					});

					alertError('Не удалось изменить продукт');
				});
		}
	};

	const [isShowModalProductCategory, setIsShowModalProductCategory] = useState(false);
	const [isShowModalCompanyProvider, setIsShowModalCompanyProvider] = useState(false);

	const modalWidth = productUuid ? 'md' : 'sm';

	const title = productUuid ? 'Изменить товар' : 'Добавить новый товар';
	const submitAction = productUuid ? handleOnUpdateProduct : handleOnCreateProduct;
	const isLoading = productUuid && isLoadingProduct;
	const isError = isErrorProduct;

	return (
		<>
			<DrawerTemplate
				isOpen={isOpen}
				close={onClose}
				isLoading={isLoading}
				header={
					<Typography color="secondary" className="text-xl font-bold text-center">
						{title}
					</Typography>
				}
				width={modalWidth}
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

							<Controller
								control={control}
								name="category"
								render={({ onChange, ...props }) => (
									<ServerAutocomplete
										{...props}
										className="mt-16"
										getOptionLabel={option => option.name}
										label="Категория"
										InputProps={{
											error: !!errors.category,
											helperText: errors.category?.message
										}}
										onAdd={() => setIsShowModalProductCategory(true)}
										onFetchList={(name, limit) =>
											productsService
												.getProductCategories({
													name,
													limit
												})
												.then(({ data }) => data)
										}
										onFetchItem={uuid =>
											productsService.getProductCategory(uuid).then(({ data }) => data)
										}
										onChange={newValue => onChange(newValue?.uuid ?? null)}
									/>
								)}
							/>

							<Controller
								as={<TextField />}
								control={control}
								variant="outlined"
								label="Артикул"
								name="vendor_code"
								fullWidth
								className="mt-16"
								error={!!errors.vendor_code}
								helperText={errors.vendor_code?.message}
							/>

							<Grid container spacing={2}>
								<Grid item md={6} xs={12}>
									<Controller
										as={<TextField />}
										control={control}
										variant="outlined"
										label="Производитель"
										name="manufacturer"
										fullWidth
										className="mt-28"
										error={!!errors.manufacturer}
										helperText={errors.manufacturer?.message}
									/>
								</Grid>

								<Grid item md={6} xs={12}>
									<div className="text-right">
										<Button
											size="small"
											variant="text"
											textNormal
											onClick={() => setIsShowModalCompanyProvider(true)}
										>
											Создать поставщика
										</Button>
									</div>

									<Controller
										control={control}
										name="provider"
										render={({ onChange, ...props }) => (
											<ServerAutocomplete
												{...props}
												getOptionLabel={option => option.name}
												label="Поставщик"
												InputProps={{
													error: !!errors.provider,
													helperText: errors.provider?.message
												}}
												onFetchList={(name, limit) =>
													companiesService.getCompanyProviders({ name, limit })
												}
												onFetchItem={uuid =>
													companiesService.getCompanyProvider(uuid).then(({ data }) => data)
												}
												onChange={newValue => onChange(newValue?.uuid ?? null)}
											/>
										)}
									/>
								</Grid>
							</Grid>

							<Grid container spacing={2}>
								<Grid item md={6} xs={12}>
									<Controller
										as={<TextField />}
										control={control}
										variant="outlined"
										label="Мин. остаток для уведомления"
										name="notification_minimum_amount"
										fullWidth
										className="mt-16"
										error={!!errors.notification_minimum_amount}
										helperText={errors.notification_minimum_amount?.message}
										onKeyPress={normalizeNumberType}
									/>
								</Grid>

								<Grid item md={6} xs={12}>
									<Controller
										as={<TextField />}
										control={control}
										variant="outlined"
										label="Процент для цены продажи"
										name="selling_price_percent"
										fullWidth
										className="mt-16"
										error={!!errors.selling_price_percent}
										helperText={errors.selling_price_percent?.message}
										onKeyPress={normalizeNumberType}
									/>
								</Grid>
							</Grid>

							<Grid container spacing={2}>
								<Grid item md={6} xs={12}>
									<Controller
										control={control}
										name="purchase_price"
										render={({ value, onChange, onBlur }) => (
											<CurrencyTextField
												variant="outlined"
												label="Цена закупки"
												fullWidth
												className="mt-16"
												value={value}
												error={!!errors.purchase_price}
												helperText={errors.purchase_price?.message}
												onBlur={onBlur}
												onChange={(_, newValue) => onChange(newValue)}
											/>
										)}
									/>
								</Grid>

								<Grid item md={6} xs={12}>
									<Controller
										control={control}
										name="sale_price"
										render={({ value, onChange, onBlur }) => (
											<CurrencyTextField
												variant="outlined"
												label="Цена продажи"
												fullWidth
												className="mt-16"
												value={value}
												error={!!errors.sale_price}
												helperText={errors.sale_price?.message}
												onBlur={onBlur}
												onChange={(_, newValue) => onChange(newValue)}
											/>
										)}
									/>
								</Grid>
							</Grid>

							<Grid container spacing={2}>
								<Grid item md={6} xs={12}>
									<Controller
										as={
											<TextField
												fullWidth
												InputProps={{
													endAdornment: <InputAdornment position="end">%</InputAdornment>
												}}
											/>
										}
										control={control}
										variant="outlined"
										label="Бонус за продажу"
										name="bonus"
										className="mt-16"
										error={!!errors.bonus}
										helperText={errors.bonus?.message}
										onKeyPress={normalizeNumberType}
									/>
								</Grid>
							</Grid>

							<Controller
								as={<TextField />}
								control={control}
								variant="outlined"
								label="Описание"
								name="description"
								fullWidth
								className="mt-16"
								rows={3}
								multiline
								error={!!errors.description}
								helperText={errors.description?.message}
							/>

							<Typography color="secondary" className="text-base mt-16">
								Фасовка
							</Typography>

							<Controller
								control={control}
								name="minimum_unit_of_measure"
								render={({ onChange, ...props }) => (
									<ServerAutocomplete
										{...props}
										getOptionLabel={option => option.name}
										label="Минимальная единица измерения"
										className="mt-16"
										fullWidth
										InputProps={{
											error: !!errors.minimum_unit_of_measure,
											helperText: errors.minimum_unit_of_measure?.message
										}}
										onAdd={() =>
											modalPromise.open(({ onClose: handleClose }) => (
												<ModalPackage
													isOpen
													onClose={handleClose}
													packageType={PACKAGE_TYPE_PIECE}
												/>
											))
										}
										onFetchList={(name, limit) =>
											packagesService.getPackages({
												name,
												limit,
												type: PACKAGE_TYPE_PIECE
											})
										}
										onFetchItem={uuid => packagesService.getPackage(uuid)}
										onChange={value => onChange(value)}
									/>
								)}
							/>

							<Controller
								control={control}
								name="packing_unit"
								render={({ onChange, ...props }) => (
									<ServerAutocomplete
										{...props}
										getOptionLabel={option => option.name}
										label="Единица измерения фасовки"
										className="mt-16"
										fullWidth
										InputProps={{
											error: !!errors.packing_unit,
											helperText: errors.packing_unit?.message
										}}
										onAdd={() =>
											modalPromise.open(({ onClose: handleClose }) => (
												<ModalPackage
													isOpen
													onClose={handleClose}
													packageType={PACKAGE_TYPE_PACK}
												/>
											))
										}
										onFetchList={(name, limit) =>
											packagesService.getPackages({
												name,
												limit,
												type: PACKAGE_TYPE_PACK
											})
										}
										onFetchItem={uuid => packagesService.getPackage(uuid)}
										onChange={value => onChange(value)}
									/>
								)}
							/>

							{watchFields.packing_unit && (
								<Controller
									as={<TextField />}
									control={control}
									variant="outlined"
									label="Количество шт/ед/мл/гр в фасовке и т.д."
									name="amount_in_package"
									fullWidth
									className="mt-16"
									error={!!errors.amount_in_package}
									helperText={errors.amount_in_package?.message}
									onKeyPress={normalizeNumberType}
								/>
							)}

							{productUuid && (
								<div className="mt-64">
									<TableProductCostHistory productUuid={productUuid} />
								</div>
							)}
						</>
					)
				}
				footer={
					!isError && (
						<Button
							variant="contained"
							color="primary"
							textNormal
							disabled={createProduct.isLoading || updateProduct.isLoading}
							onClick={submitAction}
						>
							Сохранить
						</Button>
					)
				}
			/>

			<ModalProductCategory
				isOpen={isShowModalProductCategory}
				onClose={() => setIsShowModalProductCategory(false)}
			/>

			<ModalCompanyProvider
				isOpen={isShowModalCompanyProvider}
				onClose={() => setIsShowModalCompanyProvider(false)}
			/>
		</>
	);
}
ModalProduct.defaultProps = {
	productUuid: null
};
ModalProduct.propTypes = {
	productUuid: PropTypes.string,
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired
};
