import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import * as messageActions from '../../store/fuse/actions/fuse/message.actions';

export function useAlert() {
	const dispatch = useDispatch();

	const alertSuccess = useCallback(
		/**
		 * Shows success message
		 * @param {string} message
		 */
		message => {
			dispatch(messageActions.showMessage({ message, variant: 'success' }));
		},
		[dispatch]
	);
	const alertError = useCallback(
		/**
		 * Shows error message
		 * @param {string} message
		 */
		message => {
			dispatch(messageActions.showMessage({ message, variant: 'error' }));
		},
		[dispatch]
	);

	return { alertSuccess, alertError };
}
