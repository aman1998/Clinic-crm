import React from 'react';
import { MenuItem as MenuItemLib } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const useStyles = makeStyles(theme => ({
	group: {
		paddingLeft: theme.spacing(4)
	}
}));

export const MenuItem = React.forwardRef(({ children, isGrouped, ...props }, ref) => {
	const classes = useStyles();
	const classList = clsx({ [classes.group]: isGrouped });

	return (
		<MenuItemLib {...props} className={classList} ref={ref}>
			{children}
		</MenuItemLib>
	);
});

MenuItem.defaultProps = {
	isGrouped: false,
	children: null
};
MenuItem.propTypes = {
	children: PropTypes.node,
	isGrouped: PropTypes.bool
};
