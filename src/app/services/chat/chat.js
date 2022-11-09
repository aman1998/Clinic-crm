import { httpClient } from '../clients/httpClient';
import { webSocketClient } from '../clients/websocketClient';
import { jsonToFormData } from '../../utils';

export const chatService = {
	getConversations(params) {
		return httpClient.get('/chat/conversations/', { params }).then(({ data }) => data);
	},

	getConversation(uuid, params) {
		return httpClient.get(`/chat/conversations/${uuid}/`, { params }).then(({ data }) => data);
	},

	getMessages(params) {
		return httpClient.get('/chat/messages/', { params }).then(({ data }) => data);
	},

	sendMessage(data) {
		return httpClient.post('/chat/messages/', jsonToFormData(data)).then(response => response.data);
	},

	subscribeChat(fn) {
		return webSocketClient('/chat/').subscribe(fn);
	},

	readMessages(uuid) {
		return httpClient.get(`/chat/conversations/${uuid}/read_messages/`).then(({ data }) => data);
	}
};
