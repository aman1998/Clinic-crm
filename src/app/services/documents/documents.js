import { httpClient } from '../clients/httpClient';
import { expansionMimeType, saveFile } from '../../utils';

export const documentsService = {
	getDocumentsTemplates(params) {
		return httpClient.get('/documents/templates/', { params }).then(({ data }) => data);
	},

	createDocumentTemplate(data) {
		return httpClient.post('/documents/templates/', data).then(response => response.data);
	},

	removeDocumentTemplate(uuid) {
		return httpClient.delete(`/documents/templates/${uuid}/`).then(response => response.data);
	},

	getDocumentTemplate(uuid) {
		return httpClient.get(`/documents/templates/${uuid}/`).then(({ data }) => data);
	},

	updateFileDocumentTemplate(uuid, file) {
		const formData = new FormData();
		formData.append('file', file);

		return httpClient.patch(`/documents/templates/${uuid}/`, formData).then(response => response.data);
	},

	patchDocumentTemplate(uuid, data) {
		return httpClient.patch(`/documents/templates/${uuid}/`, data).then(response => response.data);
	},

	createContractDocument(data) {
		return httpClient.post('/documents/contracts/', data).then(response => response.data);
	},

	getContractDocuments(params) {
		return httpClient.get('/documents/contracts/', { params }).then(response => response.data);
	},

	getContractDocument(uuid) {
		return httpClient.get(`/documents/contracts/${uuid}/`).then(response => response.data);
	},

	async exportContractDocument(uuid) {
		const result = await httpClient.get(`/documents/contracts/${uuid}/doc/`, {
			responseType: 'blob'
		});
		const type = expansionMimeType[result.headers['content-type']] ?? '';

		saveFile(result.data, `report${type}`);
	},

	updateContractDocument(uuid, data) {
		return httpClient.put(`/documents/contracts/${uuid}/`, data).then(response => response.data);
	},

	assignNumberForContractDocument(uuid) {
		return httpClient.put(`/documents/contracts/${uuid}/assign_number/`).then(response => response.data);
	},

	addCommentInContractDocument(uuid, data) {
		return httpClient.post(`/documents/contracts/${uuid}/comment/`, data).then(response => response.data);
	},

	getDocumentWordMasks() {
		return [
			{ key: 'date', description: 'Дата присвоения номера документа / Дата создания документа' },
			{ key: 'full_name', description: 'Полное имя Пациента' },
			{ key: 'doctor_full_name', description: 'Полное имя Доктора' },
			{ key: 'iin', description: 'ИИН Пациента' },
			{ key: 'total_cost', description: 'Итоговая сумма' },
			{ key: 'licence_number', description: 'номер удостоверения личности' },
			{ key: 'licence_issuance_date', description: 'удостоверение личности выдано' },
			{ key: 'birth_date', description: 'дата рождения' },
			{ key: 'main_phone', description: 'номер телефона' },
			{ key: 'relative_contact_name', description: 'ФИО ближайшего родственника' },
			{ key: 'relative_contact_phone', description: 'номер телефона ближайшего родственника' },
			{ key: 'service_name', description: 'Название услуги' },
			{ key: 'service_price', description: 'Цена услуги' }
		];
	}
};
