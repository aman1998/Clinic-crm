import React from 'react';
import { TreatmentsList } from './pages/TreatmentsList';
import { TreatmentDetailsPage } from './pages/TreatmentDatailsPage';
import { TreatmentDetailSchedulePage } from './pages/TreatmentDetailSchedulePage';
import { TreatmentDetailPaymentPage } from './pages/TreatmentDetailPaymentPage';

export const TreatmentConfigs = {
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
			path: '/treatment',
			component: React.lazy(() => import('./pages/Treatments')),
			exact: true,
			routes: [
				{
					path: '/treatment',
					component: TreatmentsList,
					exact: true
				}
			]
		},
		{
			path: '/treatment/:treatmentUuid',
			component: React.lazy(() => import('./pages/Treatment')),
			exact: true,
			routes: [
				{
					path: '/treatment/:treatmentUuid',
					component: TreatmentDetailsPage,
					exact: true
				}
			]
		},
		{
			path: '/treatment/:treatmentUuid/schedule',
			component: React.lazy(() => import('./pages/Treatment')),
			exact: true,
			routes: [
				{
					path: '/treatment/:treatmentUuid/schedule',
					component: TreatmentDetailSchedulePage,
					exact: true
				}
			]
		},
		{
			path: '/treatment/:treatmentUuid/payment',
			component: React.lazy(() => import('./pages/Treatment')),
			exact: true,
			routes: [
				{
					path: '/treatment/:treatmentUuid/payment',
					component: TreatmentDetailPaymentPage,
					exact: true
				}
			]
		}
	]
};
