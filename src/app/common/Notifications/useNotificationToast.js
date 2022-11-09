import React, { useCallback } from 'react';
import { toast } from 'react-toastify';
import { makeStyles } from '@material-ui/core/styles';
import { NotificationItem } from './NotificationItem';

const useStyles = makeStyles({
	toastItem: {
		padding: '12px !important',
		borderRadius: '6px !important'
	},
	toastContainer: {
		maxWidth: '100%',
		marginRight: '4px !important'
	}
});

export function useNotificationToast() {
	const classes = useStyles();

	const showNotificationToast = useCallback(
		notify => {
			toast(({ closeToast }) => <NotificationItem notify={notify} onView={closeToast} />, {
				hideProgressBar: true,
				autoClose: 10000,
				closeOnClick: false,
				className: classes.toastItem,
				bodyClassName: classes.toastContainer
			});
		},
		[classes.toastContainer, classes.toastItem]
	);

	return [showNotificationToast];
}
