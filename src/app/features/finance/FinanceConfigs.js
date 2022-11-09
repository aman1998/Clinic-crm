import React from 'react';
import { PERMISSION } from '../../services/auth/constants';
import FinanceCashierShift from './pages/FinanceCashierShift';
import FinancePayments from './pages/FinancePayments';
import FinanceReport from './pages/FinanceReport';
import FinanceWaitingForPayment from './pages/FinanceWaitingForPayment';

export const FinanceConfigs = {
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
			path: '/finance',
			auth: [PERMISSION.FINANCE.VIEW_MODULE],
			component: React.lazy(() => import('./pages/Finance')),
			routes: [
				{
					path: '/finance',
					auth: [PERMISSION.FINANCE.VIEW_MODULE, PERMISSION.FINANCE.VIEW_PENDING_ACTION],
					component: FinanceWaitingForPayment,
					exact: true
				},
				{
					path: '/finance/payments',
					auth: [PERMISSION.FINANCE.VIEW_MODULE, PERMISSION.FINANCE.VIEW_ACTIONS],
					component: FinancePayments
				},
				{
					path: '/finance/report',
					auth: [PERMISSION.FINANCE.VIEW_MODULE, PERMISSION.FINANCE.VIEW_REPORTS],
					component: FinanceReport
				},
				{
					path: '/finance/cashier-shift',
					auth: [PERMISSION.FINANCE.VIEW_MODULE], // FIXME Unknown permission
					component: FinanceCashierShift
				}
			]
		}
	]
};
