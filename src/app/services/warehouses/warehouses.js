import { httpClient } from '../clients/httpClient';

export const warehousesService = {
	getWarehouses(params) {
		return httpClient.get('/warehouses/', { params }).then(({ data }) => data);
	},

	getWarehouse(uuid) {
		return httpClient.get(`/warehouses/${uuid}/`).then(({ data }) => data);
	},

	createWarehouse(data) {
		return httpClient.post('/warehouses/', data);
	},

	updateWarehouse(uuid, data) {
		return httpClient.put(`/warehouses/${uuid}/`, data);
	},

	deleteWarehouse(uuid) {
		return httpClient.delete(`/warehouses/${uuid}/`);
	}
};
