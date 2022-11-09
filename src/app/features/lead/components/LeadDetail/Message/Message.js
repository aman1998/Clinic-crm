import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core';
import { PenIcon } from 'app/icons/PenIcon';

const useStyles = makeStyles(theme => ({
	messageContainer: {
		padding: 10,
		border: '1px solid rgba(181, 181, 181, 0.5)',
		borderRadius: 4,
		marginLeft: 8,
		width: '100%'
	},
	icon: {
		backgroundColor: '#0E3464',
		width: 32,
		height: 32,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center'
	}
}));

export function Message({ text, createdDate }) {
	const classes = useStyles();
	return (
		<div className="flex mb-10">
			<div className={`${classes.icon} self-end rounded-full`}>
				<PenIcon />
			</div>
			<div className={classes.messageContainer}>
				<span>{text}</span>
				<div className="text-right text-grey-500 mt-10">{moment(createdDate).format('DD MMMM - HH:mm')}</div>
			</div>
		</div>
	);
}

Message.propTypes = {
	text: PropTypes.string.isRequired,
	createdDate: PropTypes.string.isRequired
};

Message.defaultProps = {};
