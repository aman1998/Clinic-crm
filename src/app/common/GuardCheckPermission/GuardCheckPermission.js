import React from 'react';
import PropTypes from 'prop-types';
import { usePermissions } from '../../hooks';

export function GuardCheckPermission({ permission, fallback, children }) {
	const permissionManager = usePermissions();

	return permissionManager.hasPermission(permission) ? children() : fallback();
}
GuardCheckPermission.defaultProps = {
	fallback: () => <></>,
	children: () => <></>
};
GuardCheckPermission.propTypes = {
	permission: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired,
	fallback: PropTypes.func,
	children: PropTypes.func
};
