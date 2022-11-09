import React, { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import { Message } from './Message';
import { useObserverElement } from '../../hooks';
import { MESSAGE_STATUS, MESSAGE_TYPE } from './constants';

const useStyles = makeStyles({
	messages: {
		marginTop: 'auto',
		overflowY: 'auto'
	},
	messageItem: {
		display: 'flex',
		marginBottom: 10
	}
});

export function Messages({ list, onFetchMessages }) {
	const classes = useStyles();

	const ObserverElementMessages = useObserverElement(onFetchMessages);

	const messagesRef = useRef(null);
	useEffect(() => {
		const messagesElement = messagesRef.current;

		if (!messagesElement) {
			return;
		}

		messagesElement.scrollTop = messagesRef.current.scrollHeight;
	}, [list]);

	const structuredList = useMemo(() => {
		const newList = [];
		let date = null;
		let isShowNewBlock = false;
		let customId = 0;

		[...list].reverse().forEach(item => {
			if (item.isNew && !isShowNewBlock) {
				customId += 1;
				newList.push({ id: `${item.id}message${customId}`, type: MESSAGE_TYPE.NEW });
				isShowNewBlock = true;
			}

			if (!date || moment(item.date).startOf('date').diff(moment(date)) > 0) {
				customId += 1;
				newList.push({ id: `${item.id}message${customId}`, type: MESSAGE_TYPE.DATE, date: item.date });
			}
			date = item.date;

			if (item.audio) {
				customId += 1;
				newList.push({ ...item, id: `${item.id}message${customId}`, type: MESSAGE_TYPE.AUDIO });
			}

			if (item.files.length > 0) {
				customId += 1;
				newList.push({ ...item, id: `${item.id}message${customId}`, type: MESSAGE_TYPE.FILES });
			}

			if (item.text) {
				customId += 1;
				newList.push({ ...item, id: `${item.id}message${customId}`, type: MESSAGE_TYPE.TEXT });
			}
		});

		return newList;
	}, [list]);

	return (
		<div ref={messagesRef} className={classes.messages}>
			<ObserverElementMessages />

			{structuredList.map(message => (
				<div key={message.id} className={classes.messageItem}>
					<Message
						type={message.type}
						isIncome={message.isIncome}
						text={message.text}
						audio={message.audio}
						status={message.status}
						date={message.date}
						files={message.files}
					/>
				</div>
			))}
		</div>
	);
}
Messages.propTypes = {
	list: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
			date: PropTypes.instanceOf(Date).isRequired,
			text: PropTypes.node,
			audio: PropTypes.string,
			isIncome: PropTypes.bool.isRequired,
			isNew: PropTypes.bool.isRequired,
			files: PropTypes.arrayOf(PropTypes.string),
			status: PropTypes.oneOf(Object.entries(MESSAGE_STATUS).map(([_, messageStatus]) => messageStatus))
		})
	).isRequired,
	onFetchMessages: PropTypes.func.isRequired
};
