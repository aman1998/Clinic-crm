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
		fontSize: '1.5rem',
		margin: '1.1rem 0rem',
		display: 'flex',
		justifyContent: 'space-between'
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

export function StatisticsByTypeCard({ statistics, title }) {
	const classes = useStyles();

	return (
		<>
			<Typography className={classes.titlePaper}>{title}</Typography>
			<div className={`gap-16 mt-16 ${classes.items}`}>
				<Paper className="p-16">
					<p className={classes.titleSize}>Отзывы</p>
					<p className={classes.title}>{statistics.reviews.count}</p>
					<p className={classes.text}>
						Отзывы пациентов: <span>{statistics.reviews.patients}</span>
					</p>
					<p className={classes.text}>
						Отзывы партнеров: <span>{statistics.reviews.partners}</span>
					</p>
					<p className={classes.text}>
						Отзывы сотрудников: <span>{statistics.reviews.doctors}</span>
					</p>
				</Paper>
				<Paper className="p-16">
					<p className={classes.titleSize}>Жалобы</p>
					<p className={classes.titleError}>{statistics.complients.count}</p>
					<p className={classes.text}>
						Жалобы пациентов: <span>{statistics.complients.patients}</span>
					</p>
					<p className={classes.text}>
						Жалобы партнеров: <span>{statistics.complients.partners}</span>
					</p>
					<p className={classes.text}>
						Жалобы сотрудников: <span>{statistics.complients.doctors}</span>
					</p>
				</Paper>
				<Paper className="p-16">
					<p className={classes.titleSize}>Предложения</p>
					<p className={classes.titleControl}>{statistics.proposals.count}</p>
					<p className={classes.text}>
						Предложения пациентов: <span>{statistics.proposals.patients}</span>
					</p>
					<p className={classes.text}>
						Предложения партнеров: <span>{statistics.proposals.partners}</span>
					</p>
					<p className={classes.text}>
						Предложения сотрудников: <span>{statistics.proposals.doctors}</span>
					</p>
				</Paper>
			</div>
		</>
	);
}
StatisticsByTypeCard.defaultProps = {
	title: ''
};

StatisticsByTypeCard.propTypes = {
	title: PropTypes.string,
	statistics: PropTypes.shape({
		reviews: PropTypes.shape({
			count: PropTypes.number.isRequired,
			patients: PropTypes.number.isRequired,
			partners: PropTypes.number.isRequired,
			doctors: PropTypes.number.isRequired
		}).isRequired,
		complients: PropTypes.shape({
			count: PropTypes.number.isRequired,
			patients: PropTypes.number.isRequired,
			partners: PropTypes.number.isRequired,
			doctors: PropTypes.number.isRequired
		}).isRequired,
		proposals: PropTypes.shape({
			count: PropTypes.number.isRequired,
			patients: PropTypes.number.isRequired,
			partners: PropTypes.number.isRequired,
			doctors: PropTypes.number.isRequired
		}).isRequired
	}).isRequired
};
