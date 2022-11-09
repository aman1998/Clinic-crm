import { httpClient } from '../clients/httpClient';

export const sourceHandbooksService = {
	getSources(params) {
		return httpClient.get('/source_handbook/', { params }).then(({ data }) => data);
	},

	createSource(data) {
		return httpClient.post(`/source_handbook/`, data).then(res => res.data);
	},

	getSource(uuid) {
		return httpClient.get(`/source_handbook/${uuid}/`).then(({ data }) => data);
	},

	updateSource(uuid, data) {
		return httpClient.put(`/source_handbook/${uuid}/`, data).then(res => res.data);
	},

	deleteSource(uuid) {
		return httpClient.delete(`/source_handbook/${uuid}/`).then(res => res.data);
	}
};
