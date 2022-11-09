import { saveFile, expansionMimeType } from 'app/utils';
import { httpClient } from '../clients/httpClient';

export const treatmentService = {
	getTreatmentsTemplate(params) {
		return httpClient.get('/treatment-template', { params }).then(({ data }) => data);
	},
	getTreatmentTemplateByUuid(uuid) {
		return httpClient.get(`/treatment-template/${uuid}`);
	},
	deleteTreatmentTemplateByUuid(uuid) {
		return httpClient.delete(`/treatment-template/${uuid}`);
	},
	createTreatmentTemplate(data) {
		return httpClient.post('/treatment-template', data);
	},
	editTreatmentTemplate(data, uuid) {
		return httpClient.patch(`/treatment-template/${uuid}`, { ...data });
	},
	getTreatments(params) {
		return httpClient.get('/treatment', { params }).then(({ data }) => data);
	},
	getTreatmentByUuid(uuid) {
		return httpClient.get(`/treatment/${uuid}`);
	},
	createTreatment(data) {
		return httpClient.post('/treatment', data);
	},
	getPaymentsByUuid(uuid) {
		return httpClient.get(`/patients/${uuid}`);
	},
	createTreatmentRefuse(uuid, data) {
		return httpClient.post(`/treatment/${uuid}/refuse`, data);
	},
	updateTreatment(uuid, data) {
		return httpClient.patch(`/treatment/${uuid}`, data);
	},
	updateTreatmentAdditional(uuid, data) {
		return httpClient.patch(`/treatment/${uuid}/additionals`, data);
	},
	getTreatmentItems(uuid, params) {
		return httpClient.get(`/treatment/${uuid}/items`, { params });
	},
	getTreatmentSchedule(uuid, params) {
		return httpClient.get(`/treatment/${uuid}/items/schedule`, { params });
	},
	updateTreatmentStatus(uuid, data) {
		return httpClient.patch(`/treatment/${uuid}/patch`, data);
	},
	async downloadTreatment(treatment_uuid, params) {
		const result = await httpClient.get(`/treatment/${treatment_uuid}/additionals/excel`, {
			params,
			responseType: 'blob'
		});
		const type = expansionMimeType['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] ?? '';

		saveFile(result.data, `report${type}`);
	}
};
