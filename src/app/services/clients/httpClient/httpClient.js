import { axios } from './axios';

const getBaseUrl = url => `/api/v1${url}`;

export const httpClient = {
	setToken(token) {
		axios.defaults.headers.common.Authorization = `Bearer ${token}`;
	},

	get(url, data) {
		return axios.get(getBaseUrl(url), data);
	},

	post(url, data) {
		return axios.post(getBaseUrl(url), data);
	},

	put(url, data) {
		return axios.put(getBaseUrl(url), data);
	},

	patch(url, data) {
		return axios.patch(getBaseUrl(url), data);
	},

	delete(url, data) {
		return axios.delete(getBaseUrl(url), data);
	}
};
