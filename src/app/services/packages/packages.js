import { httpClient } from '../clients/httpClient';
import { PACKAGE_TYPE_PACK, PACKAGE_TYPE_PIECE } from './constants';

export const packagesService = {
	getPackages(params) {
		return httpClient.get('/packages/', { params }).then(({ data }) => data);
	},

	createPackage(data) {
		return httpClient.post(`/packages/`, data).then(res => res.data);
	},

	getPackage(uuid) {
		return httpClient.get(`/packages/${uuid}/`).then(({ data }) => data);
	},

	updatePackage(uuid, data) {
		return httpClient.put(`/packages/${uuid}/`, data).then(res => res.data);
	},

	deletePackage(uuid) {
		return httpClient.delete(`/packages/${uuid}/`).then(res => res.data);
	},

	getPackageTypes() {
		return [
			{ type: PACKAGE_TYPE_PIECE, name: 'ед. изм.' },
			{ type: PACKAGE_TYPE_PACK, name: 'ед. фасовки' }
		];
	},

	getPackageTypeByType(type) {
		return this.getPackageTypes().find(item => item.type === type);
	}
};
