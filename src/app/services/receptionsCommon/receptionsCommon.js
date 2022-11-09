import { httpClient } from '../clients/httpClient';
import { expansionMimeType, getShortName, printFile } from '../../utils';
import { BASE_TYPE_RECEPTION, BASE_TYPE_LABORATORY_RECEPTION, BASE_TYPE_STATIONARY_RECEPTION } from './constants';

export const receptionsCommonService = {
	getReceptions(params) {
		return httpClient.get(`/receptions_common/receptions/`, { params });
	},

	getReceptionByUuid(uuid) {
		return httpClient.get(`/receptions_common/receptions/${uuid}/`);
	},

	printReception(uuid) {
		return httpClient.get(`/clinic/receptions/${uuid}/print_anamnes/`, { responseType: 'blob' });
	},

	/**
	 * return service name by base type
	 * @param baseType {string}
	 * @param serviceName {string}
	 * @param doctor {object}
	 * @return {string}
	 */
	getReceptionName({ baseType, serviceName, doctor }) {
		const name = doctor ? `${serviceName} (${getShortName(doctor)})` : serviceName;

		return {
			[BASE_TYPE_RECEPTION]: name,
			[BASE_TYPE_STATIONARY_RECEPTION]: 'Прием стационара',
			[BASE_TYPE_LABORATORY_RECEPTION]: 'Прием лаборатории',
			[undefined]: ''
		}[baseType];
	},

	async printReceptionActionCheck(uuid) {
		const result = await this.printReception(uuid);
		const type = expansionMimeType[result.headers['content-type']] ?? '';

		printFile(result.data, `doc${type}`);
	}
};
