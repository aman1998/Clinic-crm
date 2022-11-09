import { httpClient } from '../clients/httpClient';
import { GENDER_FEMALE, GENDER_MALE } from './constants';

export const patientsService = {
	getPatients(params) {
		return httpClient.get('/patients/', { params });
	},

	createPatient(data) {
		return httpClient.post('/patients/', data);
	},

	getPatientByUuid(uuid) {
		return httpClient.get(`/patients/${uuid}/`);
	},

	updatePatientByUuid(uuid, data) {
		return httpClient.put(`/patients/${uuid}/`, data);
	},

	getGenderList() {
		return [
			{
				type: GENDER_FEMALE,
				name: 'Женский'
			},
			{
				type: GENDER_MALE,
				name: 'Мужской'
			}
		];
	},

	getGenderByType(type) {
		return this.getGenderList().find(item => item.type === type) ?? null;
	},

	/**
	 * return your own main phone or main phone from responsible
	 * @param {object} patient
	 * @param {string|null} patient.main_phone
	 * @param {object=} patient.responsible
	 * @param {string} patient.responsible.main_phone
	 * @return {string}
	 */
	getPatientMainPhone(patient) {
		if (patient?.main_phone) {
			return patient.main_phone;
		}

		return patient?.responsible?.main_phone ?? '';
	},

	/**
	 * Return full patient address as string
	 * @param {string=} apartment
	 * @param {string=} building
	 * @param {string=} district
	 * @param {string=} house
	 * @param {string=} locality
	 * @param {string=} region
	 * @param {string=} street
	 * @return {string}
	 */
	getPatientAddress({ apartment, building, district, house, locality, region, street }) {
		return [region, locality, district, street, house, apartment, building].filter(item => !!item).join(', ');
	},

	getPatientBonusHistory(uuid, params) {
		return httpClient.get(`/patients/${uuid}/balance_history/`, { params }).then(response => response.data);
	}
};
