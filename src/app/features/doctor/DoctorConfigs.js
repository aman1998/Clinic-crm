import React from 'react';
import { DoctorReceptions } from './pages/DoctorReceptions';
import { DoctorPatients } from './pages/DoctorPatients';
import { DoctorProducts } from './pages/DoctorProducts';
import { DoctorsList } from './pages/DoctorsList';
import { DoctorEdit } from './pages/DoctorEdit';
import { Doctor } from './pages/Doctor';
import { PERMISSION } from '../../services/auth/constants';
import { DoctorDailyReports } from './pages/DoctorDailyReports';
import { DoctorInformations } from './pages/DoctorInformation';

export const DoctorConfigs = {
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
			path: '/doctors/:doctorUuid/edit',
			auth: [
				PERMISSION.EMPLOYEES.VIEW_MODULE,
				PERMISSION.EMPLOYEES.VIEW_DOCTOR,
				PERMISSION.EMPLOYEES.CHANGE_DOCTOR
			],
			component: DoctorEdit,
			exact: true
		},
		{
			path: '/doctors/:doctorUuid/reception/:receptionUuid',
			auth: [PERMISSION.EMPLOYEES.VIEW_MODULE],
			component: React.lazy(() => import('./pages/DoctorDetails')),
			routes: [
				{
					path: '/doctors/:doctorUuid/reception/:receptionUuid',
					auth: [PERMISSION.EMPLOYEES.VIEW_MODULE],
					component: DoctorInformations,
					exact: true
				}
			]
		},
		{
			path: '/all-doctors',
			auth: [PERMISSION.EMPLOYEES.VIEW_MODULE],
			component: React.lazy(() => import('./pages/Doctors')),
			routes: [
				{
					path: '/all-doctors',
					auth: [PERMISSION.EMPLOYEES.VIEW_MODULE],
					component: DoctorsList,
					exact: true
				},
				{
					path: '/all-doctors/daily-report',
					auth: [PERMISSION.EMPLOYEES.VIEW_MODULE],
					component: DoctorDailyReports,
					exact: true
				}
			]
		},
		{
			path: '/doctors/:doctorUuid',
			auth: [PERMISSION.EMPLOYEES.VIEW_MODULE, PERMISSION.EMPLOYEES.VIEW_DOCTOR],
			component: Doctor,
			routes: [
				{
					path: '/doctors/:doctorUuid',
					auth: [
						PERMISSION.EMPLOYEES.VIEW_MODULE,
						PERMISSION.EMPLOYEES.VIEW_DOCTOR,
						PERMISSION.EMPLOYEES.VIEW_RECEPTION
					],
					component: DoctorReceptions,
					exact: true
				},
				{
					path: '/doctors/:doctorUuid/patients',
					auth: [
						PERMISSION.EMPLOYEES.VIEW_MODULE,
						PERMISSION.EMPLOYEES.VIEW_DOCTOR,
						PERMISSION.EMPLOYEES.VIEW_PATIENT
					],
					component: DoctorPatients
				},
				{
					path: '/doctors/:doctorUuid/products',
					auth: [
						PERMISSION.EMPLOYEES.VIEW_MODULE,
						PERMISSION.EMPLOYEES.VIEW_DOCTOR,
						PERMISSION.EMPLOYEES.VIEW_MEDICINES
					],
					component: DoctorProducts
				},
				{
					path: '/doctors/:doctorUuid/daily-report',
					auth: [PERMISSION.EMPLOYEES.VIEW_MODULE, PERMISSION.EMPLOYEES.VIEW_DOCTOR],
					component: DoctorDailyReports
				}
			]
		}
	]
};
