import React from 'react';
import { Typography, Grid } from '@material-ui/core';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { TextField, CurrencyTextField, DrawerTemplate } from '../../bizKITUi';
import { ErrorMessage } from '../ErrorMessage';
import { TableRemnants } from './TableRemnants';
import { TableWaybills } from './TableWaybills';
import {
	TYPE_WAREHOUSE_HOSPITAL,
	TYPE_WAREHOUSE_COMMON,
	TYPE_WAREHOUSE_LABORATORY
} from '../../services/warehouses/constants';
import { ENTITY, productsService } from '../../services';

export function ModalProductDetailInfo({ isOpen, productUuid, warehouseType, warehouseResponsible, onClose }) {
	const { isLoading, isError, data } = useQuery([ENTITY.PRODUCT, productUuid], () => {
		if (productUuid) {
			return productsService.getProduct(productUuid).then(res => res.data);
		}
		return Promise.reject();
	});

	return (
		<DrawerTemplate
			isOpen={isOpen}
			close={onClose}
			header={
				<Typography color="secondary" className="text-xl font-bold text-center">
					Товар
				</Typography>
			}
			isLoading={isLoading}
			width="md"
			content={
				isLoading ? (
					<></>
				) : isError ? (
					<ErrorMessage />
				) : (
					<>
						<Typography color="secondary" className="text-xl mb-24">
							Общая информация
						</Typography>

						<TextField
							variant="outlined"
							label="Наименование"
							name="text"
							fullWidth
							defaultValue={data.name}
							InputProps={{
								readOnly: true
							}}
						/>

						<Grid container spacing={2} className="mt-10">
							<Grid item md={6} xs={12}>
								<TextField
									variant="outlined"
									label="Артикул"
									name="text"
									fullWidth
									className="mt-10"
									defaultValue={data.vendor_code}
									InputProps={{
										readOnly: true
									}}
								/>
							</Grid>
							<Grid item md={6} xs={12}>
								<TextField
									variant="outlined"
									label="Категория"
									name="text"
									fullWidth
									className="mt-10"
									defaultValue={data.category?.name}
									InputProps={{
										readOnly: true
									}}
								/>
							</Grid>
						</Grid>

						<Grid container spacing={2} className="mt-10">
							<Grid item md={6} xs={12}>
								<TextField
									variant="outlined"
									label="Производитель"
									name="text"
									fullWidth
									className="mt-10"
									defaultValue={data.manufacturer}
									InputProps={{
										readOnly: true
									}}
								/>
							</Grid>
							<Grid item md={6} xs={12}>
								<TextField
									variant="outlined"
									label="Поставщик"
									name="text"
									fullWidth
									className="mt-10"
									defaultValue={data.provider?.name}
									InputProps={{
										readOnly: true
									}}
								/>
							</Grid>
						</Grid>

						<Grid container spacing={2} className="mt-10">
							<Grid item md={6} xs={12}>
								<CurrencyTextField
									variant="outlined"
									label="Цена закупки"
									name="text"
									fullWidth
									className="mt-10"
									defaultValue={data.purchase_price}
									InputProps={{
										readOnly: true
									}}
								/>
							</Grid>
							<Grid item md={6} xs={12}>
								<CurrencyTextField
									variant="outlined"
									label="Цена продажи"
									name="text"
									fullWidth
									className="mt-10"
									defaultValue={data.sale_price}
									InputProps={{
										readOnly: true
									}}
								/>
							</Grid>
						</Grid>

						<TextField
							variant="outlined"
							label="Описание"
							name="text"
							fullWidth
							className="mt-24"
							rows={3}
							multiline
							defaultValue={data.description}
							InputProps={{
								readOnly: true
							}}
						/>

						<div className="mt-64">
							<Typography color="secondary" className="text-xl mb-24">
								Остатки
							</Typography>

							<TableRemnants
								productUuid={productUuid}
								warehouseType={warehouseType}
								warehouseResponsible={warehouseResponsible}
							/>
						</div>

						<div className="mt-64">
							<TableWaybills
								productUuid={productUuid}
								warehouseType={warehouseType}
								warehouseResponsible={warehouseResponsible}
							/>
						</div>
					</>
				)
			}
		/>
	);
}
ModalProductDetailInfo.defaultProps = {
	warehouseType: null,
	warehouseResponsible: null
};
ModalProductDetailInfo.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	productUuid: PropTypes.string.isRequired,
	warehouseType: PropTypes.oneOf([TYPE_WAREHOUSE_HOSPITAL, TYPE_WAREHOUSE_COMMON, TYPE_WAREHOUSE_LABORATORY]),
	warehouseResponsible: PropTypes.string,
	onClose: PropTypes.func.isRequired
};
