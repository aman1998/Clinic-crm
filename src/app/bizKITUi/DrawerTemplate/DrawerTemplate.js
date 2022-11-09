import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import { Close as CloseIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { Box, IconButton } from '@material-ui/core';
import FuseLoading from '@fuse/core/FuseLoading';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const useStyles = makeStyles(theme => ({
	root: {
		display: 'flex',
		flexDirection: 'column',
		height: '100%'
	},
	dialog: {
		flex: 1
	},
	header: {
		padding: '15px 24px 15px 30px',
		display: 'flex',
		borderBottom: '2px solid #E0E0E0',
		alignItems: 'center',
		justifyContent: 'space-between',
		[theme.breakpoints.down(768)]: {
			padding: 15
		}
	},
	contentPadding: {
		padding: 30,
		[theme.breakpoints.down(768)]: {
			padding: 16
		}
	},
	paper: ({ width }) => ({
		width: theme.breakpoints.values[width],
		maxWidth: '100vw'
	})
}));

export function DrawerTemplate({ isOpen, close, header, content, footer, width, isLoading, contentPadding, ...props }) {
	const classes = useStyles({ width });

	return (
		<Drawer anchor="right" open={isOpen} onClose={close} classes={{ paper: classes.paper }} {...props}>
			{isLoading ? (
				<FuseLoading />
			) : (
				<div className={classes.root}>
					<div className={classes.header}>
						{header}

						<IconButton aria-label="Закрыть окно" onClick={close}>
							<CloseIcon />
						</IconButton>
					</div>

					<div className={clsx(classes.dialog, { [classes.contentPadding]: contentPadding })}>{content}</div>
					{footer && (
						<Box display="flex" marginTop="auto" padding={4}>
							{footer}
						</Box>
					)}
				</div>
			)}
		</Drawer>
	);
}
DrawerTemplate.defaultProps = {
	header: <></>,
	content: <></>,
	footer: <></>,
	width: '',
	isLoading: false,
	contentPadding: true
};
DrawerTemplate.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	close: PropTypes.func.isRequired,
	contentPadding: PropTypes.bool,
	header: PropTypes.element,
	content: PropTypes.element,
	footer: PropTypes.element,
	width: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
	isLoading: PropTypes.bool
};
