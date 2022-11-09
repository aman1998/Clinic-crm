import { GET_NEW_NOTIFICATIONS } from './types';
import { notificationsService } from '../../services';
import { newNotifications } from './selectors';

export const getNewNotifications = () => dispatch => {
	dispatch({ type: GET_NEW_NOTIFICATIONS.PENDING });

	return notificationsService
		.getNewNotifications()
		.then(({ data }) => {
			dispatch({
				type: GET_NEW_NOTIFICATIONS.SUCCESS,
				payload: data
			});
		})
		.catch(() => {
			dispatch({
				type: GET_NEW_NOTIFICATIONS.ERROR
			});
		});
};

export const addModifyNewNotifications = notify => (dispatch, getState) =>
	dispatch({
		type: GET_NEW_NOTIFICATIONS.MODIFY,
		payload: [notify, ...newNotifications(getState())]
	});

export const replaceModifyNewNotifications = notify => (dispatch, getState) => {
	const currentNotifications = newNotifications(getState());
	const modifyNotifications = currentNotifications.map(item => {
		if (item.uuid === notify.uuid) {
			return notify;
		}
		return item;
	});

	return dispatch({
		type: GET_NEW_NOTIFICATIONS.MODIFY,
		payload: modifyNotifications
	});
};

export const viewNewNotifications = uuid => dispatch => {
	return notificationsService
		.viewNotification(uuid)
		.then(({ data }) => {
			dispatch(replaceModifyNewNotifications(data));
		})
		.catch(() => {});
};

export const resetNewNotifications = () => ({
	type: GET_NEW_NOTIFICATIONS.RESET
});
