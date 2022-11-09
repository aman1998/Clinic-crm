import React, { useState, createContext } from 'react';
import { Paper } from '@material-ui/core';
import { renderRoutes } from 'react-router-config';
import { TabsLink } from '../../../bizKITUi/TabsLink';
import { useToolbarTitle } from '../../../hooks';
import { PERMISSION } from '../../../services/auth/constants';

export const ContextMenu = createContext(null);

const tabConfig = [
	{
		label: 'Остатки',
		url: '/warehouse',
		auth: [PERMISSION.WAREHOUSES.VIEW_WAREHOUSE_PRODUCT_REMNANTS]
	},
	{
		label: 'Накладные',
		url: '/warehouse/warehouse-waybills',
		auth: [PERMISSION.WAREHOUSES.VIEW_WAYBILL]
	},
	{
		label: 'Товары',
		url: '/warehouse/warehouse-products',
		auth: [PERMISSION.WAREHOUSES.VIEW_PRODUCTS]
	},
	{
		label: 'Категории',
		url: '/warehouse/warehouse-product-categories',
		auth: [PERMISSION.WAREHOUSES.VIEW_PRODUCTS]
	},
	{
		label: 'Склады',
		url: '/warehouse/warehouses',
		auth: [PERMISSION.WAREHOUSES.VIEW_WAREHOUSE]
	},
	{
		label: 'Фасовка',
		url: '/warehouse/warehouse-packing',
		// auth: [PERMISSION.WAREHOUSES.VIEW_PACKING]
		auth: [PERMISSION.WAREHOUSES.VIEW_MODULE]
	},
	{
		label: 'Программа лояльности',
		url: '/warehouse/promotions',
		auth: [PERMISSION.WAREHOUSES.VIEW_MODULE]
	}
];

export default function Warehouse({ route }) {
	const [menu, setMenu] = useState(null);

	useToolbarTitle('Склад');

	return (
		<ContextMenu.Provider value={setMenu}>
			<div>
				<Paper className="flex justify-between items-center scroll-control">
					<div>
						<TabsLink config={tabConfig} />
					</div>

					<div className="pr-32">{menu}</div>
				</Paper>
				<div>{renderRoutes(route.routes)}</div>
			</div>
		</ContextMenu.Provider>
	);
}
