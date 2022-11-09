import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Typography, IconButton } from '@material-ui/core';
import { Search as SearchIcon, Close as CloseIcon } from '@material-ui/icons';
import FuseScrollbars from '../../../@fuse/core/FuseScrollbars';
import { UserCard } from './UserCard';
import { ChatCard } from './ChatCard';
import { Form } from './Form';
import { HeaderTabs } from './HeaderTabs';
import { Messages } from './Messages';
import { useObserverElement, useDebounce } from '../../hooks';
import { CHAT_TYPE, HEADER_HEIGHT, MESSAGE_STATUS } from './constants';
import { TextField } from '../TextField';

const useStyles = makeStyles(theme => ({
	container: {
		display: 'grid',
		gridTemplateColumns: '300px 1fr',
		height: 600,
		border: `1px solid ${theme.palette.grey[300]}`
	},
	header: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'flex-end',
		height: HEADER_HEIGHT,
		minHeight: HEADER_HEIGHT,
		borderBottom: `1px solid ${theme.palette.grey[300]}`
	},
	headerContentMessage: {
		display: 'flex',
		alignItems: 'center',
		height: HEADER_HEIGHT,
		minHeight: HEADER_HEIGHT,
		borderBottom: `1px solid ${theme.palette.grey[300]}`
	},
	customHeaderArea: {
		display: 'flex',
		justifyContent: 'flex-end',
		alignItems: 'center',
		flex: 1,
		marginRight: 12
	},
	searchButtonMessages: {
		marginRight: 16
	},
	rightContainer: {
		display: 'flex',
		flexDirection: 'column',
		height: '100%',
		borderLeft: `1px solid ${theme.palette.grey[300]}`,
		overflow: 'hidden'
	},
	leftContainer: {
		display: 'flex',
		flexDirection: 'column',
		height: '100%',
		minHeight: 1
	},
	messageContent: {
		display: 'flex',
		flexDirection: 'column',
		height: `calc(100% - ${HEADER_HEIGHT}px)`,
		padding: 20
	},
	messageFooterArea: {
		marginTop: 10,
		marginBottom: 10
	},
	notSelectChat: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		height: '100%'
	},
	searchField: {
		maxWidth: 300,
		margin: '5px 0 5px 5px'
	},
	observerElement: {
		padding: 6
	}
}));

