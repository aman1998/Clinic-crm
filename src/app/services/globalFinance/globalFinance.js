import { httpClient } from '../clients/httpClient';
import {
	GROUP_TYPE_COMING,
	GROUP_TYPE_MOVING,
	GROUP_TYPE_SPENDING,
	COUNTERPARTY_TYPE_DOCTOR,
	COUNTERPARTY_TYPE_MONEY_ACCOUNT,
	COUNTERPARTY_TYPE_PARTNER,
	COUNTERPARTY_TYPE_PATIENT,
	COUNTERPARTY_TYPE_PERSONAL
} from './constants';
import { expansionMimeType, saveFile } from '../../utils';

export const globalFinanceService = {
	getActions(params) {
		return httpClient.get('/global_finance/actions/', { params }).then(({ data }) => data);
	},

	createAction(data) {
		return httpClient.post('/global_finance/actions/', data).then(response => response.data);
	},

	getAction(uuid) {
		return httpClient.get(`/global_finance/actions/${uuid}/`).then(({ data }) => data);
	},

	updateAction(uuid, data) {
		return httpClient.put(`/global_finance/actions/${uuid}/`, data);
	},

	patchAction(uuid, data) {
		return httpClient.patch(`/global_finance/actions/${uuid}/`, data);
	},

	acceptAction(uuid, data) {
		return httpClient.post(`/global_finance/actions/${uuid}/accept/`, data);
	},

	attachmentAction(uuid, data) {
		return httpClient.post(`/global_finance/actions/${uuid}/attachment/`, data);
	},

	closeAction(uuid, data) {
		return httpClient.post(`/global_finance/actions/${uuid}/close/`, data);
	},

	commentAction(uuid, data) {
		return httpClient.post(`/global_finance/actions/${uuid}/comment/`, data);
	},

	controlAction(uuid, data) {
		return httpClient.post(`/global_finance/actions/${uuid}/control/`, data);
	},

	finishAction(uuid, data) {
		return httpClient.post(`/global_finance/actions/${uuid}/finish/`, data);
	},

	reworkAction(uuid, data) {
		return httpClient.post(`/global_finance/actions/${uuid}/rework/`, data);
	},

	deleteAction(uuid) {
		return httpClient.delete(`/global_finance/actions/${uuid}/`);
	},

	undeleteAction(uuid) {
		return httpClient.post(`/global_finance/actions/${uuid}/undelete/`);
	},

	getGroups(params) {
		return httpClient.get('/global_finance/groups/', { params }).then(({ data }) => data);
	},

	getGroupsTypeList() {
		return [
			{ type: GROUP_TYPE_COMING, name: 'Приход' },
			{ type: GROUP_TYPE_SPENDING, name: 'Расход' },
			{ type: GROUP_TYPE_MOVING, name: 'Перемещение' }
		];
	},

	getGroupTypeNameByType(type) {
		return this.getGroupsTypeList().find(item => item.type === type)?.name ?? '';
	},

	getCounterpartyTypeList() {
		return [
			{ type: COUNTERPARTY_TYPE_DOCTOR, name: 'Врач' },
			{ type: COUNTERPARTY_TYPE_PARTNER, name: 'Партнёр' },
			{ type: COUNTERPARTY_TYPE_PATIENT, name: 'Пациент' },
			{ type: COUNTERPARTY_TYPE_PERSONAL, name: 'Сотрудник' },
			{ type: COUNTERPARTY_TYPE_MONEY_ACCOUNT, name: 'Счёт' }
		];
	},

	getCounterpartyTypeNameByType(type) {
		return this.getCounterpartyTypeList().find(item => item.type === type)?.name ?? '';
	},

	createGroup(data) {
		return httpClient.post('/global_finance/groups/', data);
	},

	getStates(params) {
		return httpClient.get('/global_finance/states/', { params }).then(({ data }) => data);
	},

	getState(uuid) {
		return httpClient.get(`/global_finance/states/${uuid}/`).then(({ data }) => data);
	},

	createState(data) {
		return httpClient.post('/global_finance/states/', data);
	},

	updateState(uuid, data) {
		return httpClient.put(`/global_finance/states/${uuid}/`, data);
	},

	removeState(uuid) {
		return httpClient.delete(`/global_finance/states/${uuid}`);
	},

	getActionsIncomeLossReport(params) {
		return httpClient.get('/global_finance/actions/income_loss_report/', { params }).then(({ data }) => data);
	},

	getActionAttachments(uuid) {
		return httpClient.get(`/global_finance/actions/${uuid}/attachments/`).then(({ data }) => data);
	},

	createActionAttachments(uuid, files) {
		const formData = new FormData();

		files.forEach(file => formData.append('files', file));

		return httpClient
			.post(`/global_finance/actions/${uuid}/attachments/create/`, formData)
			.then(({ data }) => data);
	},

	deleteActionAttachments(uuid, listUuidFiles) {
		const data = listUuidFiles.map(item => ({ uuid: item }));

		return httpClient
			.delete(`/global_finance/actions/${uuid}/attachments/delete`, { data })
			.then(response => response.data);
	},

	getActionsIncomeLossReportAsTree(params) {
		return this.getActionsIncomeLossReport(params).then(data => {
			const periods = data[0].periods.map(item => item.period_name);
			const valuesName = data[1];

			let rows = data.slice(2).map(item => ({
				...item,
				children: []
			}));

			const map = [];

			rows.forEach(item => {
				if (item.level - 1 in map) {
					map[item.level - 1].children.push(item);
				}

				map[item.level] = item;
			});

			rows = rows.filter(item => item.level === 1);

			return {
				periods,
				valuesName,
				rows
			};
		});
	},

	async exportIncomeLossReport(params) {
		const result = await httpClient.get('/global_finance/actions/income_loss_report/download_excel/', {
			params,
			responseType: 'blob'
		});
		const type = expansionMimeType[result.headers['content-type']] ?? '';

		saveFile(result.data, `report${type}`);
	}
};
