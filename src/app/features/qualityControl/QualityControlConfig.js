import React from 'react';
import { PERMISSION } from '../../services/auth/constants';
import QualityControls from './pages/QualityControls';
import QualityControlAnalytics from './pages/QualityControlAnalytics';

export const QualityControlConfig = {
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
	auth: [],
	routes: [
		{
			path: '/quality-control',
			component: React.lazy(() => import('./pages/QualityControl')),
			auth: [PERMISSION.QUALITY_CONTROL.VIEW_MODULE],
			routes: [
				{
					path: '/quality-control',
					component: QualityControls,
					auth: [PERMISSION.QUALITY_CONTROL.VIEW_MODULE, PERMISSION.QUALITY_CONTROL.VIEW_QUALITY_CONTROL],
					exact: true
				},
				{
					path: '/quality-control/analytics',
					component: QualityControlAnalytics,
					auth: [PERMISSION.QUALITY_CONTROL.VIEW_MODULE, PERMISSION.QUALITY_CONTROL.VIEW_ANALYTICS],
					exact: true
				}
			]
		}
	]
};
