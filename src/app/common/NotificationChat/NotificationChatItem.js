import React from 'react';
import PropTypes from 'prop-types';
import { Avatar, CardHeader, CardActionArea } from '@material-ui/core';
import moment from 'moment';
import { getFullName } from '../../utils';

export function NotificationChatItem({ conversation, onClick }) {
	return (
		<CardActionArea onClick={onClick}>
			<CardHeader
				avatar={<Avatar src={conversation.avatar} />}
				title={conversation.patient ? getFullName(conversation.patient) : conversation.main_phone}
				subheader={
					<>
						{conversation.last_message?.message ?? ''}

						<div className="mt-10 text-12">
							{moment(conversation.created_at).format('HH:mm — dd, DD MMMM YYYY')}
						</div>
					</>
				}
			/>
		</CardActionArea>
	);
}
NotificationChatItem.propTypes = {
	conversation: PropTypes.shape({
		created_at: PropTypes.string.isRequired,
		avatar: PropTypes.string,
		patient: PropTypes.shape({
			last_name: PropTypes.string,
			first_name: PropTypes.string,
			middle_name: PropTypes.string
		}),
		main_phone: PropTypes.string.isRequired,
		last_message: PropTypes.shape({
			message: PropTypes.string
		})
	}).isRequired,
	onClick: PropTypes.func.isRequired
};
