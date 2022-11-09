import { httpClient } from '../clients/httpClient';

export const leadsServices = {
	getLeadsTable() {
		return httpClient.get('/leads/kanban/table').then(({ data }) => data);
	},

	getLeadsHistory() {
		return httpClient.get('/leads/history').then(({ data }) => data);
	},

	getSourceHandbook(params) {
		return httpClient.get('/source_handbook', { params }).then(({ data }) => data);
	},

	patchLeadsTable(uuid, leadData) {
		return httpClient.patch(`/leads/leads/${uuid}`, leadData);
	},

	createComment(uuid, data) {
		return httpClient.post(`/leads/leads/${uuid}/comment`, data);
	},

	createLeadsTable(leadData) {
		return httpClient.post(`/leads/leads`, leadData);
	},

	patchPatient(uuid, data) {
		return httpClient.patch(`/leads/leads/${uuid}`, data);
	},

	createStage(data) {
		return httpClient.post(`/leads/kanban`, data);
	}
};
