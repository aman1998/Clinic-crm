import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import ErrorIcon from '@material-ui/icons/Error';
import moment from 'moment';
import {
	WAYBILL_COMMENT_TYPE_SUCCESS,
	WAYBILL_COMMENT_TYPE_FAIL,
	WAYBILL_COMMENT_TYPE_WARNING,
	WAYBILL_COMMENT_TYPE_INFO
} from '../../services/waybills/constants';
import { CardComment as CardCommentCommon } from '../Comments';
import { getFullName } from '../../utils';

const useStyles = makeStyles({
	icon: {
		width: 35,
		height: 35
	},
	commentDate: {
		fontSize: '10px',
		marginTop: '5px'
	}
});

export function CardComment({ comment }) {
	const classes = useStyles();
	const theme = useTheme();

	const icon = {
		[WAYBILL_COMMENT_TYPE_WARNING]: (
			<ErrorIcon className={classes.icon} style={{ color: theme.palette.warning.main }} />
		),
		[WAYBILL_COMMENT_TYPE_SUCCESS]: (
			<CheckCircleIcon className={classes.icon} style={{ color: theme.palette.success.main }} />
		),
		[WAYBILL_COMMENT_TYPE_FAIL]: <CancelIcon className={classes.icon} style={{ color: theme.palette.error.main }} />
	}[comment.type];
	const title = {
		[WAYBILL_COMMENT_TYPE_WARNING]: 'Причина: ',
		[WAYBILL_COMMENT_TYPE_SUCCESS]: 'Комментарий: ',
		[WAYBILL_COMMENT_TYPE_FAIL]: 'Причина: '
	}[comment.type];

	const dateToString = date => moment(new Date(date)).format('HH:MM — dd, MMMM yyyy');

	return comment.type === WAYBILL_COMMENT_TYPE_INFO ? (
		<CardCommentCommon
			comment={{
				fullName: getFullName({
					lastName: comment.created_by.last_name,
					firstName: comment.created_by.first_name
				}),
				text: comment.text,
				createdAt: comment.created_at
			}}
		/>
	) : (
		<div className="flex flex-col mt-0 mb-20">
			<div className="flex justify-between">
				{icon}
				<div className="flex flex-1 flex-col ml-10">
					<span className="text-1xl font-bold">{comment.heading}</span>
					<p className="mt-4 text-justify">
						{title} {comment.text}
					</p>
					<span className={classes.commentDate}>{dateToString(comment.created_at)} </span>
				</div>
			</div>
		</div>
	);
}

CardComment.propTypes = {
	comment: PropTypes.shape({
		type: PropTypes.oneOf([WAYBILL_COMMENT_TYPE_WARNING, WAYBILL_COMMENT_TYPE_SUCCESS, WAYBILL_COMMENT_TYPE_FAIL]),
		created_by: PropTypes.shape({
			first_name: PropTypes.string,
			last_name: PropTypes.string
		}),
		text: PropTypes.string,
		created_at: PropTypes.string,
		heading: PropTypes.string
	}).isRequired
};
