import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNotificationToast } from './useNotificationToast';
import { notificationsService } from '../../services';
import * as globalNotificationsActions from '../../store/notifications/actions';

export function SubscribeNotifications() {
	const dispatch = useDispatch();
	const role = useSelector(({ auth }) => auth.user.role);
	const [showNotificationToast] = useNotificationToast();

	const handleOnSubscribeNotification = useCallback(
		notify => {
			dispatch(globalNotificationsActions.addModifyNewNotifications(notify));

			showNotificationToast(notify);
		},
		[dispatch, showNotificationToast]
	);

	useEffect(() => {
		let unsubscribe;

		if (role.length > 0) {
			dispatch(globalNotificationsActions.getNewNotifications());
			unsubscribe = notificationsService.subscribeNotifications(handleOnSubscribeNotification);
		} else {
			dispatch(globalNotificationsActions.resetNewNotifications());
		}

		return () => {
			if (typeof unsubscribe !== 'function') {
				return;
			}
			unsubscribe();
		};
	}, [dispatch, role.length, handleOnSubscribeNotification]);

	return null;
}
