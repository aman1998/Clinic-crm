import { makeStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';

const useStyles = makeStyles(theme => ({
	deadline: {
		fontSize: 8,
		textAlign: 'right'
	},
	deadlineNoTasks: {
		color: '#7F4C0A'
	},
	dayCircle: {
		borderRadius: '50%',
		marginRight: 6,
		padding: '2px 6px '
	},
	dayCircleToday: {
		backgroundColor: '#52D858'
	},
	dayCircleNoTasks: {
		backgroundColor: '#F2B05C'
	}
}));

export const Deadline = ({ tasks }) => {
	const classes = useStyles();

	if (!tasks) {
		return <></>;
	}

	if (tasks.length === 0) {
		return (
			<div className={`${classes.deadline} ${classes.deadlineNoTasks}`}>
				<span className={`${classes.dayCircle} ${classes.dayCircleNoTasks}`} /> Нет задач
			</div>
		);
	}

	return (
		<div className={`${classes.deadline} text-green-700`}>
			<span className={`${classes.dayCircle} ${classes.dayCircleToday}`} /> сегодня
		</div>
	);
};

Deadline.propTypes = {
	tasks: PropTypes.arrayOf()
};

Deadline.defaultProps = {
	tasks: []
};
