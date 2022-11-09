import { httpClient } from '../clients/httpClient';

export const currenciesService = {
	getCurrencies(params) {
		return httpClient.get('/currencies/', { params }).then(({ data }) => data);
	}
};
