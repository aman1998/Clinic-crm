import React from 'react';
import clsx from 'clsx';
import ReactHtmlParser from 'react-html-parser';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import PropTypes from 'prop-types';

const useStyles = makeStyles(theme => ({
	noteCard: {
		color: theme.palette.secondary.main
	},
	avatar: {
		width: 35,
		height: 35,
		borderRadius: '50%'
	},
	commentDate: {
		fontSize: '10px',
		marginTop: '5px'
	}
}));

export function CardComment({ comment }) {
	const classes = useStyles();

	const displayDate = moment(comment.createdAt).format('HH:mm — dd, MMMM YYYY');

	return (
		<div className={clsx(classes.noteCard, 'flex flex-col mt-0 mb-0')}>
			<div className="flex justify-between">
				<img src="assets/images/avatars/alice.jpg" alt="" className={classes.avatar} />
				<div className="flex flex-1 flex-col ml-10">
					<span className="text-1xl font-bold">{comment.fullName}</span>
					<p className="mt-4 text-justify">{ReactHtmlParser(comment.text)}</p>
					<span className={classes.commentDate}>{displayDate} </span>
				</div>
			</div>
		</div>
	);
}
CardComment.propTypes = {
	comment: PropTypes.shape({
		fullName: PropTypes.string.isRequired,
		text: PropTypes.string.isRequired,
		createdAt: PropTypes.string.isRequired
	}).isRequired
};
