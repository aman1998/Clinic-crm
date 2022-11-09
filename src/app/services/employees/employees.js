import { httpClient } from '../clients/httpClient';
import {
	DOCTOR_WORK_SHIFT_STATUS_OPEN,
	DOCTOR_WORK_SHIFT_STATUS_WAREHOUSE_CONTROL,
	DOCTOR_WORK_SHIFT_STATUS_WAREHOUSE_ACCEPTED,
	DOCTOR_WORK_SHIFT_STATUS_WAREHOUSE_REWORK,
	DOCTOR_WORK_SHIFT_STATUS_RESPONSIBLE_CONTROL,
	DOCTOR_WORK_SHIFT_STATUS_RESPONSIBLE_REWORK,
	DOCTOR_WORK_SHIFT_STATUS_CLOSED
} from './constants';

export const employeesService = {
	getDoctors(params) {
		return httpClient.get('/employees/doctors/', { params });
	},

	getDoctor(uuid) {
		return httpClient.get(`/employees/doctors/${uuid}/`);
	},

	getDoctorsSchedule(params) {
		return httpClient.get('/employees/doctors/schedule/', { params });
	},

	getDoctorReceptions(uuid, params) {
		return httpClient.get(`/employees/doctors/${uuid}/receptions/`, { params });
	},

	changeDoctorWorkingDays(uuid, data) {
		return httpClient.patch(`/employees/doctors/${uuid}/`, data);
	},

	createDoctor(data) {
		return httpClient.post('/employees/doctors/', data);
	},

	updateDoctor(uuid, data) {
		return httpClient.put(`/employees/doctors/${uuid}/`, data);
	},

	deleteDoctor(uuid) {
		return httpClient.delete(`/employees/doctors/${uuid}/`);
	},

	getHolidays(params) {
		return httpClient.get('/employees/holidays/', { params }).then(({ data }) => data);
	},

	createHoliday(data) {
		return httpClient.post('/employees/holidays/', data);
	},

	deleteHoliday(uuid) {
		return httpClient.delete(`/employees/holidays/${uuid}/`);
	},

	getJuridicalPersons(params) {
		return httpClient.get('/employees/juridical_persons/', { params }).then(({ data }) => data);
	},

	getJuridicalPerson(uuid) {
		return httpClient.get(`/employees/juridical_persons/${uuid}/`).then(({ data }) => data);
	},

	createJuridicalPerson(data) {
		return httpClient.post('/employees/juridical_persons/', data);
	},

	updateJuridicalPerson(uuid, data) {
		return httpClient.put(`/employees/juridical_persons/${uuid}/`, data);
	},

	deleteJuridicalPerson(uuid) {
		return httpClient.delete(`/employees/juridical_persons/${uuid}/`);
	},

	getDoctorWorkShifts(params) {
		return httpClient.get('/employees/doctor_work_shifts/', { params }).then(({ data }) => data);
	},

	getDoctorWorkShift(uuid) {
		return httpClient.get(`/employees/doctor_work_shifts/${uuid}/`).then(({ data }) => data);
	},

	patchDoctorWorkShift(uuid, data) {
		return httpClient.patch(`/employees/doctor_work_shifts/${uuid}/`, data);
	},

	addDoctorWorkShiftComment(uuid, data) {
		return httpClient.post(`/employees/doctor_work_shifts/${uuid}/comment/`, data);
	},

	getDoctorWorkShiftReceptions(uuid, params) {
		return httpClient.get(`/employees/doctor_work_shifts/${uuid}/receptions/`, { params }).then(({ data }) => data);
	},

	controlWarehouseDoctorWorkShift(uuid) {
		return httpClient.put(`/employees/doctor_work_shifts/${uuid}/warehouse_control/`);
	},

	acceptWarehouseDoctorWorkShift(uuid) {
		return httpClient.put(`/employees/doctor_work_shifts/${uuid}/warehouse_accepted/`);
	},

	reworkWarehouseDoctorWorkShift(uuid, data) {
		return httpClient.put(`/employees/doctor_work_shifts/${uuid}/warehouse_rework/`, data);
	},

	controlResponsibleDoctorWorkShift(uuid) {
		return httpClient.put(`/employees/doctor_work_shifts/${uuid}/responsible_control/`);
	},

	reworkResponsibleDoctorWorkShift(uuid, data) {
		return httpClient.put(`/employees/doctor_work_shifts/${uuid}/responsible_rework/`, data);
	},

	closeDoctorWorkShift(uuid, data) {
		return httpClient.post(`/employees/doctor_work_shifts/${uuid}/close/`, data);
	},

	getDoctorWorkShiftStatuses() {
		return [
			{ type: DOCTOR_WORK_SHIFT_STATUS_OPEN, name: 'Открыто' },
			{ type: DOCTOR_WORK_SHIFT_STATUS_WAREHOUSE_CONTROL, name: 'Контроль склада' },
			{ type: DOCTOR_WORK_SHIFT_STATUS_WAREHOUSE_ACCEPTED, name: 'Подтверждено на складе' },
			{ type: DOCTOR_WORK_SHIFT_STATUS_WAREHOUSE_REWORK, name: 'Доработка склада' },
			{ type: DOCTOR_WORK_SHIFT_STATUS_RESPONSIBLE_CONTROL, name: 'Контроль' },
			{ type: DOCTOR_WORK_SHIFT_STATUS_RESPONSIBLE_REWORK, name: 'Доработка' },
			{ type: DOCTOR_WORK_SHIFT_STATUS_CLOSED, name: 'Завершено' }
		];
	},

	getDoctorWorkShiftStatusByType(type) {
		return this.getDoctorWorkShiftStatuses().find(item => item.type === type);
	},

	getDoctorHolidays(params) {
		return httpClient.get('/employees/doctor_holidays/', { params }).then(({ data }) => data);
	},

	deleteDoctorHoliday(uuid) {
		return httpClient.delete(`/employees/doctor_holidays/${uuid}/`);
	},

	createDoctorHoliday(data) {
		return httpClient.post('/employees/doctor_holidays/', data);
	},

	getSalaryPending(params) {
		return httpClient.get('/employees/salary/pending/', { params }).then(({ data }) => data);
	},

	getSalaryHistoryList(params) {
		return httpClient.get('/employees/salary/history/', { params }).then(({ data }) => data);
	},

	getSalaryHistory(uuid) {
		return httpClient.get(`/employees/salary/history/${uuid}/`).then(({ data }) => data);
	},

	payCounterpartySalary(data) {
		return httpClient.post('/employees/salary/pay/', data);
	},

	getCounterpartySalary(type, uuid, params) {
		return httpClient.get(`/employees/salary/${type}/${uuid}/`, { params }).then(({ data }) => data);
	},

	getCounterpartySalaryReceptions(params) {
		return httpClient.get(`/employees/salary/receptions/`, { params }).then(({ data }) => data);
	},

	getPersonalList(params) {
		return httpClient.get('/employees/personals/', { params }).then(({ data }) => data);
	},

	getPersonal(uuid) {
		return httpClient.get(`/employees/personals/${uuid}/`).then(({ data }) => data);
	}
};
