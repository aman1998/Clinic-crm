import moment from 'moment';
import { expansionMimeType, saveFile } from 'app/utils';
import { httpClient } from '../clients/httpClient';
import {
	STATUS_RECEPTION_CONFIRMED,
	STATUS_RECEPTION_PAID,
	STATUS_RECEPTION_CASH,
	STATUS_RECEPTION_FAILED,
	STATUS_RECEPTION_NOT_PAID,
	STATUS_RECEPTION_APPOINTED,
	RESERVE_PRIORITY_LOW,
	RESERVE_PRIORITY_MEDIUM,
	RESERVE_PRIORITY_HIGH,
	TYPE_SERVICE_LABORATORY,
	TYPE_SERVICE_COMMON,
	TYPE_SERVICE_HOSPITAL,
	TYPE_SERVICE_OPERATION,
	SERVICE_CALCULATION_TYPE_FULL_COST,
	SERVICE_CALCULATION_TYPE_WITH_EXPENSES,
	SERVICE_PAYOUT_COUNTERPARTY_TYPE_DOCTOR,
	SERVICE_PAYOUT_COUNTERPARTY_TYPE_PARTNER,
	SERVICE_PAYOUT_COUNTERPARTY_TYPE_PERSONAL,
	SERVICE_PAYOUT_STOCKTAKING_ALWAYS,
	SERVICE_PAYOUT_STOCKTAKING_CHOOSE
} from './constants';

