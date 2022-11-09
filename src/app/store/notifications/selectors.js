export const newNotifications = ({ notifications }) => notifications.newNotifications;
export const isNewNotificationsPending = ({ notifications }) => notifications.isNewNotificationsPending;
export const countNewNotifications = ({ notifications }) =>
	notifications.newNotifications.filter(item => !item.seen).length;
export const seenNewNotifications = ({ notifications }) => notifications.newNotifications.filter(item => item.seen);
export const notSeenNewNotifications = ({ notifications }) => notifications.newNotifications.filter(item => !item.seen);
