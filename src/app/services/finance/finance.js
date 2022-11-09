import { httpClient } from '../clients/httpClient';
import {
	FINANCE_STATE_TYPE_COMING,
	FINANCE_STATE_TYPE_MOVING,
	FINANCE_STATE_TYPE_SPENDING,
	COUNTERPARTY_TYPE_DOCTOR,
	COUNTERPARTY_TYPE_PARTNER,
	COUNTERPARTY_TYPE_PATIENT,
	COUNTERPARTY_TYPE_MONEY_ACCOUNT,
	CASHIER_SHIFT_STATUS_OPEN,
	CASHIER_SHIFT_STATUS_CONTROL,
	CASHIER_SHIFT_STATUS_REWORK,
	CASHIER_SHIFT_STATUS_CLOSED,
	PROMOTION_TYPE_DISCOUNT,
	PROMOTION_TYPE_CASHBACK,
	PROMOTION_STATUS_ACTIVE,
	PROMOTION_STATUS_COMPLETED
} from './constants';
import { expansionMimeType, printFile } from '../../utils';

export const financeService = {
	getFinanceActions(params) {
		return httpClient.get('/finance/actions/', { params });
	},

	getFinanceActionByUuid(uuid) {
		return httpClient.get(`/finance/actions/${uuid}/`);
	},

	createFinanceActions(data) {
		return httpClient.post('/finance/actions/', data);
	},

	getFinanceStates(params) {
		return httpClient.get('/finance/states/', { params });
	},

	getFinanceStateByUuid(uuid) {
		return httpClient.get(`/finance/states/${uuid}/`);
	},

	createFinanceState(data) {
		return httpClient.post('/finance/states/', data);
	},

	getFinanceStateTypeList() {
		return [
			{ type: FINANCE_STATE_TYPE_COMING, name: 'Приход' },
			{ type: FINANCE_STATE_TYPE_SPENDING, name: 'Расход' },
			{ type: FINANCE_STATE_TYPE_MOVING, name: 'Перемещение' }
		];
	},

	getFinanceStateTypeNameByType(type) {
		return this.getFinanceStateTypeList().find(item => item.type === type)?.name ?? '';
	},

	updateFinanceState(uuid, data) {
		return httpClient.put(`/finance/states/${uuid}/`, data);
	},

	removeFinanceState(uuid) {
		return httpClient.delete(`/finance/states/${uuid}/`);
	},

	getCounterpartyTypeList() {
		return [
			{ type: COUNTERPARTY_TYPE_DOCTOR, name: 'Врач' },
			{ type: COUNTERPARTY_TYPE_PARTNER, name: 'Партнёр' },
			{ type: COUNTERPARTY_TYPE_PATIENT, name: 'Пациент' },
			{ type: COUNTERPARTY_TYPE_MONEY_ACCOUNT, name: 'Счёт' }
		];
	},

	getCounterpartyTypeNameByType(type) {
		return this.getCounterpartyTypeList().find(item => item.type === type)?.name ?? '';
	},

	getPromotions(params) {
		return httpClient.get('/finance/promotions/', { params }).then(({ data }) => data);
	},

	getPromotion(uuid) {
		return httpClient.get(`/finance/promotions/${uuid}/`).then(({ data }) => data);
	},

	createPromotion(payload) {
		return httpClient.post(`/finance/promotions/`, payload);
	},

	updatePromotion(uuid, payload) {
		return httpClient.put(`/finance/promotions/${uuid}/`, payload);
	},

	deletePromotion(uuid) {
		return httpClient.delete(`/finance/promotions/${uuid}/`);
	},

	activatePromotion(uuid) {
		return httpClient.put(`/finance/promotions/${uuid}/activate/`);
	},

	completePromotion(uuid) {
		return httpClient.put(`/finance/promotions/${uuid}/complete/`);
	},

	getPromotionTypeList() {
		return [
			{ type: PROMOTION_TYPE_DISCOUNT, name: 'Скидка' },
			{ type: PROMOTION_TYPE_CASHBACK, name: 'Кэшбэк' }
		];
	},

	getPromotionTypeNameByType(type) {
		return this.getPromotionTypeList().find(item => item.type === type)?.name ?? '';
	},

	getPromotionStatusList() {
		return [
			{ type: PROMOTION_STATUS_ACTIVE, name: 'Активна' },
			{ type: PROMOTION_STATUS_COMPLETED, name: 'Завершена' }
		];
	},

	getPromotionStatusNameByType(type) {
		return this.getPromotionStatusList().find(item => item.type === type)?.name ?? '';
	},

	getFinanceActionsStatistics(params) {
		return httpClient.get('/finance/actions/statistics/', { params });
	},

	getFinanceActionsReportDayStatistics(params) {
		return httpClient.get('/finance/actions/report_day_statistics/', { params });
	},

	getFinanceActionsReportDay(params) {
		return httpClient.get('/finance/actions/report_day/', { params });
	},

	getFinanceActionsPending(params) {
		return httpClient.get('/finance/actions/pending/', { params });
	},

	getFinanceActionPendingByUuid(uuid) {
		return httpClient.get(`/finance/actions/pending/${uuid}/`);
	},

	payFinanceActionPending(uuid, data) {
		return httpClient.post(`/finance/actions/pending/${uuid}/pay/`, data);
	},

	getFinanceActionCheck(uuid) {
		return httpClient.get(`/finance/actions/${uuid}/check/`, { responseType: 'blob' });
	},

	startCashierShift(data) {
		return httpClient.post('/finance/cashier_shifts/', data);
	},

	/**
	 * Returns cashier shift by date
	 * @param {string} date in format YYYY-MM-DD
	 */
	getCashierShift(date) {
		return httpClient.get(`/finance/cashier_shifts/${date}/`).then(({ data }) => data);
	},

	getCashierShifts(params) {
		return httpClient.get('/finance/cashier_shifts/', { params }).then(({ data }) => data);
	},

	/**
	 * Returns cashier shift statistics by date
	 * @param {string} date in format YYYY-MM-DD
	 */
	getCashierShiftStatistics(date) {
		return httpClient.get(`/finance/cashier_shifts/${date}/statistics/`).then(({ data }) => data);
	},

	/**
	 * Returns paginated list of finance actions for cashier shift
	 * @param {string} date in format YYYY-MM-DD
	 * @param {object} params
	 * @param {('PARTNER'|'INCOMING'|'OUTGOING')} params.type
	 */
	getCashierShiftFinanceActions(date, params) {
		return httpClient.get(`/finance/cashier_shifts/${date}/finance/actions/`, { params }).then(({ data }) => data);
	},

	/**
	 * Retrieves status of cashier shift for provided date, or null if cashier shift is not exists
	 * @param {string} date in format YYYY-MM-DD
	 */
	getCashierShiftStatus(date) {
		return httpClient.get(`/finance/cashier_shifts/${date}/status/`).then(({ data }) => data);
	},

	addCashierShiftComment(date, data) {
		return httpClient.post(`/finance/cashier_shifts/${date}/comment/`, data);
	},

	closeCashierShift(date, data) {
		return httpClient.post(`/finance/cashier_shifts/${date}/close/`, data);
	},

	reworkCashierShift(date, data) {
		return httpClient.post(`/finance/cashier_shifts/${date}/rework/`, data);
	},

	controlCashierShift(date) {
		return httpClient.post(`/finance/cashier_shifts/${date}/control/`);
	},

	getCashierShiftStatusList() {
		return [
			{ type: CASHIER_SHIFT_STATUS_OPEN, name: 'Открыта' },
			{ type: CASHIER_SHIFT_STATUS_CONTROL, name: 'На контроле' },
			{ type: CASHIER_SHIFT_STATUS_REWORK, name: 'На доработке' },
			{ type: CASHIER_SHIFT_STATUS_CLOSED, name: 'Закрыта' }
		];
	},

	getCashierShiftStatusNameByStatus(status) {
		return this.getCashierShiftStatusList().find(item => item.type === status)?.name ?? '';
	},

	async printFinanceActionCheck(uuid) {
		const result = await this.getFinanceActionCheck(uuid);
		const type = expansionMimeType[result.headers['content-type']] ?? '';

		printFile(result.data, `doc${type}`);
	}
};
