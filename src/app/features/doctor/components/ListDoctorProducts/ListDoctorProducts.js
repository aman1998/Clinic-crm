import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import { Visibility as VisibilityIcon } from '@material-ui/icons';
import { IconButton } from '@material-ui/core';
import { TextField, DataTable, Button, ServerAutocomplete } from '../../../../bizKITUi';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { useDebouncedFilterForm } from '../../../../hooks';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { ModalProductDetailInfo } from '../../../../common/ModalProductDetailInfo';
import { productsService, ENTITY, companiesService } from '../../../../services';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: '2fr 1fr 1fr 1fr',
		[theme.breakpoints.down(1000)]: {
			gridTemplateColumns: '2fr 1fr 1fr'
		},
		[theme.breakpoints.down(767)]: {
			gridTemplateColumns: '1fr'
		}
	},
	resetBtn: {
		display: 'flex',
		marginLeft: 'auto',
		[theme.breakpoints.down(1000)]: {
			margin: '0'
		}
	}
}));

export function ListDoctorProducts({ userUuid }) {
	const classes = useStyles();

	const initialForm = {
		warehouse_responsible: userUuid,
		name_vendor_code_manufacturer: '',
		provider: null,
		category: null,
		offset: 0,
		limit: 10
	};
	const { form, debouncedForm, handleChange, setInForm, resetForm, setPage, getPage } = useDebouncedFilterForm(
		initialForm
	);
	const { isLoading, isError, data } = useQuery([ENTITY.PRODUCT_REMNANTS, debouncedForm], () => {
		return productsService.getProductsRemnants(debouncedForm).then(res => res.data);
	});

	const handleOnResetFilter = () => {
		resetForm();
	};

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

					return category?.name;
				}
			}
		},
		{
			name: 'provider',
			label: 'Поставщик',
			options: {
				customBodyRenderLite: dataIndex => {
					const { provider } = data.results[dataIndex];

					return provider?.name;
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
						fullWidth
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

					<div className={classes.resetBtn}>
						<Button textNormal color="primary" variant="outlined" onClick={handleOnResetFilter}>
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
					warehouseResponsible={userUuid}
					onClose={() => setSelectedProductUuid(null)}
				/>
			)}
		</>
	);
}
ListDoctorProducts.propTypes = {
	userUuid: PropTypes.string.isRequired
};
