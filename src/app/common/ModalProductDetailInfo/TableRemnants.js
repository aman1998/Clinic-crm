import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import moment from 'moment';
import { ErrorMessage } from '../ErrorMessage';
import FuseLoading from '../../../@fuse/core/FuseLoading';
import { Amount, DataTable } from '../../bizKITUi';
import {
	TYPE_WAREHOUSE_COMMON,
	TYPE_WAREHOUSE_HOSPITAL,
	TYPE_WAREHOUSE_LABORATORY
} from '../../services/warehouses/constants';
import { ENTITY, productsService } from '../../services';

export function TableRemnants({ productUuid, warehouseType, warehouseResponsible }) {
	const { isLoading, isError, data } = useQuery(
		[
			ENTITY.PRODUCT_REMNANTS,
			productUuid,
			{ warehouse_type: warehouseType, warehouse_responsible: warehouseResponsible }
		],
		({ queryKey }) => productsService.getProductRemnant(queryKey[1], queryKey[2]).then(res => res.data)
	);

	const columns = [
		{
			name: 'name',
			label: 'Склад'
		},
		{
			name: 'cost',
			label: 'Цена закупки',
			options: {
				customBodyRenderLite: dataIndex => {
					const { cost } = data.warehouses[dataIndex];
					return <Amount value={cost} />;
				}
			}
		},
		{
			name: 'amount',
			label: 'Остаток'
		},
		{
			name: 'minimum_unit_of_measure',
			label: 'Ед.изм.',
			options: {
				customBodyRenderLite: dataIndex => {
					const { minimum_unit_of_measure } = data.warehouses[dataIndex];
					return minimum_unit_of_measure.name;
				}
			}
		},
		{
			name: 'updated_at',
			label: 'Дата закупки',
			options: {
				customBodyRenderLite: dataIndex => {
					const { updated_at } = data.warehouses[dataIndex];
					return moment(updated_at).format('DD.MM.YYYY');
				}
			}
		}
	];

	if (isLoading) {
		return <FuseLoading />;
	}
	if (isError) {
		return <ErrorMessage />;
	}
	return <DataTable data={data.warehouses} columns={columns} options={{}} />;
}

TableRemnants.defaultProps = {
	warehouseType: null,
	warehouseResponsible: null
};
TableRemnants.propTypes = {
	productUuid: PropTypes.string.isRequired,
	warehouseType: PropTypes.oneOf([TYPE_WAREHOUSE_HOSPITAL, TYPE_WAREHOUSE_COMMON, TYPE_WAREHOUSE_LABORATORY]),
	warehouseResponsible: PropTypes.string
};
