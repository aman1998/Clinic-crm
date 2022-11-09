import { httpClient } from '../clients/httpClient';
import { webSocketClient } from '../clients/websocketClient';
import {
	CALL_TYPE_IN,
	CALL_TYPE_OUT,
	CALL_STATUS_SUCCESS,
	CALL_STATUS_BUSY,
	CALL_STATUS_NOT_AVAILABLE,
	CALL_STATUS_NOT_ALLOWED,
	CALL_STATUS_MISSED,
	CALL_STATUS_ERROR
} from './constants';

export const telephonyService = {
	callVariants: [
		{ type: { type: CALL_TYPE_IN, status: [CALL_STATUS_SUCCESS] }, name: 'Входящие принятые' },
		{ type: { type: CALL_TYPE_IN, status: [CALL_STATUS_MISSED] }, name: 'Входящие пропущенные' },
		{ type: { type: CALL_TYPE_OUT, status: [CALL_STATUS_SUCCESS] }, name: 'Исходящие принятые' },
		{
			type: {
				type: CALL_TYPE_OUT,
				status: [
					CALL_STATUS_MISSED,
					CALL_STATUS_BUSY,
					CALL_STATUS_NOT_AVAILABLE,
					CALL_STATUS_NOT_ALLOWED,
					CALL_STATUS_ERROR
				]
			},
			name: 'Исходящие пропущенные'
		}
	],

	/**
	 * Returns call variant by type and status or undefined if nothing found
	 * @param {string} type
	 * @param {string} status
	 */
	getCallVariant(type, status) {
		return this.callVariants.find(item => item.type.type === type && item.type.status.includes(status));
	},

	/**
	 * Returns list of calls
	 * @param {object} [params]
	 * @param {number} [params.offset]
	 * @param {number} [params.limit]
	 * @param {object} [params.variant]
	 * @param {string} params.variant.type (overrides params.type)
	 * @param {string[]} params.variant.status (overrides params.status)
	 * @param {string} [params.patient_uuid]
	 * @param {('SUCCESS'|'MISSED'|'BUSY'|'NOT_AVAILABLE'|'NOT_ALLOWED'|'ERROR')} [params.status]
	 * @param {('IN'|'OUT')} [params.type]
	 * @param {string} [params.patient] name of patient
	 * @param {string} [params.time_from]
	 * @param {string} [params.time_to]
	 * @param {string} [params.date]
	 */
	getCalls(params) {
		const query = { ...params, type: params?.variant?.type, status: params?.variant?.status };

		delete query.variant;

		return httpClient.get('/telephony/calls/', { params: query }).then(({ data }) => data);
	},

	getCallByUuid(uuid) {
		return httpClient.get(`/telephony/calls/${uuid}/`).then(({ data }) => data);
	},

	makeCall(data) {
		return httpClient.post(`/telephony/calls/make/`, data);
	},

	subscribeCall(fn) {
		return webSocketClient('/calls/').subscribe(fn);
	}
};
