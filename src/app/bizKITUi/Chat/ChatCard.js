import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Avatar, CardHeader, ButtonBase, Badge, Typography } from '@material-ui/core';
import clsx from 'clsx';
import { Status } from './Status';
import { MessageDate } from './MessageDate';
import { Instagram as InstagramIcon, Whatsapp as WhatsappIcon } from '../Icons';
import { CHAT_TYPE } from './constants';

const useStyles = makeStyles(theme => ({
	container: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		width: '100%',
		borderBottom: `1px solid ${theme.palette.grey[300]}`
	},
	cardWrapper: {
		overflow: 'hidden',
		textAlign: 'left'
	},
	cardHeaderRoot: {
		overflow: 'hidden'
	},
	cardHeaderContent: {
		overflow: 'hidden'
	},
	isActive: {
		backgroundColor: theme.palette.grey[200]
	},
	infoBlock: {
		marginRight: 16,
		textAlign: 'center'
	},
	newMessages: {
		display: 'inline-flex',
		justifyContent: 'center',
		alignItems: 'center',
		minWidth: 26,
		marginTop: 5,
		padding: '5px 10px',
		borderRadius: 30,
		backgroundColor: theme.palette.success.main,
		color: theme.palette.background.default
	},
	status: {
		color: theme.palette.secondary.main
	},
	nowrap: {
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis'
	},
	companyName: {
		fontSize: 13
	}
}));

export function ChatCard({
	avatar,
	title,
	subheader,
	companyName,
	status,
	date,
	isActive,
	newMessages,
	type,
	onClick
}) {
	const classes = useStyles();

	const getIcon = () => {
		switch (type) {
			case CHAT_TYPE.INSTAGRAM:
				return <InstagramIcon />;
			case CHAT_TYPE.WHATSAPP:
				return <WhatsappIcon />;
			default:
				return null;
		}
	};

	return (
		<ButtonBase className={clsx(classes.container, { [classes.isActive]: isActive })} onClick={onClick}>
			<div className={classes.cardWrapper}>
				<CardHeader
					classes={{
						root: classes.cardHeaderRoot,
						content: classes.cardHeaderContent
					}}
					avatar={
						<Badge
							overlap="circle"
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'left'
							}}
							badgeContent={getIcon()}
						>
							<Avatar src={avatar} />
						</Badge>
					}
					title={title}
					subheader={
						<>
							<Typography className={classes.nowrap}>{subheader}</Typography>
							<Typography className={`${classes.nowrap} ${classes.companyName}`}>
								{companyName}
							</Typography>
						</>
					}
				/>
			</div>

			<div className={classes.infoBlock}>
				{date && <MessageDate date={date} />}

				{newMessages > 0 && <div className={classes.newMessages}>{newMessages}</div>}
				{newMessages <= 0 && status && <Status status={status} />}
			</div>
		</ButtonBase>
	);
}
ChatCard.defaultProps = {
	isActive: false,
	status: null,
	date: null
};
ChatCard.propTypes = {
	avatar: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	subheader: PropTypes.string.isRequired,
	companyName: PropTypes.string.isRequired,
	isActive: PropTypes.bool,
	status: PropTypes.string,
	date: PropTypes.instanceOf(Date),
	newMessages: PropTypes.number.isRequired,
	type: PropTypes.oneOf(Object.entries(CHAT_TYPE).map(([_, messageStatus]) => messageStatus)).isRequired,
	onClick: PropTypes.func.isRequired
};
