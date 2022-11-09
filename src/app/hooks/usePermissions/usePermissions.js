import { useCallback } from 'react';
import { useSelector } from 'react-redux';

export function usePermissions() {
	const userRole = useSelector(({ auth }) => auth.user.role);

	const hasPermission = useCallback(
		/**
		 * Returns true if user have all provided permissions
		 * @param {string[] || string} permissions
		 * @return {boolean}
		 */
		permissions => {
			return [permissions].flat().every(role => userRole.includes(role));
		},
		[userRole]
	);

	return {
		hasPermission
	};
}
