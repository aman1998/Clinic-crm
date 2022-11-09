import { httpClient } from '../clients/httpClient';
import {
	STATUS_CLOSED,
	STATUS_DONE,
	STATUS_NEW,
	STATUS_PROCESSING,
	TYPE_COMPLIENT_DOCTOR,
	TYPE_COMPLIENT_PARTNER,
	TYPE_COMPLIENT_PATIENT,
	TYPE_PROPOSAL_DOCTOR,
	TYPE_PROPOSAL_PARTNER,
	TYPE_PROPOSAL_PATIENT,
	TYPE_REVIEW_DOCTOR,
	TYPE_REVIEW_PARTNER,
	TYPE_REVIEW_PATIENT
} from './constants';

export const qualityControlService = {
	getQualityControls(params) {
		return httpClient.get('/quality_controls/', { params }).then(({ data }) => data);
	},

	getQualityControl(uuid) {
		return httpClient.get(`/quality_controls/${uuid}/`).then(({ data }) => data);
	},

	createQualityControl(data) {
		return httpClient.post('/quality_controls/', data).then(response => response.data);
	},

	updateQualityControl(uuid, data) {
		return httpClient.put(`/quality_controls/${uuid}/`, data).then(response => response.data);
	},

	addComment(uuid, data) {
		return httpClient.post(`/quality_controls/${uuid}/comment/`, data).then(response => response.data);
	},

	addAttachmentFiles(uuid, files) {
		const formData = new FormData();
		files.forEach(file => formData.append('files', file));
		return httpClient.post(`/quality_controls/${uuid}/attachments/`, formData);
	},

	deleteAttachmentFiles(uuid, data) {
		return httpClient
			.delete(`/quality_controls/${uuid}/attachments/delete/`, { data })
			.then(response => response.data);
	},

	getTypesQualityControlList() {
		return [
			{ type: TYPE_REVIEW_PATIENT, name: 'Отзыв пациента' },
			{ type: TYPE_REVIEW_PARTNER, name: 'Отзыв партнера' },
			{ type: TYPE_REVIEW_DOCTOR, name: 'Отзыв сотрудника' },
			{ type: TYPE_COMPLIENT_PATIENT, name: 'Жалоба пациента' },
			{ type: TYPE_COMPLIENT_PARTNER, name: 'Жалоба партнера' },
			{ type: TYPE_COMPLIENT_DOCTOR, name: 'Жалоба сотрудника' },
			{ type: TYPE_PROPOSAL_PARTNER, name: 'Предложение партнера' },
			{ type: TYPE_PROPOSAL_PATIENT, name: 'Предложение пациента' },
			{ type: TYPE_PROPOSAL_DOCTOR, name: 'Предложение сотрудника' }
		];
	},

	getStatusQualityControlList() {
		return [
			{ type: STATUS_NEW, name: 'Новая заявка' },
			{ type: STATUS_PROCESSING, name: 'В обработке' },
			{ type: STATUS_DONE, name: 'Завершен' },
			{ type: STATUS_CLOSED, name: 'Отказан' }
		];
	},

	getStatusQualityControl(type) {
		return this.getStatusQualityControlList().find(item => item.type === type);
	},

	getTypeQualityControl(type) {
		return this.getTypesQualityControlList().find(item => item.type === type);
	},

	getAnalyticsByStatus(params) {
		return httpClient.get('/quality_controls/analytics_by_status/', { params }).then(({ data }) => data);
	},

	getAnalyticsByType(params) {
		return httpClient.get('/quality_controls/analytics_by_type/', { params }).then(({ data }) => data);
	}
};
