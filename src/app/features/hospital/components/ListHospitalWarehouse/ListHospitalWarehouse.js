import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { IconButton, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Visibility as VisibilityIcon } from '@material-ui/icons';
import { TextField, DataTable, Button, ServerAutocomplete } from '../../../../bizKITUi';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { useDebouncedFilterForm } from '../../../../hooks';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { ModalProductDetailInfo } from '../../../../common/ModalProductDetailInfo';
import { TYPE_WAREHOUSE_HOSPITAL } from '../../../../services/warehouses/constants';
import { companiesService, ENTITY, productsService } from '../../../../services';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: '430px 1fr 1fr 1fr',
		[theme.breakpoints.down(1279)]: {
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
		[theme.breakpoints.down(1379)]: {
			margin: '0',
			justifyContent: 'flex-start'
		}
	}
}));

export function ListHospitalWarehouse() {
	const classes = useStyles();

	const { form, debouncedForm, handleChange, getPage, setPage, resetForm, setInForm } = useDebouncedFilterForm({
		name_vendor_code_manufacturer: '',
		provider: null,
		category: null,
		warehouse_type: TYPE_WAREHOUSE_HOSPITAL
	});

	const { isLoading, isError, data } = useQuery([ENTITY.PRODUCT_REMNANTS, debouncedForm], ({ queryKey }) =>
		productsService.getProductsRemnants(queryKey[1]).then(res => res.data)
	);

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
			label: 'Остаток'
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
						label="Категория"
						InputProps={{ size: 'small' }}
						onFetchList={(name, limit) =>
							productsService
								.getProductCategories({
									name,
									limit
								})
								.then(({ data: response }) => response)
						}
						onFetchItem={uuid => productsService.getProductCategory(uuid).then(res => res.data)}
						onChange={value => setInForm('category', value?.uuid ?? null)}
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
						onFetchItem={uuid => companiesService.getCompanyProvider(uuid).then(res => res.data)}
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

			{selectedProductUuid && (
				<ModalProductDetailInfo
					isOpen
					productUuid={selectedProductUuid}
					warehouseType={TYPE_WAREHOUSE_HOSPITAL}
					onClose={() => setSelectedProductUuid(null)}
				/>
			)}
		</>
	);
}
