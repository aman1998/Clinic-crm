import { httpClient } from '../clients/httpClient';

export const statisticsCommonService = {
	getReceptions(params) {
		return httpClient.get('/statistics_common/receptions/', { params });
	},

	getReceptionsCount(params) {
		return httpClient.get('/statistics_common/receptions/count/', { params });
	}
};
