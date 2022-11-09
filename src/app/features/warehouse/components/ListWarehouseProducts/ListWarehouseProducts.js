import React, { useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { IconButton, Paper } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, DataTable, Button, ServerAutocomplete } from '../../../../bizKITUi';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ContextMenu } from '../../pages/Warehouse';
import { useConfirm, useAlert, useDebouncedFilterForm } from '../../../../hooks';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { numberFormat } from '../../../../utils';
import { ModalProduct } from '../../../../common/ModalProduct';
import { ModalWaybill } from '../../../../common/ModalWaybill';

import { productsService, companiesService, ENTITY, ENTITY_DEPS } from '../../../../services';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: '430px 1fr 1fr',
		[theme.breakpoints.down(1279)]: {
			gridTemplateColumns: '2fr 1fr'
		},
		[theme.breakpoints.down(767)]: {
			gridTemplateColumns: '1fr'
		}
	},
	btnReset: {
		display: 'flex',
		justifyContent: 'flex-end',
		marginLeft: 'auto',
		[theme.breakpoints.down(1279)]: {
			margin: '0',
			justifyContent: 'flex-start'
		}
	}
}));

export function ListWarehouseProducts() {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();
	const classes = useStyles();
	const [openModalConfirm] = useConfirm();

	const { form, debouncedForm, getPage, setPage, handleChange, resetForm, setInForm } = useDebouncedFilterForm({
		name_vendor_code_manufacturer: '',
		provider: null,
		limit: 10,
		offset: 0
	});

	const { isLoading, isError, data } = useQuery([ENTITY.PRODUCT, debouncedForm], ({ queryKey }) =>
		productsService.getProducts(queryKey[1]).then(res => res.data)
	);

	const [isShowModalWaybill, setIsShowModalWaybill] = useState(false);

	const setMenu = useContext(ContextMenu);
	useEffect(() => {
		setMenu(
			<div className="flex">
				<Button
					textNormal
					variant="outlined"
					className="whitespace-no-wrap mr-10"
					onClick={() => setIsShowModalProduct(true)}
				>
					Добавить товар
				</Button>
				<Button textNormal className="whitespace-no-wrap" onClick={() => setIsShowModalWaybill(true)}>
					Добавить накладную
				</Button>
			</div>
		);

		return () => setMenu(null);
	}, [setMenu]);

	const [isShowModalProduct, setIsShowModalProduct] = useState(false);
	const [selectedProductUuid, setSelectedProductUuid] = useState(null);
	const handleOnCloseModalProduct = () => {
		setIsShowModalProduct(false);
		setSelectedProductUuid(null);
	};
	const handleOnUpdateProduct = uuid => {
		setIsShowModalProduct(true);
		setSelectedProductUuid(uuid);
	};

	const deleteProduct = useMutation(uuid => productsService.deleteProduct(uuid));
	const handleOnDeleteProduct = useCallback(
		uuid => {
			deleteProduct
				.mutateAsync(uuid)
				.then(() => {
					ENTITY_DEPS.PRODUCT.forEach(dep => {
						queryClient.invalidateQueries(dep);
					});
					alertSuccess('Продукт успешно удалён');
				})
				.catch(() => {
					alertError('Не удалось удалить продукт');
				});
		},
		[alertError, alertSuccess, deleteProduct, queryClient]
	);

	const columns = useMemo(
		() => [
			{
				name: 'vendor_code',
				label: 'Артикул'
			},
			{
				name: 'name',
				label: 'Наименование'
			},
			{
				name: 'manufacturer',
				label: 'Производитель',
				options: {
					customBodyRenderLite: dataIndex => {
						const { manufacturer } = data.results[dataIndex];

						return manufacturer || '—';
					}
				}
			},
			{
				name: 'provider',
				label: 'Поставщик',
				options: {
					customBodyRenderLite: dataIndex => {
						const { provider } = data.results[dataIndex];

						return provider?.name ?? '—';
					}
				}
			},
			{
				name: 'purchase_price',
				label: 'Цена закупки',
				options: {
					customBodyRenderLite: dataIndex => {
						const { purchase_price } = data.results[dataIndex];

						return numberFormat.currency(purchase_price);
					}
				}
			},
			{
				name: 'sale_price',
				label: 'Цена продажи',
				options: {
					customBodyRenderLite: dataIndex => {
						const { sale_price } = data.results[dataIndex];

						return numberFormat.currency(sale_price);
					}
				}
			},
			{
				name: 'actions',
				label: 'Действия',
				options: {
					setCellHeaderProps: () => ({ style: { textAlign: 'right' } }),
					customBodyRenderLite: dataIndex => {
						const { uuid } = data.results[dataIndex];

						return (
							<div className="flex justify-end">
								<IconButton
									aria-label="Редактировать продукт"
									disabled={deleteProduct.isLoading}
									onClick={() => handleOnUpdateProduct(uuid)}
								>
									<EditIcon />
								</IconButton>
								<IconButton
									aria-label="Удалить продукт"
									disabled={deleteProduct.isLoading}
									onClick={() =>
										openModalConfirm({
											title: 'Удалить продукт?',
											onSuccess: () => handleOnDeleteProduct(uuid)
										})
									}
								>
									<DeleteIcon />
								</IconButton>
							</div>
						);
					}
				}
			}
		],
		[data, deleteProduct, handleOnDeleteProduct, openModalConfirm]
	);
	const tableOptions = useMemo(
		() => ({
			serverSide: true,
			rowsPerPage: form.limit,
			page: getPage(),
			count: data?.count ?? 0,
			onChangePage: page => setPage(page),
			onChangeRowsPerPage: limit => setInForm('limit', limit)
		}),
		[data, form.limit, getPage, setInForm, setPage]
	);

	return (
		<>
			<Paper className="p-12 mb-32">
				<form className={`gap-10 ${classes.form}`}>
					<TextField
						label="Поиск по наименованию, артикулу и производителю"
						type="text"
						variant="outlined"
						size="small"
						name="name_vendor_code_manufacturer"
						value={form.name_vendor_code_manufacturer}
						onChange={handleChange}
					/>

					<ServerAutocomplete
						name="provider"
						label="Поставщик"
						InputProps={{
							size: 'small'
						}}
						value={form.provider}
						onChange={value => setInForm('provider', value?.uuid ?? null)}
						getOptionLabel={option => option.name}
						onFetchList={(name, limit) => companiesService.getCompanyProviders({ name, limit })}
						onFetchItem={fetchUuid => companiesService.getCompanyProvider(fetchUuid).then(res => res.data)}
					/>

					<div className={classes.btnReset}>
						<Button textNormal type="reset" color="primary" variant="outlined" onClick={() => resetForm()}>
							Сбросить
						</Button>
					</div>
				</form>
			</Paper>

			{isLoading ? (
				<FuseLoading />
			) : isError ? (
				<ErrorMessage />
			) : (
				<DataTable data={data.results} columns={columns} options={tableOptions} />
			)}

			{isShowModalProduct && (
				<ModalProduct isOpen productUuid={selectedProductUuid} onClose={handleOnCloseModalProduct} />
			)}

			{isShowModalWaybill && <ModalWaybill isOpen onClose={() => setIsShowModalWaybill(false)} />}
		</>
	);
}
