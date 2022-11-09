import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import { Amount, DataTable } from '../../bizKITUi';
import { productsService } from '../../services';
import { PACKAGE_TYPE_PACK, PACKAGE_TYPE_PIECE } from '../../services/packages/constants';

export function TableServices({ list }) {
	const columns = [
		{
			name: 'name',
			label: 'Услуга/медикамент'
		},
		{
			name: 'amount',
			label: 'Кол-во',
			options: {
				customBodyRenderLite: dataIndex => {
					const item = list[dataIndex];
					return (
						<>
							{item.amount}&nbsp;{item.packing?.name}
						</>
					);
				}
			}
		},
		{
			name: 'cost',
			label: 'Цена за ед.',
			options: {
				customBodyRenderLite: dataIndex => {
					return <Amount value={list[dataIndex].cost} />;
				}
			}
		},
		{
			name: 'totalCost',
			label: 'К оплате',
			options: {
				customBodyRenderLite: dataIndex => {
					const item = list[dataIndex];
					if (item.isMedication) {
						return (
							<Amount
								value={productsService.getProductCost(item, item.packing, item.amount, item.cost)}
							/>
						);
					}
					return <Amount value={item.amount * item.cost} />;
				}
			}
		}
	];
	const tableOptions = {
		elevation: 0,
		pagination: false
	};

	return (
		<div>
			<Typography className="mb-6 text-18">Стоимость услуг</Typography>

			<DataTable columns={columns} options={tableOptions} data={list} />
		</div>
	);
}
TableServices.propTypes = {
	list: PropTypes.arrayOf(
		PropTypes.shape({
			name: PropTypes.string.isRequired,
			amount: PropTypes.number.isRequired,
			cost: PropTypes.number.isRequired,
			isMedication: PropTypes.bool,
			minimum_unit_of_measure: PropTypes.shape({
				uuid: PropTypes.string.isRequired,
				name: PropTypes.string.isRequired,
				type: PropTypes.oneOf([PACKAGE_TYPE_PIECE, PACKAGE_TYPE_PACK])
			}),
			packing: PropTypes.shape({
				uuid: PropTypes.string.isRequired,
				name: PropTypes.string.isRequired,
				type: PropTypes.oneOf([PACKAGE_TYPE_PIECE, PACKAGE_TYPE_PACK])
			}),
			packing_unit: PropTypes.shape({
				uuid: PropTypes.string.isRequired,
				name: PropTypes.string.isRequired,
				type: PropTypes.oneOf([PACKAGE_TYPE_PIECE, PACKAGE_TYPE_PACK])
			}),
			amount_in_package: PropTypes.number
		})
	).isRequired
};
