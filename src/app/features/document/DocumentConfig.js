import React from 'react';
import { PERMISSION } from '../../services/auth/constants';

export const DocumentConfigs = {
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
			path: '/documents',
			auth: [PERMISSION.EMPLOYEES.VIEW_MODULE],
			component: React.lazy(() => import('./pages/DocumentsList')),
			exact: true
		}
	]
};
