import React from 'react';
import { SettingsServicesList } from './pages/SettingsServicesList';
import { SettingsDirectionsList } from './pages/SettingsDirectionsList';
import { SettingsUsersList } from './pages/SettingsUsersList';
import { SettingsDoctorsList } from './pages/SettingsDoctorsList';
import { SettingsGroupsList } from './pages/SettingsGroupsList';
import { SettingsEquipmentsList } from './pages/SettingsEquipmentsList';
import { SettingsPromotionsList } from './pages/SettingsPromotionsList';
import { SettingsDiagnosesList } from './pages/SettingsDiagnosesList';
import { PERMISSION } from '../../services/auth/constants';
import { SettingsGroupBonusList } from './pages/SettingsGroupBonusList';

export const SettingsConfigs = {
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
			path: '/settings/service/:serviceUuid/edit',
			auth: [PERMISSION.SETTINGS.VIEW_MODULE, PERMISSION.CLINIC.VIEW_SERVICE, PERMISSION.CLINIC.CHANGE_SERVICE],
			exact: true,
			component: React.lazy(() => import('./pages/SettingsServiceEdit'))
		},
		{
			path: '/settings/diagnosis',
			auth: [PERMISSION.SETTINGS.VIEW_MODULE],
			exact: true,
			component: React.lazy(() => import('./pages/SettingsTreatment')),
			routes: [
				{
					path: '/settings/diagnosis',
					auth: [PERMISSION.SETTINGS.VIEW_MODULE],
					component: SettingsDiagnosesList,
					exact: true
				}
			]
		},
		{
			path: '/settings/operation',
			auth: [PERMISSION.SETTINGS.VIEW_MODULE],
			exact: true,
			component: React.lazy(() => import('./pages/SettingsOperation'))
		},
		{
			path: '/settings/users/:userUuid/edit',
			auth: [PERMISSION.SETTINGS.VIEW_MODULE, PERMISSION.USERS.VIEW_USER, PERMISSION.USERS.CHANGE_USER],
			exact: true,
			component: React.lazy(() => import('./pages/SettingsUserEdit'))
		},
		{
			path: '/settings/documents/templates/:documentTemplateUuid/edit',
			auth: [
				PERMISSION.SETTINGS.VIEW_MODULE,
				PERMISSION.DOCUMENTS.VIEW_DOCUMENT_TEMPLATE,
				PERMISSION.DOCUMENTS.CHANGE_DOCUMENT_TEMPLATE
			],
			exact: true,
			component: React.lazy(() => import('./pages/SettingsDocumentTemplateEdit'))
		},
		{
			path: '/settings/users',
			auth: [PERMISSION.SETTINGS.VIEW_MODULE, PERMISSION.USERS.VIEW_USER],
			component: React.lazy(() => import('./pages/SettingsUsers')),
			routes: [
				{
					path: '/settings/users',
					auth: [PERMISSION.SETTINGS.VIEW_MODULE, PERMISSION.USERS.VIEW_USER],
					exact: true,
					component: SettingsUsersList
				},
				{
					path: '/settings/users/doctors',
					auth: [PERMISSION.SETTINGS.VIEW_MODULE],
					component: SettingsDoctorsList
				},
				{
					path: '/settings/users/groups',
					auth: [PERMISSION.SETTINGS.VIEW_MODULE], // FIXME Unknown permission
					component: SettingsGroupsList
				}
			]
		},

		{
			path: '/settings/providers',
			auth: [PERMISSION.SETTINGS.VIEW_MODULE, PERMISSION.COMPANIES.VIEW_PROVIDER],
			exact: true,
			component: React.lazy(() => import('./pages/SettingsProvidersList'))
		},
		{
			path: '/settings/partners',
			auth: [PERMISSION.SETTINGS.VIEW_MODULE, PERMISSION.COMPANIES.VIEW_PARTNER],
			exact: true,
			component: React.lazy(() => import('./pages/SettingsPartnersList'))
		},
		{
			path: '/settings/juridical-persons',
			auth: [PERMISSION.SETTINGS.VIEW_MODULE], // FIXME Unknown permission
			exact: true,
			component: React.lazy(() => import('./pages/SettingsJuridicalPersons'))
		},
		{
			path: '/settings/finance-state',
			auth: [PERMISSION.SETTINGS.VIEW_MODULE], // FIXME Unknown permission
			exact: true,
			component: React.lazy(() => import('./pages/SettingsFinanceStateList'))
		},
		{
			path: '/settings/global-finance-state',
			auth: [PERMISSION.SETTINGS.VIEW_MODULE], // FIXME Unknown permission
			exact: true,
			component: React.lazy(() => import('./pages/SettingsGlobalFinanceStateList'))
		},
		{
			path: '/settings/money-accounts',
			auth: [PERMISSION.SETTINGS.VIEW_MODULE], // FIXME Unknown permission
			exact: true,
			component: React.lazy(() => import('./pages/SettingsMoneyAccountsList'))
		},
		{
			path: '/settings/contacts',
			auth: [PERMISSION.SETTINGS.VIEW_MODULE], // FIXME Unknown permission
			exact: true,
			component: React.lazy(() => import('./pages/SettingsContacts'))
		},
		{
			path: '/settings/holidays',
			auth: [PERMISSION.SETTINGS.VIEW_MODULE],
			exact: true,
			component: React.lazy(() => import('./pages/SettingsHolidays'))
		},
		{
			path: '/settings/services',
			auth: [PERMISSION.SETTINGS.VIEW_MODULE],
			component: React.lazy(() => import('./pages/Settings')),
			routes: [
				{
					path: '/settings/services',
					auth: [PERMISSION.SETTINGS.VIEW_MODULE, PERMISSION.CLINIC.VIEW_SERVICE],
					component: SettingsServicesList,
					exact: true
				},
				{
					path: '/settings/services/directions',
					auth: [PERMISSION.SETTINGS.VIEW_MODULE, PERMISSION.CLINIC.VIEW_DIRECTION],
					component: SettingsDirectionsList
				},
				{
					path: '/settings/services/promotions',
					auth: [PERMISSION.SETTINGS.VIEW_MODULE],
					component: SettingsPromotionsList
				}
			]
		},
		{
			path: '/settings/documents/templates',
			auth: [PERMISSION.SETTINGS.VIEW_MODULE, PERMISSION.DOCUMENTS.VIEW_DOCUMENT_TEMPLATE],
			exact: true,
			component: React.lazy(() => import('./pages/SettingsDocumentTemplateList'))
		},
		{
			path: '/settings/equipments',
			auth: [PERMISSION.SETTINGS.VIEW_MODULE, PERMISSION.EQUIPMENTS.VIEW_MODULE],
			component: React.lazy(() => import('./pages/SettingsEquipments')),
			routes: [
				{
					path: '/settings/equipments',
					auth: [PERMISSION.SETTINGS.VIEW_MODULE, PERMISSION.EQUIPMENTS.VIEW_MODULE],
					component: SettingsEquipmentsList,
					exact: true
				}
			]
		},
		{
			path: '/settings/source-handbook',
			auth: [PERMISSION.SETTINGS.VIEW_MODULE],
			exact: true,
			component: React.lazy(() => import('./pages/SettingsSourceHandbookList'))
		},
		{
			path: '/settings/group-bonus',
			auth: [PERMISSION.SETTINGS.VIEW_MODULE],
			exact: true,
			component: React.lazy(() => import('./pages/SettingsGroupBonus')),
			routes: [
				{
					path: '/settings/group-bonus',
					auth: [PERMISSION.SETTINGS.VIEW_MODULE],
					component: SettingsGroupBonusList,
					exact: true
				}
			]
		},
		{
			path: '/settings/branches',
			auth: [PERMISSION.SETTINGS.VIEW_MODULE],
			exact: true,
			component: React.lazy(() => import('./pages/SettingsBranches'))
		}
	]
};
