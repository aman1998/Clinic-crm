import React from 'react';
import { TasksCurrent } from './pages/TasksCurrent';
import { TasksCompleted } from './pages/TasksCompleted';
import { PERMISSION } from '../../services/auth/constants';

export const TasksConfigs = {
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
			path: '/tasks',
			auth: [PERMISSION.TASKS.VIEW_MODULE],
			component: React.lazy(() => import('./pages/Tasks')),
			routes: [
				{
					path: '/tasks',
					auth: [PERMISSION.TASKS.VIEW_MODULE],
					component: TasksCurrent,
					exact: true
				},
				{
					path: '/tasks/completed',
					auth: [PERMISSION.TASKS.VIEW_MODULE],
					component: TasksCompleted,
					exact: true
				}
			]
		}
	]
};
