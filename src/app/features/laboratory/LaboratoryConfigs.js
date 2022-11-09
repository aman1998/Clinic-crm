import React from 'react';
import { PERMISSION } from '../../services/auth/constants';
import LaboratoryReceptions from './pages/LaboratoryReceptions';
import LaboratoryWarehouse from './pages/LaboratoryWarehouse';

export const LaboratoryConfigs = {
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
			path: '/laboratory',
			auth: [PERMISSION.LABORATORY.VIEW_MODULE],
			component: React.lazy(() => import('./pages/Laboratory')),
			routes: [
				{
					path: '/laboratory',
					auth: [PERMISSION.LABORATORY.VIEW_MODULE, PERMISSION.LABORATORY.VIEW_LABORATORY_RECEPTION],
					component: LaboratoryReceptions,
					exact: true
				},
				{
					path: '/laboratory/warehouse',
					auth: [PERMISSION.LABORATORY.VIEW_MODULE, PERMISSION.LABORATORY.VIEW_WAREHOUSE],
					component: LaboratoryWarehouse
				}
			]
		}
	]
};
