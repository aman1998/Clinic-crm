import { httpClient } from '../clients/httpClient';
import { webSocketClient } from '../clients/websocketClient';

export const notificationsService = {
	getAllNotifications(params) {
		return httpClient.get('/notifications/all/', { params });
	},

	getNewNotifications(params) {
		return httpClient.get('/notifications/new/', { params });
	},

	subscribeNotifications(fn) {
		return webSocketClient('/notifications/').subscribe(fn);
	},

	viewNotification(uuid) {
		return httpClient.get(`/notifications/${uuid}/seen/`);
	}
};
