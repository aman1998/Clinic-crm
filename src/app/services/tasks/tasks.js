import { httpClient } from '../clients/httpClient';
import { TASK_STATUS_PLAN, TASK_STATUS_DONE, TASK_END_FAILURE } from './constants';

export const tasksService = {
	getTasks(params) {
		return httpClient.get('/tasks/', { params }).then(({ data }) => data);
	},

	getTask(uuid) {
		return httpClient.get(`/tasks/${uuid}/`).then(({ data }) => data);
	},

	createTask(data) {
		return httpClient.post('/tasks/', data).then(response => response.data);
	},

	updateTask(uuid, data) {
		return httpClient.put(`/tasks/${uuid}/`, data).then(response => response.data);
	},

	patchTask(uuid, data) {
		return httpClient.patch(`/tasks/${uuid}/`, data).then(response => response.data);
	},

	addTaskComment(uuid, comment) {
		return httpClient.post(`/tasks/${uuid}/comment/`, comment);
	},

	createAttachments(uuid, files) {
		const formData = new FormData();

		files.forEach(file => formData.append('files', file));

		return httpClient.post(`/tasks/${uuid}/attachment/`, formData).then(({ data }) => data);
	},

	deleteAttachments(uuid, listUuidFiles) {
		const data = listUuidFiles.map(item => ({ uuid: item }));

		return httpClient.delete(`/tasks/${uuid}/attachments/delete/`, { data }).then(response => response.data);
	},

	completeTask(uuid) {
		return httpClient.post(`/tasks/${uuid}/done/`);
	},

	getTaskStatuses() {
		return [
			{ type: TASK_STATUS_PLAN, name: 'В работе' },
			{ type: TASK_STATUS_DONE, name: 'Завершена' },
			{ type: TASK_END_FAILURE, name: 'Просрочена' }
		];
	},

	getTaskStatus(type) {
		return this.getTaskStatuses().find(item => item.type === type);
	}
};