export const clinicService = {
	getDirections(params) {
		return httpClient.get('/clinic/directions/', { params }).then(({ data }) => data);
	},

	getDirectionById(uuid) {
		return httpClient
			.get(`/clinic/directions/${uuid}/`)
			.then(({ data }) => data)
			.catch(err => err);
	},

	removeDirectionById(uuid) {
		return httpClient.delete(`/clinic/directions/${uuid}/`);
	},

	getReceptionById(uuid) {
		return httpClient.get(`/clinic/receptions/${uuid}/`);
	},

	createReception(data) {
		return httpClient.post('/clinic/receptions/', data);
	},

	changeReception(uuid, data) {
		return httpClient.put(`/clinic/receptions/${uuid}/`, data);
	},

	getServices(params) {
		return httpClient.get('/clinic/services/', { params });
	},

	getServicesNested(params) {
		return httpClient.get('/clinic/services/nested/', { params }).then(({ data }) => data);
	},

	getServiceById(uuid) {
		return httpClient.get(`/clinic/services/${uuid}/`).then(({ data }) => data);
	},

	removeServiceById(uuid) {
		return httpClient.delete(`/clinic/services/${uuid}`);
	},

	getClinicServicesDocument(uuid) {
		return httpClient.get(`/clinic/services/${uuid}/documents`).then(({ data }) => data);
	},

	async exportClinicDocument(receptionUuid, documentUuid) {
		const result = await httpClient.get(`/clinic/reception/${receptionUuid}/document/${documentUuid}`, {
			responseType: 'blob'
		});
		const type = expansionMimeType[result.headers['content-type']] ?? '';

		saveFile(result.data, `report${type}`);
	},

	checkoutReception(uuid) {
		return httpClient.post(`/clinic/receptions/${uuid}/checkout/`);
	},

	cancelReception(uuid) {
		return httpClient.post(`/clinic/receptions/${uuid}/cancel/`);
	},

	confirmReception(uuid) {
		return httpClient.post(`/clinic/receptions/${uuid}/confirm/`);
	},

	getReceptions(params) {
		const modifyParams = {
			...params,
			time_to: params.time_to && moment(params.time_to).format('HH:mm:ss'),
			time_from: params.time_from && moment(params.time_from).format('HH:mm:ss')
		};
		return httpClient.get('/clinic/receptions/', { params: modifyParams }).then(({ data }) => data);
	},

	getReceptionSupplement(uuid) {
		return httpClient.get(`/clinic/receptions/${uuid}/supplement/`);
	},

	updateReceptionSupplement(uuid, data) {
		return httpClient.put(`/clinic/receptions/${uuid}/supplement/`, data);
	},

	updateReceptionsMedicineByUuid(uuid, data) {
		return httpClient.put(`/clinic/receptions/${uuid}/medications-update/`, data);
	},

	updateOperationsMedicineByUuid(uuid, data) {
		return httpClient.put(`/operation/operations/${uuid}/medications-update/`, data);
	},

	getReceptionsCostPrice(params) {
		return httpClient.get('/clinic/receptions/cost_price/', { params }).then(({ data }) => data);
	},

	getReceptionCostPrice(uuid) {
		return httpClient.get(`/clinic/receptions/${uuid}/cost_price/`).then(({ data }) => data);
	},

	getReceptionPayouts(uuid, params) {
		return httpClient.get(`/clinic/receptions/${uuid}/payouts/`, { params }).then(({ data }) => data);
	},

	getReceptionsStatus() {
		return [
			{ type: STATUS_RECEPTION_APPOINTED, name: 'Прием назначен' },
			{ type: STATUS_RECEPTION_CONFIRMED, name: 'Прием подтверждён' },
			{ type: STATUS_RECEPTION_CASH, name: 'Отправлено на кассу' },
			{ type: STATUS_RECEPTION_PAID, name: 'Оплачено пациентом' },
			{ type: STATUS_RECEPTION_FAILED, name: 'Прием не состоялся' },
			{ type: STATUS_RECEPTION_NOT_PAID, name: 'Прием не оплатили' }
		];
	},

	getReceptionStatusByStatus(type) {
		return this.getReceptionsStatus().find(item => item.type === type);
	},

	getServiceTypes() {
		return [
			{ type: TYPE_SERVICE_COMMON, name: 'Регистратура' },
			{ type: TYPE_SERVICE_LABORATORY, name: 'Лаборатория' },
			{ type: TYPE_SERVICE_HOSPITAL, name: 'Стационар' },
			{ type: TYPE_SERVICE_OPERATION, name: 'Операция' }
		];
	},

	getCalculationTypeList() {
		return [
			{ type: SERVICE_CALCULATION_TYPE_FULL_COST, name: 'От полной стоимости' },
			{ type: SERVICE_CALCULATION_TYPE_WITH_EXPENSES, name: 'С учетом расходов' }
		];
	},

	getCalculationByType(type) {
		return this.getCalculationTypeList().find(item => item.type === type);
	},

	getStocktakingList() {
		return [
			{ type: SERVICE_PAYOUT_STOCKTAKING_ALWAYS, name: 'Обязательный учет контрагента' },
			{ type: SERVICE_PAYOUT_STOCKTAKING_CHOOSE, name: 'Учет контрагента при выборе' }
		];
	},

	getStocktakingByType(type) {
		return this.getCalculationTypeList().find(item => item.type === type);
	},

	getClinicCounterpartyTypeList() {
		return [
			{ type: SERVICE_PAYOUT_COUNTERPARTY_TYPE_DOCTOR, name: 'Доктор' },
			{ type: SERVICE_PAYOUT_COUNTERPARTY_TYPE_PARTNER, name: 'Партнёр' },
			{ type: SERVICE_PAYOUT_COUNTERPARTY_TYPE_PERSONAL, name: 'Сотрудник' }
		];
	},

	getClinicCounterpartyByType(type) {
		return this.getClinicCounterpartyTypeList().find(item => item.type === type);
	},

	getReserves(params) {
		return httpClient.get('/clinic/reserves/', { params });
	},

	createReserve(data) {
		return httpClient.post('/clinic/reserves/', data);
	},

	getReserveByUuid(uuid) {
		return httpClient.get(`/clinic/reserves/${uuid}/`);
	},

	updateReserveByUuid(uuid, data) {
		return httpClient.put(`/clinic/reserves/${uuid}/`, data);
	},

	removeReserveByUuid(uuid) {
		return httpClient.delete(`/clinic/reserves/${uuid}/`);
	},

	createClinicService(data) {
		return httpClient.post('/clinic/services/', data);
	},

	patchClinicService(uuid, data) {
		return httpClient.patch(`/clinic/services/${uuid}/`, data);
	},

	createClinicDirection(data) {
		return httpClient.post('/clinic/directions/', data);
	},

	updateClinicDirection(uuid, data) {
		return httpClient.put(`/clinic/directions/${uuid}/`, data);
	},

	getClinicReceptionStates(uuid, params) {
		return httpClient.get(`/clinic/receptions/${uuid}/states/`, { params }).then(({ data }) => data);
	},

	getClinicReceptionMedications(uuid, params) {
		return httpClient.get(`/clinic/receptions/${uuid}/medications/`, { params }).then(({ data }) => data);
	},

	getClinicReceptionMedicationsStatistics(uuid) {
		return httpClient.get(`/clinic/receptions/${uuid}/medications/statistics/`).then(({ data }) => data);
	},

	getClinicReceptionsStatistics(params) {
		return httpClient.get('/clinic/receptions/statistics/', { params });
	},

	getClinicDirectionsStatisticsReceptionsPopular: params =>
		httpClient.get('/clinic/directions/statistics/receptions/popular/', { params }),

	getClinicServicesStatisticsReceptionsPopular: params =>
		httpClient.get('/clinic/services/statistics/receptions/popular/', { params }),

	getClinicDirectionsStatisticsReceptionsAbcAnalysis: params =>
		httpClient.get('/clinic/directions/statistics/receptions/abc_analysis/', { params }),

	getClinicServicesStatisticsReceptionsAbcAnalysis: params =>
		httpClient.get('/clinic/services/statistics/receptions/abc_analysis/', { params }),

	getClinicServicesStatisticsStationaryReceptionsPopular: params =>
		httpClient.get('/clinic/services/statistics/stationary_receptions/popular/', { params }),

	getClinicServicesStatisticsStationaryReceptionsAbcAnalysis: params =>
		httpClient.get('/clinic/services/statistics/stationary_receptions/abc_analysis/', { params }),

	getClinicServicesStatisticsLaboratoryReceptionsPopular: params =>
		httpClient.get('/clinic/services/statistics/laboratory_receptions/popular/', { params }),

	getClinicServicesStatisticsLaboratoryReceptionsAbcAnalysis: params =>
		httpClient.get('/clinic/services/statistics/laboratory_receptions/abc_analysis/', { params }),

	getClinicDirectionsStatisticsReceptionsCommonPopular: params =>
		httpClient.get('/clinic/directions/statistics/receptions_common/popular/', { params }),

	getClinicServicesStatisticsReceptionsCommonPopular: params =>
		httpClient.get('/clinic/services/statistics/receptions_common/popular/', { params }),

	getClinicServicesStatisticsReceptionsCommonAbcAnalysis: params =>
		httpClient.get('/clinic/services/statistics/receptions_common/abc_analysis/', { params }),

	getClinicDirectionsStatisticsReceptionsCommonAbcAnalysis: params =>
		httpClient.get('/clinic/directions/statistics/receptions_common/abc_analysis/', { params }),

	getPriorityReserve() {
		return [
			{ type: RESERVE_PRIORITY_LOW, name: 'Низкий' },
			{ type: RESERVE_PRIORITY_MEDIUM, name: 'Средний' },
			{ type: RESERVE_PRIORITY_HIGH, name: 'Высокий' }
		];
	},

	getPriorityNameByType(type) {
		const list = this.getPriorityReserve();
		const findItem = list.find(item => item.type === type);

		if (!findItem) {
			return '';
		}

		return findItem.name;
	},

	getContactInfo() {
		return httpClient
			.get('/clinic/informations/')
			.then(response => response.data)
			.catch(err => err);
	},

	createContactInfo(data) {
		return httpClient.post('/clinic/informations/', data).then(response => response.data);
	},

	updateContactInfo(data, uuid) {
		return httpClient.put(`/clinic/informations/${uuid}/`, data).then(response => response.data);
	},

	getClinicReceptionsStatisticsCount(params) {
		return httpClient.get('/clinic/receptions/statistics/count/', { params });
	},

	getRequisiteInfo() {
		return httpClient
			.get('/clinic/requisites/')
			.then(response => response.data)
			.catch(err => err);
	},

	createRequisiteInfo(data) {
		return httpClient.post('/clinic/requisites/', data).then(response => response.data);
	},

	updateRequisiteInfo(data, uuid) {
		return httpClient.put(`/clinic/requisites/${uuid}/`, data).then(response => response.data);
	}
};
