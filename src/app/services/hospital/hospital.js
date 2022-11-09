import { httpClient } from '../clients/httpClient';
import {
	STATUS_HOSPITAL_RECEPTION_PAID,
	STATUS_HOSPITAL_RECEPTION_CASH,
	STATUS_HOSPITAL_RECEPTION_CONFIRMED
} from './constants';

export const hospitalService = {
	getHospitalReceptions(params) {
		return httpClient.get('/hospital/receptions/', { params }).then(({ data }) => data);
	},

	createHospitalReceptions(data) {
		return httpClient.post('/hospital/receptions/ ', data).then(response => response.data);
	},

	getHospitalReception(uuid) {
		return httpClient.get(`/hospital/receptions/${uuid}/`).then(({ data }) => data);
	},

	updateHospitalReception(uuid, data) {
		return httpClient.put(`/hospital/receptions/${uuid}/`, data).then(response => response.data);
	},

	checkoutHospitalReception(uuid, data) {
		return httpClient.post(`/hospital/receptions/${uuid}/checkout/`, data).then(response => response.data);
	},

	confirmHospitalReception(uuid, data) {
		return httpClient.put(`/hospital/receptions/${uuid}/confirm/`, data).then(response => response.data);
	},

	getHospitalStatisticsReceptions(params) {
		return httpClient.get('/hospital/statistics/receptions/', { params }).then(({ data }) => data);
	},

	getStatusHospitalReceptionsList() {
		return [
			{ type: STATUS_HOSPITAL_RECEPTION_CONFIRMED, name: 'Прием подтвержден' },
			{ type: STATUS_HOSPITAL_RECEPTION_CASH, name: 'Отправлено на кассу' },
			{ type: STATUS_HOSPITAL_RECEPTION_PAID, name: 'Оплачено пациентом' }
		];
	},

	getStatusHospitalReception(type) {
		return this.getStatusHospitalReceptionsList().find(item => item.type === type);
	}
};
