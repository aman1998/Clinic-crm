import { httpClient } from '../clients/httpClient';

export const equipmentsService = {
	getEquipments(params) {
		return httpClient.get('/equipments/', { params }).then(({ data }) => data);
	},

	getEquipmentByUuid(uuid) {
		return httpClient.get(`/equipments/${uuid}/`).then(({ data }) => data);
	},

	createEquipment(data) {
		return httpClient.post('/equipments/', data).then(response => response.data);
	},

	updateEquipment(uuid, data) {
		return httpClient.put(`/equipments/${uuid}/`, data).then(response => response.data);
	},

	deleteEquipment(uuid) {
		return httpClient.delete(`/equipments/${uuid}/`);
	},

	getEquipmentReceptions(params) {
		return httpClient.get('/equipments/receptions/', { params }).then(({ data }) => data);
	}
};