export function Chat({
	chats,
	messages,
	customMessageArea,
	customHeaderArea,
	selectedChat,
	onSelectChat,
	onSendMessage,
	onFetchMessages,
	onFetchChats,
	onChangeTab,
	onSearchChats,
	onSearchMessages
}) {
	const classes = useStyles();

	const ObserverElementChats = useObserverElement(onFetchChats);

	const handleOnChangeTab = tab => {
		onSelectChat(null);
		onChangeTab(tab);
	};

	const [isShowSearchChats, setIsShowSearchChats] = useState(false);
	const handleOnCloseSearchChats = () => {
		onSearchChats('');
		setIsShowSearchChats(false);
	};
	const onSearchChatsDebounce = useDebounce(onSearchChats);

	const [isShowSearchMessages, setIsShowSearchMessages] = useState(false);
	const handleOnCloseSearchMessages = () => {
		onSearchMessages('');
		setIsShowSearchMessages(false);
	};
	const onSearchMessagesDebounce = useDebounce(onSearchMessages);

	return (
		<Paper className={classes.container}>
			<div className={classes.leftContainer}>
				<div className={classes.header}>
					{isShowSearchChats ? (
						<TextField
							aria-label="Поиск чатов"
							variant="outlined"
							fullWidth
							size="small"
							className={classes.searchField}
							InputProps={{
								endAdornment: (
									<IconButton size="small" onClick={handleOnCloseSearchChats}>
										<CloseIcon color="inherit" fontSize="inherit" />
									</IconButton>
								)
							}}
							onChange={event => onSearchChatsDebounce(event.target.value)}
						/>
					) : (
						<HeaderTabs onChange={handleOnChangeTab} />
					)}

					<IconButton onClick={() => setIsShowSearchChats(true)}>
						<SearchIcon />
					</IconButton>
				</div>

				<FuseScrollbars>
					{chats.map(chat => (
						<ChatCard
							key={chat.id}
							isActive={chat.id === selectedChat?.id}
							avatar={chat.avatar}
							title={chat.name}
							subheader={chat.lastMessage?.text ?? ''}
							companyName={chat.companyName}
							status={chat.lastMessage?.status}
							date={chat.lastMessage?.date}
							newMessages={chat.newMessages}
							type={chat.type}
							onClick={() => onSelectChat(chat)}
						/>
					))}
					<div className={classes.observerElement}>
						<ObserverElementChats />
					</div>
				</FuseScrollbars>
			</div>

			<div className={classes.rightContainer}>
				{selectedChat ? (
					<>
						<div className={classes.headerContentMessage}>
							<UserCard
								avatar={selectedChat.avatar}
								title={selectedChat.name}
								subheader={selectedChat.description}
								companyName={selectedChat.companyName}
							/>

							<div className={classes.customHeaderArea}>
								{isShowSearchMessages ? (
									<TextField
										aria-label="Поиск сообщений"
										variant="outlined"
										fullWidth
										size="small"
										className={classes.searchField}
										InputProps={{
											endAdornment: (
												<IconButton size="small" onClick={handleOnCloseSearchMessages}>
													<CloseIcon color="inherit" fontSize="inherit" />
												</IconButton>
											)
										}}
										onChange={event => onSearchMessagesDebounce(event.target.value)}
									/>
								) : (
									customHeaderArea
								)}
							</div>

							<IconButton
								className={classes.searchButtonMessages}
								onClick={() => setIsShowSearchMessages(true)}
							>
								<SearchIcon />
							</IconButton>
						</div>

						<div className={classes.messageContent}>
							<Messages key={selectedChat.id} list={messages} onFetchMessages={onFetchMessages} />

							<div>
								<div className={classes.messageFooterArea}>{customMessageArea}</div>

								<Form onSubmit={onSendMessage} />
							</div>
						</div>
					</>
				) : (
					<div className={classes.notSelectChat}>
						<Typography variant="subtitle1">Выберите чат</Typography>
					</div>
				)}
			</div>
		</Paper>
	);
}
Chat.defaultProps = {
	chats: [],
	messages: [],
	customMessageArea: <></>,
	customHeaderArea: <></>,
	selectedChat: null,
	onSelectChat: () => {},
	onSendMessage: () => {},
	onFetchMessages: () => {},
	onFetchChats: () => {},
	onChangeTab: () => {},
	onSearchChats: () => {},
	onSearchMessages: () => {}
};
Chat.propTypes = {
	chats: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
			avatar: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
			description: PropTypes.string.isRequired,
			companyName: PropTypes.string.isRequired,
			newMessages: PropTypes.number.isRequired,
			type: PropTypes.oneOf(Object.entries(CHAT_TYPE).map(([_, messageStatus]) => messageStatus)),
			lastMessage: PropTypes.shape({
				text: PropTypes.string.isRequired,
				date: PropTypes.instanceOf(Date).isRequired,
				status: PropTypes.string
			})
		})
	),
	messages: PropTypes.arrayOf(
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
	),
	customMessageArea: PropTypes.element,
	customHeaderArea: PropTypes.element,
	selectedChat: PropTypes.shape({
		id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
		avatar: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		description: PropTypes.string.isRequired,
		companyName: PropTypes.string.isRequired,
		newMessages: PropTypes.number.isRequired,
		lastMessage: PropTypes.shape({
			text: PropTypes.string.isRequired,
			date: PropTypes.instanceOf(Date).isRequired,
			status: PropTypes.string
		})
	}),
	onSelectChat: PropTypes.func,
	onSendMessage: PropTypes.func,
	onFetchMessages: PropTypes.func,
	onFetchChats: PropTypes.func,
	onChangeTab: PropTypes.func,
	onSearchChats: PropTypes.func,
	onSearchMessages: PropTypes.func
};
