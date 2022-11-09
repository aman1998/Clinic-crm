import React from 'react';
import { PatientInfo } from './pages/PatientInfo';
import { PatientReceptions } from './pages/PatientReceptions';
import { PatientLaboratory } from './pages/PatientLaboratory';
import { PatientHospital } from './pages/PatientHospital';
import { PatientFinance } from './pages/PatientFinance';
import { PatientTasks } from './pages/PatientTasks';
import { PERMISSION } from '../../services/auth/constants';
import { PatientDocuments } from './pages/PatientDocuments';

export const PatientConfigs = {
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
			path: '/patients',
			auth: [PERMISSION.PATIENTS.VIEW_MODULE],
			component: React.lazy(() => import('./pages/Patients')),
			exact: true
		},
		{
			path: '/patients/:patientUuid',
			auth: [PERMISSION.PATIENTS.VIEW_MODULE, PERMISSION.PATIENTS.VIEW_PATIENT],
			component: React.lazy(() => import('./pages/Patient')),
			routes: [
				{
					path: '/patients/:patientUuid',
					auth: [PERMISSION.PATIENTS.VIEW_MODULE, PERMISSION.PATIENTS.VIEW_PATIENT],
					component: PatientInfo,
					exact: true
				},
				{
					path: '/patients/:patientUuid/receptions',
					auth: [
						PERMISSION.PATIENTS.VIEW_MODULE,
						PERMISSION.PATIENTS.VIEW_PATIENT,
						PERMISSION.PATIENTS.VIEW_RECEPTION
					],
					component: PatientReceptions
				},
				{
					path: '/patients/:patientUuid/laboratory',
					auth: [
						PERMISSION.PATIENTS.VIEW_MODULE,
						PERMISSION.PATIENTS.VIEW_PATIENT,
						PERMISSION.PATIENTS.VIEW_RESULTS
					],
					component: PatientLaboratory
				},
				{
					path: '/patients/:patientUuid/hospital',
					auth: [
						PERMISSION.PATIENTS.VIEW_MODULE,
						PERMISSION.PATIENTS.VIEW_PATIENT,
						PERMISSION.PATIENTS.VIEW_STATIONARY
					],
					component: PatientHospital
				},
				{
					path: '/patients/:patientUuid/finance',
					auth: [
						PERMISSION.PATIENTS.VIEW_MODULE,
						PERMISSION.PATIENTS.VIEW_PATIENT,
						PERMISSION.PATIENTS.VIEW_PAYMENTS
					],
					component: PatientFinance
				},
				{
					path: '/patients/:patientUuid/tasks',
					auth: [
						PERMISSION.PATIENTS.VIEW_MODULE,
						PERMISSION.PATIENTS.VIEW_PATIENT,
						PERMISSION.PATIENTS.VIEW_TASKS
					],
					component: PatientTasks
				},
				{
					path: '/patients/:patientUuid/documents',
					auth: [
						PERMISSION.PATIENTS.VIEW_MODULE,
						PERMISSION.PATIENTS.VIEW_PATIENT,
						PERMISSION.PATIENTS.VIEW_DOCUMENTS
					],
					component: PatientDocuments
				}
			]
		}
	]
};
