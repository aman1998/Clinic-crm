import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { Typography, makeStyles } from '@material-ui/core';
import { numberFormat } from '../../utils';
import { ErrorMessage } from '../ErrorMessage';
import FuseLoading from '../../../@fuse/core/FuseLoading';
import { DataTable, Button, TextField, DrawerTemplate, ServerAutocomplete } from '../../bizKITUi';
import { useDebouncedFilterForm } from '../../hooks';
import { companiesService, ENTITY, productsService } from '../../services';
import { ModalProduct } from '../ModalProduct/ModalProduct';

const useStyles = makeStyles(theme => ({
	header: {
		display: 'flex',
		width: '100%',
		[theme.breakpoints.down(560)]: {
			width: 'auto',
			flexDirection: 'column'
		}
	},
	createBtn: {
		marginLeft: 'auto',
		marginRight: 24,
		[theme.breakpoints.down(560)]: {
			marginLeft: 0
		}
	}
}));

export function ModalSelectProduct({ isOpen, onClose, onAdd, defaultProvider }) {
	const [isShowModalProduct, setIsShowModalProduct] = useState(false);

	const classes = useStyles();

	const { form, debouncedForm, getPage, setPage, handleChange, setInForm } = useDebouncedFilterForm({
		name_vendor_code_manufacturer: '',
		provider: defaultProvider || null,
		limit: 10,
		offset: 0
	});

	const { isLoading, isError, data } = useQuery([ENTITY.PRODUCT, debouncedForm], ({ queryKey }) =>
		productsService.getProducts(queryKey[1]).then(res => res.data)
	);

	const columns = [
		{
			name: 'name',
			label: 'Наименование'
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
			name: 'remnants',
			label: 'Остаток'
		},
		{
			name: 'packing',
			label: 'Ед.изм.',
			options: {
				customBodyRenderLite: dataIndex => {
					const { minimum_unit_of_measure } = data.results[dataIndex];

					return minimum_unit_of_measure.name;
				}
			}
		},
		{
			name: 'actions',
			label: 'Действия',
			options: {
				setCellHeaderProps: () => ({ style: { display: 'flex', justifyContent: 'flex-end' } }),
				customBodyRenderLite: dataIndex => {
					const item = data.results[dataIndex];

					return (
						<div className="flex justify-end">
							<Button
								textNormal
								variant="text"
								color="primary"
								className="font-bold"
								onClick={() => onAdd(item)}
							>
								Добавить
							</Button>
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
			<DrawerTemplate
				isOpen={isOpen}
				close={onClose}
				width="md"
				header={
					<div className={`gap-10 ${classes.header}`}>
						<Typography color="secondary" className="text-xl font-bold text-center">
							Выбор товара
						</Typography>
						<Button className={classes.createBtn} textNormal onClick={() => setIsShowModalProduct(true)}>
							Создать товар
						</Button>
					</div>
				}
				content={
					<>
						<div className="flex flex-col sm3:flex-row">
							<TextField
								label="Поиск по наименованию, артикулу и производителю"
								type="text"
								variant="outlined"
								name="name_vendor_code_manufacturer"
								className="sm3:mr-16 mb-16 sm3:mb-0"
								fullWidth
								value={form.name_vendor_code_manufacturer}
								onChange={handleChange}
							/>

							<ServerAutocomplete
								name="provider"
								label="Поставщик"
								defaultUuid={defaultProvider}
								className="w-full"
								value={form.provider}
								onChange={value => setInForm('provider', value?.uuid ?? null)}
								getOptionLabel={option => option.name}
								onFetchList={(name, limit) => companiesService.getCompanyProviders({ name, limit })}
								onFetchItem={uuid => companiesService.getCompanyProvider(uuid).then(res => res.data)}
							/>
						</div>

						<div className="mt-20">
							{isLoading ? (
								<FuseLoading />
							) : isError ? (
								<ErrorMessage />
							) : (
								<DataTable data={data.results} columns={columns} options={tableOptions} />
							)}
						</div>

						{isShowModalProduct && <ModalProduct isOpen onClose={() => setIsShowModalProduct(false)} />}
					</>
				}
			/>
		</>
	);
}
ModalSelectProduct.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onAdd: PropTypes.func.isRequired,
	defaultProvider: PropTypes.string.isRequired
};
