import React from 'react';
import { Button as ButtonMaterial } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const useStyles = makeStyles(theme => ({
	customColorSecondary: {
		backgroundColor: theme.palette.error.main,
		'&:hover': {
			backgroundColor: theme.palette.error.dark
		}
	},
	customColorSecondaryOutlined: {
		backgroundColor: 'transparent',
		borderColor: theme.palette.error.main,
		color: theme.palette.error.main,
		'&:hover': {
			borderColor: theme.palette.error.main,
			backgroundColor: 'transparent'
		}
	},
	customColorAccent: {
		backgroundColor: theme.palette.warning.main,
		'&:hover': {
			backgroundColor: theme.palette.warning.dark
		}
	},
	customColorAccentOutlined: {
		backgroundColor: 'transparent',
		borderColor: theme.palette.warning.main,
		color: theme.palette.warning.main,
		'&:hover': {
			borderColor: theme.palette.warning.main,
			backgroundColor: 'transparent'
		}
	},
	customColorPrimary: {
		backgroundColor: theme.palette.success.main,
		'&:hover': {
			backgroundColor: theme.palette.success.dark
		}
	},
	customColorPrimaryOutlined: {
		backgroundColor: 'transparent',
		borderColor: theme.palette.success.main,
		color: theme.palette.success.main,
		'&:hover': {
			borderColor: theme.palette.success.main,
			backgroundColor: 'transparent'
		}
	},
	normalText: {
		textTransform: 'none',
		fontWeight: '400'
	}
}));

export function Button({ textNormal = false, customColor, className, variant, children, ...props }) {
	const classes = useStyles();
	const classList = clsx(className, {
		[classes.normalText]: textNormal,
		[classes.customColorSecondary]: customColor === 'secondary',
		[classes.customColorSecondaryOutlined]: customColor === 'secondary' && variant === 'outlined',
		[classes.customColorAccent]: customColor === 'accent',
		[classes.customColorAccentOutlined]: customColor === 'accent' && variant === 'outlined',
		[classes.customColorPrimary]: customColor === 'primary',
		[classes.customColorPrimaryOutlined]: customColor === 'primary' && variant === 'outlined'
	});

	return (
		<ButtonMaterial color="primary" variant={variant} className={classList} {...props}>
			{children}
		</ButtonMaterial>
	);
}
Button.defaultProps = {
	textNormal: false,
	customColor: null,
	variant: 'contained',
	className: null,
	children: null
};
Button.propTypes = {
	textNormal: PropTypes.bool,
	customColor: PropTypes.oneOf(['primary', 'secondary', 'accent']),
	variant: PropTypes.oneOf(['contained', 'outlined', 'text']),
	className: PropTypes.string,
	children: PropTypes.node
};
