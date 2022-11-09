import { GET_NEW_NOTIFICATIONS } from './types';

const initialState = {
	newNotifications: [],
	isNewNotificationsPending: false
};

export default function (state = initialState, { type, payload }) {
	switch (type) {
		case GET_NEW_NOTIFICATIONS.PENDING:
			return {
				...state,
				isNewNotificationsPending: true
			};
		case GET_NEW_NOTIFICATIONS.SUCCESS:
			return {
				...state,
				newNotifications: payload,
				isNewNotificationsPending: false
			};
		case GET_NEW_NOTIFICATIONS.ERROR:
			return {
				...state,
				isNewNotificationsPending: false
			};
		case GET_NEW_NOTIFICATIONS.RESET:
			return {
				...state,
				newNotifications: initialState.newNotifications
			};
		case GET_NEW_NOTIFICATIONS.MODIFY:
			return {
				...state,
				newNotifications: payload
			};
		default: {
			return state;
		}
	}
}
