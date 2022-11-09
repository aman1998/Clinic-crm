import { httpClient } from '../clients/httpClient';

export const authService = {
	loginIn(data) {
		return httpClient.post('/users/token/', data);
	},

	checkToken(token) {
		return httpClient.post('/users/token/verify/', token);
	},

	getUserData() {
		return httpClient.get('/users/me/');
	},

	getMyPermissions() {
		return httpClient.get('/users/my_permissions/');
	},

	/**
	 * Returns list of users
	 * @param {object} params
	 * @param {string[]} params.groups
	 * @param {number|string} params.group_id
	 * @param {number|string} params.search
	 * @param {number} params.limit
	 * @param {number} params.offset
	 */
	getUsers(params) {
		return httpClient.get('/users/', { params }).then(({ data }) => data);
	},

	getUser(uuid) {
		return httpClient.get(`/users/${uuid}/`);
	},

	createUser(data) {
		return httpClient.post('/users/web/', data);
	},

	updateUser(uuid, data) {
		return httpClient.put(`/users/web/${uuid}/`, data);
	},

	removeUser(uuid) {
		return httpClient.delete(`/users/${uuid}/`);
	},

	updateUserPassword(uuid, password) {
		return httpClient.post(`/users/${uuid}/change_password/`, { password });
	},

	getPermissions() {
		return httpClient.get('/users/permissions/').then(({ data }) => data);
	},

	getGroups() {
		return httpClient.get('/users/groups/').then(({ data }) => data);
	},

	getGroup(id) {
		return httpClient.get(`/users/groups/${id}/`).then(({ data }) => data);
	},

	createGroup(data) {
		return httpClient.post(`/users/groups/`, data).then(response => response.data);
	},

	updateGroup(id, data) {
		return httpClient.put(`/users/groups/${id}/`, data).then(response => response.data);
	},

	removeGroup(id) {
		return httpClient.delete(`/users/groups/${id}/`).then(({ data }) => data);
	}
};
