import { httpClient } from '../clients/httpClient';
import {
	STATUS_LABORATORY_RECEPTION_CASH,
	STATUS_LABORATORY_RECEPTION_CONFIRMED,
	STATUS_LABORATORY_RECEPTION_PAID
} from './constants';

export const laboratoryService = {
	getLaboratoryReceptions(params) {
		return httpClient.get('/laboratory/receptions/', { params });
	},

	createLaboratoryReceptions(data) {
		return httpClient.post('/laboratory/receptions/', data);
	},

	getLaboratoryReception(uuid) {
		return httpClient.get(`/laboratory/receptions/${uuid}/`);
	},

	updateLaboratoryReception(uuid, data) {
		return httpClient.put(`/laboratory/receptions/${uuid}/`, data);
	},

	checkoutLaboratoryReception(uuid) {
		return httpClient.post(`/laboratory/receptions/${uuid}/checkout/`);
	},

	getLaboratoryReceptionResults(reception_uuid, params) {
		return httpClient.get(`/laboratory/receptions/${reception_uuid}/results/`, params);
	},

	createLaboratoryReceptionResults(reception_uuid, files) {
		const formData = new FormData();

		files.forEach(file => formData.append('files', file));

		return httpClient.post(`/laboratory/receptions/${reception_uuid}/results/create/`, formData);
	},

	deleteLaboratoryReceptionResults(reception_uuid, data) {
		return httpClient.delete(`/laboratory/receptions/${reception_uuid}/results/delete/`, { data });
	},

	sendLaboratoryReceptionResults(reception_uuid) {
		return httpClient.post(`/laboratory/receptions/${reception_uuid}/results/send/`);
	},

	getLaboratoryStatisticsReceptions(params) {
		return httpClient.get('/laboratory/statistics/receptions/', { params });
	},

	getStatusLaboratoryReceptionsList() {
		return [
			{ type: STATUS_LABORATORY_RECEPTION_CONFIRMED, name: 'Прием подтвержден' },
			{ type: STATUS_LABORATORY_RECEPTION_CASH, name: 'Отправлено на кассу' },
			{ type: STATUS_LABORATORY_RECEPTION_PAID, name: 'Оплачено пациентом' }
		];
	},

	getStatusLaboratoryReception(type) {
		return this.getProductCostHistoryTypeList().find(item => item.type === type);
	}
};
