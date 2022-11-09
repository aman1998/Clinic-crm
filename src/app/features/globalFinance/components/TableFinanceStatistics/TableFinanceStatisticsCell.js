import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { TableCell } from '@material-ui/core';
import clsx from 'clsx';

export const TableCellStyle = withStyles(theme => ({
	root: {
		border: `1px solid ${theme.palette.grey[300]}}`
	}
}))(TableCell);

const useStyles = makeStyles(theme => ({
	fixed: {
		position: 'sticky',
		left: -1,
		backgroundColor: theme.palette.background.paper,
		backgroundClip: 'padding-box',
		'&::after': {
			content: '""',
			position: 'absolute',
			top: 0,
			right: 0,
			bottom: 0,
			width: 1,
			backgroundColor: theme.palette.grey[300]
		}
	}
}));

export function TableFinanceStatisticsCell({ children, fixed, className, ...props }) {
	const classes = useStyles();

	return (
		<TableCellStyle className={clsx(className, { [classes.fixed]: fixed })} {...props}>
			{children}
		</TableCellStyle>
	);
}
TableFinanceStatisticsCell.defaultProps = {
	fixed: false,
	className: ''
};
TableFinanceStatisticsCell.propTypes = {
	fixed: PropTypes.bool,
	className: PropTypes.string,
	children: PropTypes.node.isRequired
};
