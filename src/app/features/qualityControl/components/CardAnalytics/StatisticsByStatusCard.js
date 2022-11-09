import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Paper } from '@material-ui/core';
import PropTypes from 'prop-types';

const useStyles = makeStyles(theme => ({
	items: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
	},
	text: {
		fontSize: '1.2rem'
	},
	titlePaper: {
		color: theme.palette.secondary.main,
		fontSize: '2rem',
		fontWeight: 'bold'
	},
	title: {
		color: theme.palette.success.main,
		fontSize: '3.4rem',
		fontWeight: 'bold'
	},
	titlePlan: {
		color: '#8954ba',
		fontSize: '3.4rem',
		fontWeight: 'bold'
	},
	titleActive: {
		color: theme.palette.primary.main,
		fontSize: '3.4rem',
		fontWeight: 'bold'
	},
	titleControl: {
		color: theme.status.warning,
		fontSize: '3.4rem',
		fontWeight: 'bold'
	},
	titleError: {
		color: theme.palette.error.main,
		fontSize: '3.4rem',
		fontWeight: 'bold'
	},
	titleReject: {
		color: theme.palette.secondary.main,
		fontSize: '3.4rem',
		fontWeight: 'bold'
	},
	titleSize: {
		fontSize: '1.6rem'
	}
}));

export function StatisticsByStatusCard({ statistics, title }) {
	const classes = useStyles();

	return (
		<>
			<Typography className={classes.titlePaper}>{title}</Typography>
			<div className={`gap-16 mt-16 ${classes.items}`}>
				<Paper className="p-16">
					<p className={classes.titleSize}>Всего</p>
					<p className={classes.title}>{statistics.all}</p>
				</Paper>
				<Paper className="p-16">
					<p className={classes.titleSize}>В плане</p>
					<p className={classes.titlePlan}>{statistics.new}</p>
				</Paper>
				<Paper className="p-16">
					<p className={classes.titleSize}>В обработке</p>
					<p className={classes.titleActive}>{statistics.processing}</p>
				</Paper>
				<Paper className="p-16">
					<p className={classes.titleSize}>Завершено</p>
					<p className={classes.title}>{statistics.done}</p>
				</Paper>
				<Paper className="p-16">
					<p className={classes.titleSize}>Отказано</p>
					<p className={classes.titleError}>{statistics.closed}</p>
				</Paper>
			</div>
		</>
	);
}

StatisticsByStatusCard.defaultProps = {
	title: ''
};

StatisticsByStatusCard.propTypes = {
	title: PropTypes.string,
	statistics: PropTypes.shape({
		all: PropTypes.number.isRequired,
		new: PropTypes.number.isRequired,
		processing: PropTypes.number.isRequired,
		done: PropTypes.number.isRequired,
		closed: PropTypes.number.isRequired
	}).isRequired
};
