import React from 'react';
import { Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const useStyles = makeStyles({
	children: {
		marginTop: 10,
		fontSize: 20,
		fontWeight: 700
	},
	paper: {
		padding: 22,
		borderRadius: 10,
		display: 'flex',
		flexDirection: 'column',
		height: '100%'
	},
	title: {
		marginBottom: 'auto'
	}
});

export function BlockInfo({ color, title, children }) {
	const classes = useStyles();

	return (
		<Paper className={classes.paper}>
			<p className={classes.title}>{title}</p>

			<div className={classes.children} style={{ color }}>
				{children}
			</div>
		</Paper>
	);
}

BlockInfo.defaultProps = {
	color: null
};
BlockInfo.propTypes = {
	color: PropTypes.string,
	title: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired
};
