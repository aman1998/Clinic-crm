import React, { useState } from 'react';
import Paper from '@material-ui/core/Paper';
import { useQuery } from 'react-query';
import { makeStyles } from '@material-ui/core/styles';
import { Visibility as VisibilityIcon } from '@material-ui/icons';
import { IconButton } from '@material-ui/core';
import { TextField, DataTable, Button, ServerAutocomplete } from '../../../../bizKITUi';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { ModalProductDetailInfo } from '../../../../common/ModalProductDetailInfo';
import { useDebouncedFilterForm } from '../../../../hooks';
import { TYPE_WAREHOUSE_LABORATORY } from '../../../../services/warehouses/constants';
import { productsService, ENTITY, companiesService } from '../../../../services';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: '2fr 1fr 1fr 1fr',
		[theme.breakpoints.down(1279)]: {
			gridTemplateColumns: '2fr 1fr 1fr'
		},
		[theme.breakpoints.down(767)]: {
			gridTemplateColumns: '1fr'
		}
	}
}));

export function ListLaboratoryWarehouse() {
	const classes = useStyles();

	const { form, debouncedForm, handleChange, setInForm, resetForm, setPage, getPage } = useDebouncedFilterForm({
		name_vendor_code_manufacturer: '',
		provider: null,
		category: null,
		offset: 0,
		limit: 10
	});

	const { isLoading, isError, data } = useQuery([ENTITY.PRODUCT_REMNANTS, debouncedForm], ({ queryKey }) => {
		return productsService.getProductsRemnantsLaboratory(queryKey[1]).then(res => res.data);
	});

	const [selectedProductUuid, setSelectedProductUuid] = useState(null);

	const columns = [
		{
			name: 'name',
			label: 'Товар'
		},
		{
			name: 'category',
			label: 'Категория',
			options: {
				customBodyRenderLite: dataIndex => {
					const { category } = data.results[dataIndex];
					return category?.name ?? '—';
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
			name: 'total_remnants',
			label: 'Остаток',
			options: {
				customBodyRender(value) {
					return value ?? '—';
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
	];
	const tableOptions = {
		serverSide: true,
		rowsPerPage: form.limit,
		page: getPage(),
		count: data?.count ?? 0,
		onChangePage: page => setPage(page),
		onChangeRowsPerPage: limit => setInForm('limit', limit)
	};

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
						value={form.category}
						getOptionLabel={option => option.name}
						onChange={value => {
							setInForm('category', value?.uuid ?? null);
						}}
						label="Категория"
						onFetchList={(search, limit) =>
							productsService.getProductCategories({ search, limit }).then(res => res.data)
						}
						onFetchItem={uuid => productsService.getProductCategoryLaboratory(uuid).then(res => res.data)}
						InputProps={{
							size: 'small'
						}}
					/>
					<ServerAutocomplete
						value={form.provider}
						getOptionLabel={option => option.name}
						onChange={value => {
							setInForm('provider', value?.uuid ?? null);
						}}
						label="Поставщик"
						onFetchList={(search, limit) => companiesService.getCompanyProviders({ search, limit })}
						onFetchItem={uuid => companiesService.getCompanyProvider(uuid).then(res => res.data)}
						InputProps={{
							size: 'small'
						}}
					/>

					<div className="flex lg:justify-end">
						<Button
							textNormal
							type="reset"
							color="primary"
							variant="outlined"
							className="lg:ml-16"
							onClick={() => resetForm()}
						>
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

			{selectedProductUuid && (
				<ModalProductDetailInfo
					isOpen
					productUuid={selectedProductUuid}
					warehouseType={TYPE_WAREHOUSE_LABORATORY}
					onClose={() => setSelectedProductUuid(null)}
				/>
			)}
		</>
	);
}
