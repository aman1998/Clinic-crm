import React, { useMemo } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import moment from 'moment';

const useStyles = makeStyles(theme => ({
	noteCard: {
		color: theme.palette.secondary.main
	},
	commentDate: {
		fontSize: '10px',
		marginTop: '5px'
	}
}));

export function CardHistory({ fullName, message, date }) {
	const classes = useStyles();

	const displayDate = useMemo(() => {
		return moment(new Date(date)).format('HH:mm — dd, MMMM YYYY');
	}, [date]);

	return (
		<div className={clsx(classes.noteCard, 'flex flex-col')}>
			<div className="flex justify-between">
				<div className="flex flex-1 flex-col ml-10">
					<span className="text-1xl font-bold">{fullName}</span>
					<p className="mt-4 text-justify">{message}</p>
					<span className={classes.commentDate}>{displayDate} </span>
				</div>
			</div>
		</div>
	);
}
CardHistory.propTypes = {
	fullName: PropTypes.string.isRequired,
	message: PropTypes.string.isRequired,
	date: PropTypes.string.isRequired
};
