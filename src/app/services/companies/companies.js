import { httpClient } from '../clients/httpClient';
import {
	MONEY_ACCOUNT_TYPE_CASH,
	MONEY_ACCOUNT_TYPE_NON_CASH,
	TYPE_CATEGORY_CASH,
	TYPE_CATEGORY_GLOBAL_FINANCE
} from './constants';

export const companiesService = {
	getPartnersCompanies(params) {
		return httpClient.get('/companies/partners/', { params });
	},

	getPartnerCompany(uuid) {
		return httpClient.get(`/companies/partners/${uuid}/`).then(({ data }) => data);
	},

	createPartnerCompany(data) {
		return httpClient.post('/companies/partners/ ', data);
	},

	updatePartnerCompany(uuid, data) {
		return httpClient.put(`/companies/partners/${uuid}/`, data);
	},

	removePartnerCompany(uuid) {
		return httpClient.delete(`/companies/partners/${uuid}/`);
	},

	getMoneyAccounts(params) {
		return httpClient.get('/companies/money_accounts/', { params });
	},

	getMoneyAccount(uuid) {
		return httpClient.get(`/companies/money_accounts/${uuid}/`).then(({ data }) => data);
	},

	createMoneyAccounts(data) {
		return httpClient.post('/companies/money_accounts/', data);
	},

	updateMoneyAccount(uuid, data) {
		return httpClient.put(`/companies/money_accounts/${uuid}/`, data);
	},

	removeMoneyAccount(uuid) {
		return httpClient.delete(`/companies/money_accounts/${uuid}/`);
	},

	getCompanyProviders(params) {
		return httpClient.get('/companies/providers/', { params }).then(({ data }) => data);
	},

	getCompanyProvider(uuid) {
		return httpClient.get(`/companies/providers/${uuid}/`);
	},

	removeCompanyProvider(uuid) {
		return httpClient.delete(`/companies/providers/${uuid}/`);
	},

	createCompanyProvider(data) {
		return httpClient.post('/companies/providers/ ', data);
	},

	updateCompanyProvider(uuid, data) {
		return httpClient.put(`/companies/providers/${uuid}/`, data);
	},

	getCompaniesPartnersStatisticsLaboratoryReceptionsPopular(params) {
		return httpClient.get('/companies/partners/statistics/laboratory_receptions/popular/', { params });
	},

	getCompaniesPartnersStatisticsLaboratoryReceptionsAbcAnalysis(params) {
		return httpClient.get('/companies/partners/statistics/laboratory_receptions/abc_analysis/', { params });
	},

	getCompaniesBranches(params) {
		return httpClient.get('/companies/branches/', { params }).then(({ data }) => data);
	},

	getCompanyBranch(uuid) {
		return httpClient.get(`/companies/branches/${uuid}/`).then(({ data }) => data);
	},

	createCompanyBranch(data) {
		return httpClient.post('/companies/branches/', data).then(({ data: response }) => response);
	},

	updateCompanyBranch(uuid, data) {
		return httpClient.put(`/companies/branches/${uuid}/`, data).then(({ data: response }) => response);
	},

	deleteCompanyBranch(uuid) {
		return httpClient.delete(`/companies/branches/${uuid}/`);
	},

	getListCategoryTypes() {
		return [
			{ type: TYPE_CATEGORY_GLOBAL_FINANCE, name: 'Финансовый' },
			{ type: TYPE_CATEGORY_CASH, name: 'Кассовый' }
		];
	},

	getListMoneyAccountTypes() {
		return [
			{ type: MONEY_ACCOUNT_TYPE_CASH, name: 'Наличный' },
			{ type: MONEY_ACCOUNT_TYPE_NON_CASH, name: 'Безналичный' }
		];
	},

	getMoneyAccountTypeByType(type) {
		return this.getListMoneyAccountTypes().find(item => item.type === type);
	}
};
