import { httpClient } from '../clients/httpClient';
import {
	WAYBILL_STATUS_PLAN,
	WAYBILL_STATUS_ACCEPTED,
	WAYBILL_STATUS_COMPLETED,
	WAYBILL_STATUS_CANCELED,
	WAYBILL_STATUS_REWORK,
	WAYBILL_STATUS_CONTROL,
	WAYBILL_TYPE_ACCEPTANCE,
	WAYBILL_TYPE_WRITE_OFF,
	WAYBILL_TYPE_EXPENSE,
	WAYBILL_TYPE_MOVING,
	WAYBILL_STATUS_DELETED
} from './constants';
import { expansionMimeType, saveFile } from '../../utils';

export const waybillsService = {
	getWaybills(params) {
		return httpClient.get(`/waybills/`, { params });
	},

	createWaybill(data) {
		return httpClient.post('/waybills/', data);
	},

	updateWaybill(uuid, data) {
		return httpClient.put(`/waybills/${uuid}/`, data);
	},

	deleteWaybill(uuid) {
		return httpClient.delete(`/waybills/${uuid}/`);
	},

	getWaybill(uuid) {
		return httpClient.get(`/waybills/${uuid}/`);
	},

	acceptWaybill(uuid, data) {
		return httpClient.post(`/waybills/${uuid}/accept/`, data);
	},

	closeWaybill(uuid, data) {
		return httpClient.post(`/waybills/${uuid}/close/`, data);
	},

	controlWaybill(uuid) {
		return httpClient.post(`/waybills/${uuid}/control/`);
	},

	finishWaybill(uuid, data) {
		return httpClient.post(`/waybills/${uuid}/finish/`, data);
	},

	reworkWaybill(uuid, data) {
		return httpClient.post(`/waybills/${uuid}/rework/`, data);
	},

	getWaybillsTypeList() {
		return [
			{ type: WAYBILL_TYPE_ACCEPTANCE, name: 'Приходная накладная' },
			{ type: WAYBILL_TYPE_WRITE_OFF, name: 'Накладная на списание' },
			{ type: WAYBILL_TYPE_EXPENSE, name: 'Расходная накладная' },
			{ type: WAYBILL_TYPE_MOVING, name: 'Накладная на перемещение' }
		];
	},

	getWaybillType(type) {
		return this.getWaybillsTypeList().find(item => item.type === type);
	},

	getWaybillsStatusList() {
		return [
			{ type: WAYBILL_STATUS_PLAN, name: 'В плане' },
			{ type: WAYBILL_STATUS_ACCEPTED, name: 'В работе' },
			{ type: WAYBILL_STATUS_REWORK, name: 'На доработке' },
			{ type: WAYBILL_STATUS_CONTROL, name: 'На контроле' },
			{ type: WAYBILL_STATUS_COMPLETED, name: 'Завершено' },
			{ type: WAYBILL_STATUS_CANCELED, name: 'Отменено' },
			{ type: WAYBILL_STATUS_DELETED, name: 'Удалено' }
		];
	},

	getWaybillStatus(status) {
		return this.getWaybillsStatusList().find(item => item.type === status);
	},

	getWriteOffReasons(params) {
		return httpClient.get('/waybills/writeoff_reasons/', { params });
	},

	getWriteOffReason(uuid) {
		return httpClient.get(`/waybills/writeoff_reasons/${uuid}/`).then(({ data }) => data);
	},

	createWriteOffReason(data) {
		return httpClient.post('/waybills/writeoff_reasons/', data);
	},

	getWaybillsStatistics(params) {
		return httpClient.get('/waybills/statistics/', { params });
	},

	addWaybillComment(uuid, data) {
		return httpClient.post(`/waybills/${uuid}/comment/`, data);
	},

	async downloadWaybill(uuid) {
		const result = await httpClient.get(`/waybills/${uuid}/download/`, {
			responseType: 'blob'
		});
		const type = expansionMimeType[result.headers['content-type']] ?? '';

		saveFile(result.data, `report${type}`);
	}
};
