import React from 'react';
import { GlobalFinanceOperations } from './pages/GlobalFinanceOperations';
import { GlobalFinanceIncomeLossReport } from './pages/GlobalFinanceIncomeLossReport';
import { GlobalFinanceCostPrice } from './pages/GlobalFinanceCostPrice';
import { GlobalFinanceSalaryPending } from './pages/GlobalFinanceSalaryPending';
import GlobalFinanceSalary from './pages/GlobalFinanceSalary';
import { GlobalFinanceSalaryHistory } from './pages/GlobalFinanceSalaryHistory';

export const GlobalFinanceConfigs = {
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
			path: '/global-finance',
			component: React.lazy(() => import('./pages/GlobalFinance')),
			routes: [
				{
					path: '/global-finance',
					component: GlobalFinanceOperations,
					exact: true
				},
				{
					path: '/global-finance/income-loss-report',
					component: GlobalFinanceIncomeLossReport
				},
				{
					path: '/global-finance/cost-price',
					component: GlobalFinanceCostPrice
				},
				{
					path: '/global-finance/salary',
					component: GlobalFinanceSalary,
					routes: [
						{
							path: '/global-finance/salary',
							component: GlobalFinanceSalaryPending,
							exact: true
						},
						{
							path: '/global-finance/salary/history',
							component: GlobalFinanceSalaryHistory
						}
					]
				}
			]
		}
	]
};
