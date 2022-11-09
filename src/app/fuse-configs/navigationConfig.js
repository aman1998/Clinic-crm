import i18next from 'i18next';
import { PERMISSION } from '../services/auth/constants';
import ru from './navigation-i18n/ru';

i18next.addResourceBundle('ru', 'navigation', ru);

const navigationConfig = [
	{
		id: 'analytics',
		title: 'Аналитика',
		type: 'item',
		icon: 'poll',
		auth: [PERMISSION.ANALYTICS.VIEW_MODULE],
		url: '/analytics'
	},
	{
		id: 'registry',
		title: 'Регистратура',
		type: 'item',
		icon: 'contact_phone',
		auth: [PERMISSION.CLINIC.VIEW_MODULE],
		url: '/reception'
	},
	{
		id: 'leaders',
		title: 'Лиды',
		type: 'item',
		icon: 'poll',
		auth: [PERMISSION.CLINIC.VIEW_MODULE],
		url: '/leads'
	},
	{
		id: 'treatment',
		title: 'Лечение',
		type: 'item',
		icon: 'poll',
		exact: true,
		auth: [PERMISSION.CLINIC.VIEW_MODULE],
		url: '/treatment'
	},
	{
		id: 'hospital',
		title: 'Стационар',
		type: 'item',
		icon: 'local_hotel',
		auth: [PERMISSION.HOSPITAL.VIEW_MODULE],
		url: '/hospital'
	},
	{
		id: 'laboratory',
		title: 'Лаборатория',
		type: 'item',
		icon: 'colorize',
		auth: [PERMISSION.LABORATORY.VIEW_MODULE],
		url: '/laboratory'
	},
	{
		id: 'operation',
		title: 'Операции',
		type: 'item',
		icon: 'loupe',
		url: '/operation',
		auth: [PERMISSION.OPERATIONS.VIEW_MODULE],
		exact: true
	},
	{
		id: 'finance',
		title: 'Касса',
		type: 'item',
		icon: 'payment',
		auth: [PERMISSION.FINANCE.VIEW_MODULE],
		url: '/finance'
	},
	{
		id: 'globalFinance',
		title: 'Финансы',
		type: 'item',
		icon: 'tenge',
		auth: [PERMISSION.FINANCE.VIEW_FINANCE_MODULE],
		url: '/global-finance'
	},
	{
		id: 'patient',
		title: 'Пациенты',
		type: 'item',
		icon: 'group',
		auth: [PERMISSION.PATIENTS.VIEW_MODULE],
		url: '/patients',
		exact: true
	},
	{
		id: 'doctor',
		title: 'Врачи',
		type: 'item',
		icon: 'local_hospital',
		auth: [PERMISSION.EMPLOYEES.VIEW_MODULE],
		url: '/all-doctors',
		exact: true
	},
	{
		id: 'warehouse',
		title: 'Склад',
		type: 'item',
		icon: 'shopping_cart',
		auth: [PERMISSION.WAREHOUSES.VIEW_MODULE],
		url: '/warehouse'
	},
	{
		id: 'tasks',
		title: 'Задачи',
		type: 'item',
		icon: 'format_list_bulleted',
		auth: [PERMISSION.TASKS.VIEW_MODULE],
		url: '/tasks'
	},
	{
		id: 'documents',
		title: 'Документы',
		type: 'item',
		icon: 'description',
		auth: [PERMISSION.DOCUMENTS.VIEW_DOCUMENT_CONTRACT],
		url: '/documents'
	},
	{
		id: 'qualityControl',
		title: 'Контроль качества',
		type: 'item',
		icon: 'assignment',
		auth: [PERMISSION.QUALITY_CONTROL.VIEW_MODULE],
		url: '/quality-control'
	},
	{
		id: 'settings',
		title: 'Настройки',
		type: 'collapse',
		icon: 'settings',
		auth: [PERMISSION.SETTINGS.VIEW_MODULE],
		children: [
			{
				id: 'branches',
				title: 'Филиалы',
				type: 'item',
				url: '/settings/branches',
				auth: [PERMISSION.SETTINGS.VIEW_MODULE],
				exact: true
			},
			{
				id: 'services',
				title: 'Услуги',
				type: 'item',
				url: '/settings/services',
				auth: [PERMISSION.SETTINGS.VIEW_MODULE, PERMISSION.CLINIC.VIEW_SERVICE],
				exact: true
			},
			{
				id: 'treatment',
				title: 'Лечение',
				type: 'item',
				url: '/settings/diagnosis',
				auth: [PERMISSION.SETTINGS.VIEW_MODULE, PERMISSION.CLINIC.VIEW_SERVICE],
				exact: true
			},
			{
				id: 'operation',
				title: 'Операции',
				type: 'item',
				url: '/settings/operation',
				auth: [PERMISSION.SETTINGS.VIEW_MODULE, PERMISSION.TREATMENTS.VIEW_MODULE],
				exact: true
			},
			{
				id: 'users',
				title: 'Пользователи',
				type: 'item',
				url: '/settings/users',
				auth: [PERMISSION.SETTINGS.VIEW_MODULE, PERMISSION.USERS.VIEW_USER],
				exact: true
			},
			{
				id: 'providers',
				title: 'Поставщики',
				type: 'item',
				url: '/settings/providers',
				auth: [PERMISSION.SETTINGS.VIEW_MODULE, PERMISSION.COMPANIES.VIEW_PROVIDER],
				exact: true
			},
			{
				id: 'partners',
				title: 'Партнёры',
				type: 'item',
				url: '/settings/partners',
				auth: [PERMISSION.SETTINGS.VIEW_MODULE, PERMISSION.COMPANIES.VIEW_PARTNER],
				exact: true
			},
			{
				id: 'juridical-persons',
				title: 'Юридические лица',
				type: 'item',
				url: '/settings/juridical-persons',
				auth: [PERMISSION.SETTINGS.VIEW_MODULE], // FIXME Unknown permission
				exact: true
			},
			{
				id: 'finance-state',
				title: 'Кассовые статьи',
				type: 'item',
				url: '/settings/finance-state',
				auth: [PERMISSION.SETTINGS.VIEW_MODULE, PERMISSION.FINANCE.VIEW_MODULE],
				exact: true
			},
			{
				id: 'global-finance-state',
				title: 'Финансовые статьи',
				type: 'item',
				url: '/settings/global-finance-state',
				auth: [PERMISSION.SETTINGS.VIEW_MODULE], // FIXME Unknown permission
				exact: true
			},
			{
				id: 'money-accounts',
				title: 'Реквизиты счетов',
				type: 'item',
				url: '/settings/money-accounts',
				auth: [PERMISSION.SETTINGS.VIEW_MODULE, PERMISSION.FINANCE.VIEW_MODULE], // FIXME Unknown permission
				exact: true
			},
			{
				id: 'holidays',
				title: 'Календарь праздников',
				type: 'item',
				url: '/settings/holidays',
				auth: [PERMISSION.SETTINGS.VIEW_MODULE], // FIXME Unknown permission
				exact: true
			},
			{
				id: 'contacts',
				title: 'Контакты',
				type: 'item',
				url: '/settings/contacts',
				auth: [PERMISSION.SETTINGS.VIEW_MODULE], // FIXME Unknown permission
				exact: true
			},
			{
				id: 'documents',
				title: 'Документы',
				type: 'item',
				url: '/settings/documents/templates',
				auth: [PERMISSION.DOCUMENTS.VIEW_DOCUMENT_TEMPLATE],
				exact: true
			},
			{
				id: 'equipments',
				title: 'Оборудование',
				type: 'item',
				url: '/settings/equipments',
				auth: [PERMISSION.EQUIPMENTS.VIEW_MODULE],
				exact: true
			},
			{
				id: 'source-handbook',
				title: 'Источники лидов',
				type: 'item',
				url: '/settings/source-handbook',
				auth: [PERMISSION.SETTINGS.VIEW_MODULE],
				exact: true
			},
			{
				id: 'group-bonus',
				title: 'Групповой бонус',
				type: 'item',
				url: '/settings/group-bonus',
				auth: [PERMISSION.SETTINGS.VIEW_MODULE],
				exact: true
			}
		]
	}
];

export default navigationConfig;
