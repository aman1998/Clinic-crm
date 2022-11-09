import React from 'react';
import ReceptionPatientList from './pages/ReceptionPatientList';
import ReceptionDoctorsSchedule from './pages/ReceptionDoctorsSchedule';
import ReceptionReserves from './pages/ReceptionReserves';
import ReceptionCalls from './pages/ReceptionCalls';
import ReceptionEquipment from './pages/ReceptionEquipment';
import ReceptionChat from './pages/ReceptionChat';
import ReceptionDetails from './pages/ReceptionDetails';
import { PERMISSION } from '../../services/auth/constants';

export const ReceptionConfigs = {
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
			path: '/reception',
			auth: [PERMISSION.CLINIC.VIEW_MODULE],
			component: React.lazy(() => import('./pages/Reception')),
			routes: [
				{
					path: '/reception/patient-list',
					auth: [PERMISSION.CLINIC.VIEW_MODULE, PERMISSION.CLINIC.VIEW_PATIENT],
					component: ReceptionPatientList
				},
				{
					path: '/reception/reserves',
					auth: [PERMISSION.CLINIC.VIEW_MODULE, PERMISSION.CLINIC.VIEW_RESERVE],
					component: ReceptionReserves
				},
				{
					path: '/reception/calls',
					auth: [PERMISSION.CLINIC.VIEW_MODULE, PERMISSION.CLINIC.VIEW_CALLS],
					component: ReceptionCalls
				},
				{
					path: '/reception/chat',
					auth: [PERMISSION.CLINIC.VIEW_MODULE],
					component: ReceptionChat
				},
				{
					path: '/reception',
					auth: [PERMISSION.CLINIC.VIEW_MODULE, PERMISSION.CLINIC.VIEW_EMPLOYEES],
					component: ReceptionDetails,
					routes: [
						{
							path: '/reception',
							auth: [PERMISSION.CLINIC.VIEW_MODULE],
							component: ReceptionDoctorsSchedule,
							exact: true
						},
						{
							path: '/reception/equipment',
							auth: [PERMISSION.CLINIC.VIEW_MODULE],
							component: ReceptionEquipment
						}
					]
				}
			]
		}
	]
};
