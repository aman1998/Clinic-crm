import React from 'react';
import { PERMISSION } from '../../services/auth/constants';
import LeadList from './pages/LeadList';
import LeadDetailsPage from './pages/LeadDetailsPage';

export const LeadConfigs = {
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
			path: '/leads',
			auth: [PERMISSION.CLINIC.VIEW_MODULE],
			component: React.lazy(() => import('./pages/Leads')),
			exact: true,
			routes: [
				// {
				// 	path: '/leads/success',
				// 	auth: [PERMISSION.CLINIC.VIEW_MODULE, PERMISSION.CLINIC.VIEW_PATIENT],
				// 	component: LeadList,
				// 	exact: true
				// },
				// {
				// 	path: '/leads/refused',
				// 	auth: [PERMISSION.CLINIC.VIEW_MODULE, PERMISSION.CLINIC.VIEW_RESERVE],
				// 	component: ReceptionReserves,
				// 	exact: true
				// },

				{
					path: '/leads',
					auth: [PERMISSION.CLINIC.VIEW_MODULE, PERMISSION.CLINIC.VIEW_RESERVE],
					component: LeadList,
					exact: true
				}
			]
		},
		{
			path: '/leads/:stageUuid/lead/:leadUuid?',
			component: React.lazy(() => import('./pages/Lead')),
			exact: true,
			routes: [
				{
					path: '/leads/:stageUuid/lead/:leadUuid?',
					component: LeadDetailsPage,
					exact: true
				}
			]
		}
	]
};
