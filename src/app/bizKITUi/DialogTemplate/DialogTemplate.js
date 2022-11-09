import React from 'react';
import { Dialog, IconButton, Grid } from '@material-ui/core';
import { Close as CloseIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import FuseLoading from '@fuse/core/FuseLoading';

const useStyles = makeStyles(theme => ({
	paper: {
		height: '100%',
		overflow: 'hidden'
	},
	fullWidth: {
		width: '100%'
	},
	header: {
		padding: '16px 30px 16px 48px',
		borderBottom: '2px solid #E0E0E0',
		[theme.breakpoints.down(768)]: {
			padding: '16px'
		}
	},
	headerRight: {
		textAlign: 'right'
	},
	wrap: {
		height: '100%'
	},
	content: {
		height: '100%',
		overflowY: 'auto'
	},
	leftContent: {
		height: '100%',
		padding: '25px 48px',
		overflowY: 'auto',
		borderRight: '2px solid #E0E0E0',
		[theme.breakpoints.down(768)]: {
			padding: '16px'
		}
	},
	leftContentShort: {
		height: 'calc(100% - 64px)'
	},
	leftContentFooter: {
		display: 'flex',
		alignItems: 'center',
		minHeight: '64px',
		padding: '8px 48px',
		borderTop: '2px solid #E0E0E0',
		borderRight: '2px solid #E0E0E0',
		[theme.breakpoints.down(768)]: {
			padding: '16px'
		}
	},
	rightContent: {
		height: '100%'
	},
	[theme.breakpoints.down('md')]: {
		leftContentFooter: {
			borderBottom: '2px solid #E0E0E0'
		},
		leftContent: {
			height: 'auto'
		},
		wrap: {
			height: 'auto'
		}
	}
}));

export function DialogTemplate({
	isOpen,
	onClose,
	header,
	leftContent,
	rightContent,
	footer,
	isLoading,
	headerFull,
	...props
}) {
	const classes = useStyles();

	const gridHeader = {
		leftColumn: headerFull ? 'auto' : 8,
		rightColumn: headerFull ? 'auto' : 4
	};

	return (
		<Dialog fullScreen open={isOpen} onClose={onClose} {...props} classes={{ paper: classes.paper }}>
			{isLoading ? (
				<FuseLoading />
			) : (
				<>
					<div className={classes.header}>
						<Grid container wrap="nowrap">
							<Grid item lg={gridHeader.leftColumn} xs container alignItems="center">
								<div className={classes.fullWidth}>{header}</div>
							</Grid>

							<Grid item lg={gridHeader.rightColumn} xs="auto" className={classes.headerRight}>
								<IconButton aria-label="Закрыть окно" onClick={onClose}>
									<CloseIcon />
								</IconButton>
							</Grid>
						</Grid>
					</div>

					<Grid container className={classes.content}>
						<Grid item lg={8} xs={12} className={classes.wrap}>
							<div className={clsx(classes.leftContent, { [classes.leftContentShort]: footer })}>
								{leftContent}
							</div>
							{footer && <div className={classes.leftContentFooter}>{footer}</div>}
						</Grid>
						<Grid item lg={4} xs={12} className={classes.wrap}>
							<div className={classes.rightContent}>{rightContent}</div>
						</Grid>
					</Grid>
				</>
			)}
		</Dialog>
	);
}
DialogTemplate.defaultProps = {
	isLoading: false,
	headerFull: false,
	header: <></>,
	leftContent: <></>,
	rightContent: <></>,
	footer: <></>
};
DialogTemplate.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	headerFull: PropTypes.bool,
	isLoading: PropTypes.bool,
	header: PropTypes.element,
	leftContent: PropTypes.element,
	rightContent: PropTypes.element,
	footer: PropTypes.element
};
