import { httpClient } from '../clients/httpClient';
import {
	OPERATION_STAGE_INITIAL_CONSULTATION,
	OPERATION_STAGE_OPERATION,
	OPERATION_STAGE_SIMPLE,
	OPERATION_STATUS_IN_PROGRESS,
	OPERATION_STATUS_COMPLETED,
	OPERATION_STATUS_CANCELED,
	OPERATION_STATUS_WAITING
} from './constants';
import { expansionMimeType, printFile } from '../../utils';

export const operationService = {
	getOperations(params) {
		return httpClient.get('/operation/operations/', { params }).then(({ data }) => data);
	},

	getOperation(uuid, params) {
		return httpClient.get(`/operation/operations/${uuid}/`, { params }).then(({ data }) => data);
	},

	createOperation(data) {
		return httpClient.post('/operation/operations/', data);
	},

	updateOperation(uuid, data) {
		return httpClient.put(`/operation/operations/${uuid}/`, data);
	},

	checkoutOperation(uuid) {
		return httpClient.post(`/operation/operations/${uuid}/checkout/`);
	},

	getOperationStages(params) {
		return httpClient.get('/operation/stage/', { params }).then(({ data }) => data);
	},

	getOperationStage(uuid, params) {
		return httpClient.get(`/operation/stage/${uuid}/`, { params }).then(({ data }) => data);
	},

	createOperationStage(data) {
		return httpClient.post('/operation/stage/', data);
	},

	removeOperationStage(uuid) {
		return httpClient.delete(`/operation/stage/${uuid}/`);
	},

	updateOperationStage(uuid, data) {
		return httpClient.put(`/operation/stage/${uuid}/`, data);
	},

	createOperationComment(uuid, data) {
		return httpClient.post(`/operation/operations/${uuid}/comment/`, data).then(response => response.data);
	},

	getOperationCreatedStages(params) {
		return httpClient.get('/operation/operation_stage/', { params }).then(({ data }) => data);
	},

	getOperationCreatedStage(uuid) {
		return httpClient.get(`/operation/operation_stage/${uuid}/`).then(({ data }) => data);
	},

	patchOperationCreatedStage(uuid, data) {
		return httpClient.patch(`/operation/operation_stage/${uuid}/`, data);
	},

	printOperation(uuid) {
		return httpClient.get(`/operation/operations/${uuid}/print_anamnes/`, { responseType: 'blob' });
	},

	changeResponsibleOperationCreatedStage(uuid, data) {
		return httpClient
			.post(`/operation/operation_stage/${uuid}/change_responsible_user/`, data)
			.then(response => response.data);
	},

	nextOperationCreatedStage(uuid, data) {
		return httpClient.post(`/operation/operation_stage/${uuid}/next_stage/`, data).then(response => response.data);
	},

	doneOperationCreatedStage(uuid, data) {
		return httpClient.post(`/operation/operation_stage/${uuid}/done/`, data).then(response => response.data);
	},

	cancelOperationCreatedStage(uuid, data) {
		return httpClient.post(`/operation/operation_stage/${uuid}/cancel/`, data).then(response => response.data);
	},

	reworkOperationCreatedStage(uuid, data) {
		return httpClient.post(`/operation/operation_stage/${uuid}/rework/`, data).then(response => response.data);
	},

	getOperationSupplement(uuid) {
		return httpClient.get(`/operation/operations/${uuid}/supplement/`).then(({ data }) => data);
	},

	updateOperationSupplement(uuid, data) {
		return httpClient.put(`/operation/operations/${uuid}/supplement/`, data).then(response => response.data);
	},

	getAttachmentInOperationCreatedStage(uuid) {
		return httpClient.get(`/operation/operation_stage/${uuid}/attachments/`).then(({ data }) => data);
	},

	deleteAttachmentInOperationCreatedStage(uuid, data) {
		return httpClient.delete(`/operation/operation_stage/${uuid}/attachments/delete/`, { data });
	},

	createAttachmentInOperationCreatedStage(uuid, file) {
		const formData = new FormData();

		formData.append('file', file);

		return httpClient
			.post(`/operation/operation_stage/${uuid}/create_attachment/`, formData)
			.then(({ data }) => data);
	},

	getOperationStatuses() {
		return [
			{ type: OPERATION_STATUS_IN_PROGRESS, name: 'В процессе' },
			{ type: OPERATION_STATUS_COMPLETED, name: 'Завершен' },
			{ type: OPERATION_STATUS_CANCELED, name: 'Отменен' },
			{ type: OPERATION_STATUS_WAITING, name: 'В ожидании' }
		];
	},

	getOperationStatus(type) {
		return this.getOperationStatuses().find(item => item.type === type);
	},

	getTypesOperationStage() {
		return [
			{ type: OPERATION_STAGE_SIMPLE, name: 'Обычный' },
			{ type: OPERATION_STAGE_OPERATION, name: 'Операция' },
			{ type: OPERATION_STAGE_INITIAL_CONSULTATION, name: 'Первичная консультация' }
		];
	},

	async printOperationActionCheck(uuid) {
		const result = await this.printOperation(uuid);
		const type = expansionMimeType[result.headers['content-type']] ?? '';

		printFile(result.data, `doc${type}`);
	}
};
