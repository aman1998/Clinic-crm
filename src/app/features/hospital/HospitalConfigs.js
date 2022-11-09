import React from 'react';
import { PERMISSION } from '../../services/auth/constants';
import HospitalReceptions from './pages/HospitalReceptions';
import HospitalWarehouse from './pages/HospitalWarehouse';

export const HospitalConfigs = {
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
			path: '/hospital',
			auth: [PERMISSION.HOSPITAL.VIEW_MODULE],
			component: React.lazy(() => import('./pages/Hospital')),
			routes: [
				{
					path: '/hospital',
					auth: [PERMISSION.HOSPITAL.VIEW_MODULE, PERMISSION.HOSPITAL.VIEW_STATIONARY_RECEPTION],
					component: HospitalReceptions,
					exact: true
				},
				{
					path: '/hospital/warehouse',
					auth: [PERMISSION.HOSPITAL.VIEW_MODULE, PERMISSION.HOSPITAL.VIEW_WAREHOUSE],
					component: HospitalWarehouse
				}
			]
		}
	]
};
