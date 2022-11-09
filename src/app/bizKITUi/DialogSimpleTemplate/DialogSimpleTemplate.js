import React from 'react';
import { Dialog, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const useStyles = makeStyles(theme => ({
	paper: {
		overflow: 'hidden',
		[theme.breakpoints.down(767)]: {
			margin: '16px'
		}
	},
	header: {
		padding: '9px 24px 9px 30px',
		display: 'flex',
		borderBottom: '2px solid #E0E0E0',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	headerInner: {
		width: '100%',
		marginRight: theme.spacing(2),
		fontSize: theme.typography.h6.fontSize,
		fontWeight: 'bold'
	},
	bodyWrapper: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'stretch',
		height: '100%',
		overflow: 'auto'
	},
	contentPadding: {
		padding: '20px 30px',
		[theme.breakpoints.down(767)]: {
			padding: '20px'
		}
	}
}));

export function DialogSimpleTemplate({ isOpen, onClose, header, children, contentPadding, ...props }) {
	const classes = useStyles(props);

	return (
		<Dialog open={isOpen} onClose={onClose} {...props} classes={{ paper: classes.paper }}>
			<div className={classes.header}>
				<div className={classes.headerInner}>{header}</div>

				<IconButton onClick={() => onClose(false)}>
					<CloseIcon />
				</IconButton>
			</div>

			<div className={clsx(classes.bodyWrapper, { [classes.contentPadding]: contentPadding })}>{children}</div>
		</Dialog>
	);
}
DialogSimpleTemplate.defaultProps = {
	header: <></>,
	children: null,
	contentPadding: true
};
DialogSimpleTemplate.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	header: PropTypes.element,
	contentPadding: PropTypes.bool,
	children: PropTypes.node
};
