import React from 'react';
import PropTypes from 'prop-types';
import { CardHeader, Avatar, Typography } from '@material-ui/core';

export function UserCard({ avatar, title, subheader, companyName }) {
	return (
		<CardHeader
			avatar={<Avatar src={avatar} />}
			title={title}
			subheader={
				<>
					<Typography>{subheader}</Typography>
					<Typography>{companyName}</Typography>
				</>
			}
		/>
	);
}
UserCard.propTypes = {
	avatar: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	subheader: PropTypes.string.isRequired,
	companyName: PropTypes.string.isRequired
};
