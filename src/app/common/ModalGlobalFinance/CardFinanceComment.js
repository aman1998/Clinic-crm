import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { Info as InfoIcon, Cancel as CancelIcon, CheckCircle as CheckCircleIcon } from '@material-ui/icons';
import ReactHtmlParser from 'react-html-parser';
import moment from 'moment';
import {
	COMMENT_TYPE_SUCCESS,
	COMMENT_TYPE_FAIL,
	COMMENT_TYPE_WARNING,
	COMMENT_TYPE_INFO,
	COMMENT_TYPE_FINANCE_FAIL,
	COMMENT_TYPE_FINANCE_SUCCESS
} from '../../services/globalFinance/constants';
import { CardComment } from '../Comments';
import { getFullName } from '../../utils';

const useStyles = makeStyles(theme => ({
	noteCard: {
		color: theme.palette.secondary.main
	},
	starIcon: {
		marginTop: '-4px',
		marginLeft: '-4px',
		width: 40,
		height: 40
	},
	commentDate: {
		fontSize: '10px',
		marginTop: '5px'
	},
	tengeIcon: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		width: 33,
		height: 33,
		paddingTop: 2,
		borderRadius: '50%',
		backgroundColor: 'currentColor',
		fontSize: '20px',
		color: '#fff'
	}
}));

function TengeIcon({ color }) {
	const classes = useStyles();

	return (
		<div className={classes.tengeIcon} style={{ backgroundColor: color }}>
			₸
		</div>
	);
}
TengeIcon.propTypes = {
	color: PropTypes.string.isRequired
};

const dateToString = date => moment(new Date(date)).format('HH:mm — dd, MMMM YYYY');

export function CardFinanceComment({ comment }) {
	const theme = useTheme();
	const classes = useStyles();

	const isSuccess = comment.type === COMMENT_TYPE_SUCCESS;
	const isFail = comment.type === COMMENT_TYPE_FAIL;
	const isWarning = comment.type === COMMENT_TYPE_WARNING;
	const isInfo = comment.type === COMMENT_TYPE_INFO;
	const isFinanceFail = comment.type === COMMENT_TYPE_FINANCE_FAIL;
	const isFinanceSuccess = comment.type === COMMENT_TYPE_FINANCE_SUCCESS;

	return isInfo ? (
		<CardComment
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
		<div className={clsx(classes.noteCard, 'flex flex-col mt-0 mb-0')}>
			<div className="flex justify-between">
				{isSuccess && (
					<CheckCircleIcon className={classes.starIcon} style={{ color: theme.palette.success.main }} />
				)}
				{isFail && <CancelIcon className={classes.starIcon} style={{ color: theme.palette.error.main }} />}
				{isWarning && <InfoIcon className={classes.starIcon} style={{ color: '#FFCC00' }} />}
				{isFinanceFail && <TengeIcon className={classes.starIcon} color={theme.palette.error.main} />}
				{isFinanceSuccess && <TengeIcon className={classes.starIcon} color={theme.palette.success.main} />}

				<div className="flex flex-1 flex-col ml-10">
					<span className="text-1xl font-bold">{comment.heading}</span>
					<p className="mt-4 text-justify">
						{isSuccess && 'Комментарий: '}
						{(isWarning || isFail) && 'Причина: '}
						{ReactHtmlParser(comment.text)}
					</p>
					<span className={classes.commentDate}>{dateToString(comment.created_at)} </span>
				</div>
			</div>
		</div>
	);
}
CardFinanceComment.propTypes = {
	comment: PropTypes.shape({
		created_by: PropTypes.shape({
			first_name: PropTypes.string,
			last_name: PropTypes.string
		}),
		type: PropTypes.oneOf([
			COMMENT_TYPE_SUCCESS,
			COMMENT_TYPE_FAIL,
			COMMENT_TYPE_WARNING,
			COMMENT_TYPE_INFO,
			COMMENT_TYPE_FINANCE_FAIL,
			COMMENT_TYPE_FINANCE_SUCCESS
		]),
		heading: PropTypes.string,
		text: PropTypes.string,
		created_at: PropTypes.string
	}).isRequired
};
