import React from 'react';
import { OperationDetails } from './pages/OperationDetails';
import { OperationStages } from './pages/OperationStages';

export const OperationConfigs = {
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
			path: '/operation',
			component: React.lazy(() => import('./pages/Operations')),
			exact: true
		},
		{
			path: '/operation/:operationUuid',
			component: React.lazy(() => import('./pages/Operation')),
			routes: [
				{
					path: '/operation/:operationUuid',
					component: OperationDetails,
					exact: true
				},
				{
					path: '/operation/:operationUuid/stages',
					component: OperationStages,
					exact: true
				}
			]
		}
	]
};
