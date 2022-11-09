import React from 'react';
import WarehouseRemainsOfProducts from './pages/WarehouseRemainsOfProducts';
import WarehouseProducts from './pages/WarehouseProducts';
import WarehousePromotions from './pages/WarehousePromotions';
import Warehouses from './pages/Warehouses';
import WarehouseProductCategories from './pages/WarehouseProductCategories';
import WarehouseWaybills from './pages/WarehouseWaybills';
import { PERMISSION } from '../../services/auth/constants';
import WarehousePacking from './pages/WarehousePacking';

export const WarehouseConfigs = {
	settings: {
		layout: {
			config: {
				navbar: {
					display: true
				},
				toolbar: {
					display: true
				},
				footer: {
					display: true
				},
				leftSidePanel: {
					display: true
				}
			}
		}
	},

	routes: [
		{
			path: '/warehouse',
			component: React.lazy(() => import('./pages/Warehouse')),
			auth: [PERMISSION.WAREHOUSES.VIEW_MODULE],
			routes: [
				{
					path: '/warehouse',
					auth: [PERMISSION.WAREHOUSES.VIEW_MODULE, PERMISSION.WAREHOUSES.VIEW_WAREHOUSE_PRODUCT_REMNANTS],
					component: WarehouseRemainsOfProducts,
					exact: true
				},
				{
					path: '/warehouse/warehouse-products',
					auth: [PERMISSION.WAREHOUSES.VIEW_MODULE, PERMISSION.WAREHOUSES.VIEW_PRODUCTS],
					component: WarehouseProducts
				},
				{
					path: '/warehouse/warehouse-product-categories',
					auth: [PERMISSION.WAREHOUSES.VIEW_MODULE, PERMISSION.WAREHOUSES.VIEW_PRODUCTS],
					component: WarehouseProductCategories
				},
				{
					path: '/warehouse/warehouses',
					auth: [PERMISSION.WAREHOUSES.VIEW_MODULE, PERMISSION.WAREHOUSES.VIEW_WAREHOUSE],
					component: Warehouses
				},
				{
					path: '/warehouse/warehouse-waybills',
					auth: [PERMISSION.WAREHOUSES.VIEW_MODULE, PERMISSION.WAREHOUSES.VIEW_WAYBILL],
					component: WarehouseWaybills
				},
				{
					path: '/warehouse/warehouse-packing',
					auth: [PERMISSION.WAREHOUSES.VIEW_MODULE /* , PERMISSION.WAREHOUSES.VIEW_PACKING */],
					component: WarehousePacking
				},
				{
					path: '/warehouse/promotions',
					auth: [PERMISSION.WAREHOUSES.VIEW_MODULE],
					component: WarehousePromotions
				}
			]
		}
	]
};
