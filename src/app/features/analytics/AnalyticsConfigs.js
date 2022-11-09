import React from 'react';
import { AnalyticsDoctors } from './pages/AnalyticsDoctors';
import { AnalyticsFinance } from './pages/AnalyticsFinance';
import { AnalyticsHospital } from './pages/AnalyticsHospital';
import { AnalyticsLaboratory } from './pages/AnalyticsLaboratory';
import { AnalyticsWarehouse } from './pages/AnalyticsWarehouse';
import { AnalyticsReceptions } from './pages/AnalyticsReceptions';
import { AnalyticsAllReceptions } from './pages/AnalyticsAllReceptions';
import { PERMISSION } from '../../services/auth/constants';

export const AnalyticsConfigs = {
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
			path: '/analytics',
			auth: [PERMISSION.ANALYTICS.VIEW_MODULE],
			component: React.lazy(() => import('./pages/Analytics')),
			routes: [
				{
					path: '/analytics',
					auth: [PERMISSION.ANALYTICS.VIEW_MODULE, PERMISSION.ANALYTICS.VIEW_RECEPTION],
					component: AnalyticsAllReceptions,
					exact: true
				},
				{
					path: '/analytics/receptions',
					auth: [PERMISSION.ANALYTICS.VIEW_MODULE, PERMISSION.ANALYTICS.VIEW_RECEPTION],
					component: AnalyticsReceptions
				},
				{
					path: '/analytics/doctors',
					auth: [PERMISSION.ANALYTICS.VIEW_MODULE], // FIXME Unknown permission
					component: AnalyticsDoctors
				},
				{
					path: '/analytics/finance',
					auth: [PERMISSION.ANALYTICS.VIEW_MODULE], // FIXME Unknown permission
					component: AnalyticsFinance
				},
				{
					path: '/analytics/hospital',
					auth: [PERMISSION.ANALYTICS.VIEW_MODULE, PERMISSION.ANALYTICS.VIEW_HOSPITAL_STATIONARY],
					component: AnalyticsHospital
				},
				{
					path: '/analytics/laboratory',
					auth: [PERMISSION.ANALYTICS.VIEW_MODULE, PERMISSION.ANALYTICS.VIEW_LABORATORY],
					component: AnalyticsLaboratory
				},
				{
					path: '/analytics/warehouse',
					auth: [PERMISSION.ANALYTICS.VIEW_MODULE, PERMISSION.ANALYTICS.VIEW_WAREHOUSES],
					component: AnalyticsWarehouse
				}
			]
		}
	]
};
