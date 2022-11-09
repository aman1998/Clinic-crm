import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import moment from 'moment';
import { Audio } from './Audio';
import { Status } from './Status';
import { Files } from './Files';
import { MessageDate } from './MessageDate';
import { MESSAGE_TYPE } from './constants';

const useStyles = makeStyles(theme => ({
	container: {
		display: 'inline-block',
		maxWidth: '75%',
		marginLeft: 'auto',
		padding: 15,
		borderRadius: '10px 10px 0 10px',
		backgroundColor: theme.palette.success.main,
		color: theme.palette.background.default
	},
	incomeMessage: {
		marginRight: 'auto',
		marginLeft: 0,
		borderRadius: '10px 10px 10px 0',
		backgroundColor: theme.palette.grey[300],
		color: theme.palette.secondary.dark
	},
	infoBlock: {
		display: 'flex',
		justifyContent: 'flex-end',
		alignItems: 'center',
		marginTop: 10,
		fontSize: 12
	},
	date: {
		marginLeft: 6
	},
	groupMessagesDate: {
		margin: 'auto',
		padding: '8px 15px',
		border: `1px solid ${theme.palette.secondary.dark}`,
		borderRadius: 40,
		textAlign: 'center'
	},
	groupNewMessages: {
		margin: 'auto',
		padding: '8px 20px',
		border: `1px solid ${theme.palette.success.main}`,
		borderRadius: 40,
		color: theme.palette.success.main,
		textAlign: 'center',
		textTransform: 'uppercase'
	}
}));

export function Message({ type, isIncome, text, audio, files, status, date }) {
	const classes = useStyles();

	if (MESSAGE_TYPE.DATE === type) {
		return <div className={classes.groupMessagesDate}>{date && moment(date).format('DD MMM')}</div>;
	}

	if (MESSAGE_TYPE.NEW === type) {
		return <div className={classes.groupNewMessages}>Новые сообщения</div>;
	}

	const getMessageBody = {
		[MESSAGE_TYPE.TEXT]: () => text,
		[MESSAGE_TYPE.AUDIO]: () => <Audio src={audio} />,
		[MESSAGE_TYPE.FILES]: () => <Files files={files} />
	}[type];

	return (
		<div className={clsx(classes.container, { [classes.incomeMessage]: isIncome })}>
			<div>{getMessageBody()}</div>

			<div className={classes.infoBlock}>
				{status && <Status status={status} />}

				<div className={classes.date}>
					<MessageDate date={date} />
				</div>
			</div>
		</div>
	);
}
Message.defaultProps = {
	type: MESSAGE_TYPE.TEXT,
	text: '',
	audio: '',
	files: [],
	date: null,
	status: null,
	isIncome: false
};
Message.propTypes = {
	type: PropTypes.oneOf(Object.entries(MESSAGE_TYPE).map(([_, type]) => type)),
	isIncome: PropTypes.bool,
	text: PropTypes.node,
	date: PropTypes.instanceOf(Date),
	audio: PropTypes.string,
	status: PropTypes.string,
	files: PropTypes.arrayOf(PropTypes.string)
};
