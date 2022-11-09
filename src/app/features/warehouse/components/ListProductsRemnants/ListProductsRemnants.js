import React, { useContext, useState, useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import { IconButton, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Visibility as VisibilityIcon } from '@material-ui/icons';
import { TextField, DataTable, Button, ServerAutocomplete } from '../../../../bizKITUi';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ContextMenu } from '../../pages/Warehouse';
import { useDebouncedFilterForm } from '../../../../hooks';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { ModalProduct } from '../../../../common/ModalProduct';
import { ModalProductDetailInfo } from '../../../../common/ModalProductDetailInfo';
import { ModalWaybill } from '../../../../common/ModalWaybill';
import { companiesService, ENTITY, productsService, warehousesService } from '../../../../services';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: '430px 1fr 1fr 1fr 1fr',
		[theme.breakpoints.down(1279)]: {
			gridTemplateColumns: '430px 1fr 1fr 1fr'
		},
		[theme.breakpoints.down(1000)]: {
			gridTemplateColumns: '430px 1fr 1fr'
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

export function ListProductsRemnants() {
	const classes = useStyles();

	const { form, debouncedForm, getPage, setPage, handleChange, resetForm, setInForm } = useDebouncedFilterForm({
		name_vendor_code_manufacturer: '',
		provider: null,
		category: null,
		warehouse: null,
		limit: 10,
		offset: 0
	});

	const { isLoading: isLoadingRemnants, isError: isErrorRemnants, data: dataRemnants } = useQuery(
		[ENTITY.PRODUCT_REMNANTS, debouncedForm],
		({ queryKey }) => productsService.getProductsRemnants(queryKey[1]).then(res => res.data)
	);

	const { isLoading: isLoadingWarehouses, isError: isErrorWarehouses, data: listWarehouses } = useQuery(
		[ENTITY.WAREHOUSE, { limit: Number.MAX_SAFE_INTEGER }],
		({ queryKey }) => warehousesService.getWarehouses(queryKey[1])
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

	const columns = useMemo(
		() => [
			{
				name: 'name',
				label: 'Товар'
			},
			{
				name: 'category',
				label: 'Категория',
				options: {
					customBodyRenderLite: dataIndex => {
						const { category } = dataRemnants.results[dataIndex];

						return category?.name ?? '—';
					}
				}
			},
			{
				name: 'provider',
				label: 'Поставщик',
				options: {
					customBodyRenderLite: dataIndex => {
						const { provider } = dataRemnants.results[dataIndex];

						return provider?.name ?? '—';
					}
				}
			},
			{
				name: 'packing',
				label: 'Ед.изм.',
				options: {
					customBodyRenderLite: dataIndex => {
						const { minimum_unit_of_measure } = dataRemnants.results[dataIndex];

						return minimum_unit_of_measure.name;
					}
				}
			},
			{
				name: 'total_remnants',
				label: (
					<>
						<div>Общий</div>
						<div>Остаток</div>
					</>
				)
			},
			...(listWarehouses?.results ?? [])
				.filter(item => !debouncedForm.warehouse || item.uuid === debouncedForm.warehouse)
				.map(item => ({
					name: item.uuid,
					label: (
						<>
							<div>Остаток</div>
							<div>{item.name}</div>
						</>
					),
					options: {
						customBodyRenderLite: dataIndex => {
							const currentItem = dataRemnants.results[dataIndex];
							const findWarehouse = currentItem.warehouses.find(
								warehouse => warehouse.warehouse_uuid === item.uuid
							);

							return findWarehouse?.amount ?? 0;
						}
					}
				})),
			{
				name: 'actions',
				label: 'Действия',
				options: {
					setCellHeaderProps: () => ({ style: { textAlign: 'right' } }),
					customBodyRenderLite: dataIndex => {
						const { uuid } = dataRemnants.results[dataIndex];

						return (
							<div className="flex justify-end">
								<IconButton
									aria-label="Открыть информацию о продукте"
									variant="text"
									onClick={() => setSelectedProductUuid(uuid)}
								>
									<VisibilityIcon fontSize="inherit" />
								</IconButton>
							</div>
						);
					}
				}
			}
		],
		[dataRemnants, debouncedForm.warehouse, listWarehouses]
	);
	const tableOptions = useMemo(
		() => ({
			serverSide: true,
			rowsPerPage: form.limit,
			page: getPage(),
			count: dataRemnants?.count ?? 0,
			onChangePage: page => setPage(page),
			onChangeRowsPerPage: limit => setInForm('limit', limit)
		}),
		[dataRemnants, form.limit, getPage, setInForm, setPage]
	);

	const isLoading = isLoadingRemnants || isLoadingWarehouses;
	const isError = isErrorRemnants || isErrorWarehouses;

	return (
		<>
			<Paper className="p-12 mb-32">
				<form className={`gap-10 ${classes.form}`}>
					<TextField
						label="Поиск по коду, наименованию и производителю"
						type="text"
						variant="outlined"
						size="small"
						name="name_vendor_code_manufacturer"
						value={form.name_vendor_code_manufacturer}
						onChange={handleChange}
					/>

					<ServerAutocomplete
						label="Категория"
						value={form.category}
						getOptionLabel={option => option.name}
						InputProps={{ size: 'small' }}
						onFetchList={(name, limit) =>
							productsService.getProductCategories({ name, limit }).then(({ data }) => data)
						}
						onFetchItem={uuid => productsService.getProductCategory(uuid).then(({ data }) => data)}
						onChange={value => setInForm('category', value?.uuid ?? null)}
					/>

					<ServerAutocomplete
						label="Поставщик"
						value={form.provider}
						getOptionLabel={option => option.name}
						InputProps={{ size: 'small' }}
						onFetchList={(name, limit) => companiesService.getCompanyProviders({ name, limit })}
						onFetchItem={uuid => companiesService.getCompanyProvider(uuid).then(({ data }) => data)}
						onChange={value => setInForm('provider', value?.uuid ?? null)}
					/>

					<ServerAutocomplete
						label="Склад"
						value={form.warehouse}
						getOptionLabel={option => option.name}
						InputProps={{ size: 'small' }}
						onFetchList={(name, limit) => warehousesService.getWarehouses({ name, limit })}
						onFetchItem={uuid => warehousesService.getWarehouse(uuid)}
						onChange={value => setInForm('warehouse', value?.uuid ?? null)}
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
				<DataTable data={dataRemnants.results} columns={columns} options={tableOptions} />
			)}

			{isShowModalProduct && <ModalProduct isOpen onClose={() => setIsShowModalProduct(false)} />}

			{selectedProductUuid && (
				<ModalProductDetailInfo
					productUuid={selectedProductUuid}
					isOpen
					onClose={() => setSelectedProductUuid(null)}
				/>
			)}

			{isShowModalWaybill && <ModalWaybill isOpen onClose={() => setIsShowModalWaybill(false)} />}
		</>
	);
}
