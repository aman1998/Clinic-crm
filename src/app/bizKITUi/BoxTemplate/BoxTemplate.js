import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Grid, Paper, useMediaQuery } from '@material-ui/core';
import PropTypes from 'prop-types';

const useStyles = makeStyles(theme => ({
	header: {
		padding: '16px 30px 16px 30px',
		borderBottom: '2px solid #E0E0E0'
	},
	leftContent: {
		height: 'calc(100% - 64px)',
		padding: '25px 30px',
		borderRight: '2px solid #E0E0E0',
		overflow: 'auto'
	},
	leftContentFooter: {
		display: 'flex',
		alignItems: 'center',
		height: '64px',
		padding: '25px 30px',
		borderTop: '2px solid #E0E0E0',
		borderRight: '2px solid #E0E0E0'
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
		}
	}
}));

export function BoxTemplate({ header, leftContent, rightContent, footer, height }) {
	const theme = useTheme();
	const classes = useStyles();
	const isMdBreakpoint = useMediaQuery(theme.breakpoints.down('md'));
	const elemHeight = isMdBreakpoint ? 'auto' : height;

	return (
		<Paper>
			<div className={classes.header}>
				<div className="w-full">{header}</div>
			</div>

			<Grid container>
				<Grid item lg={8} xs={12} style={{ height: elemHeight }}>
					<div className={classes.leftContent}>{leftContent}</div>
					{footer && <div className={classes.leftContentFooter}>{footer}</div>}
				</Grid>
				<Grid item lg={4} xs={12} style={{ height: elemHeight }}>
					<div className={classes.rightContent}>{rightContent}</div>
				</Grid>
			</Grid>
		</Paper>
	);
}
BoxTemplate.defaultProps = {
	header: <></>,
	leftContent: <></>,
	rightContent: <></>,
	footer: <></>,
	height: 'auto'
};
BoxTemplate.propTypes = {
	header: PropTypes.element,
	leftContent: PropTypes.element,
	rightContent: PropTypes.element,
	footer: PropTypes.element,
	height: PropTypes.string
};
