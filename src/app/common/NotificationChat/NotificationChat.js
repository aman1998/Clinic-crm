import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { Badge, ButtonBase, IconButton, Popover } from '@material-ui/core';
import { InsertComment as InsertCommentIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { useHistory } from 'react-router';
import { chatService, ENTITY, ENTITY_DEPS } from '../../services';
import { NotificationChatItem } from './NotificationChatItem';
import { Button } from '../../bizKITUi';
import { EVENT_NEW, EVENT_TYPE_CONVERSATION, EVENT_TYPE_MESSAGE } from '../../services/chat/constants';

const useStyles = makeStyles(theme => ({
	list: {
		width: '400px',
		maxWidth: '100%'
	},
	tabHeader: {
		display: 'flex',
		alignItems: 'center',
		padding: '20px'
	},
	tabButton: {
		marginRight: '15px',
		fontSize: '1.4rem'
	},
	tabButtonActive: {
		fontWeight: 600,
		color: '#007BFF'
	},
	spacing: {
		padding: 20,
		borderTop: `1px solid ${theme.palette.grey[300]}`
	},
	item: {
		borderTop: `1px solid ${theme.palette.grey[300]}`
	},
	nextFetchButton: {
		padding: 20,
		textAlign: 'center'
	}
}));

export function NotificationChat() {
	const classes = useStyles();
	const history = useHistory();
	const queryClient = useQueryClient();

	const [tab, setTab] = useState(0);
	const [anchorEl, setAnchorEl] = useState(null);

	const [limitNewConversations, setLimitNewConversations] = useState(20);
	const queryKeyNewConversations = [ENTITY.CONVERSATION, { is_new: true, limit: limitNewConversations }];
	const {
		data: newConversations,
		isLoading: isLoadingNewConversations,
		isFetching: isFetchingNewConversations
	} = useQuery(queryKeyNewConversations, ({ queryKey }) => chatService.getConversations(queryKey[1]), {
		keepPreviousData: true
	});
	const handleOnNextFetchNewConversations = () => {
		setLimitNewConversations(limitNewConversations * 2);
	};

	const [limitConversations, setLimitConversations] = useState(20);
	const { data: conversations, isLoading: isLoadingConversations, isFetching: isFetchingConversations } = useQuery(
		[ENTITY.CONVERSATION, { limit: limitConversations }],
		({ queryKey }) => chatService.getConversations(queryKey[1]),
		{ keepPreviousData: true, enabled: !!anchorEl }
	);
	const handleOnNextFetchConversations = () => {
		setLimitConversations(limitConversations * 2);
	};

	const handleOnRedirect = conversationUuid => {
		history.push(`/reception/chat?conversationUuid=${conversationUuid}`);
		setAnchorEl(null);
	};

	useEffect(() => {
		const unsubscribeChat = chatService.subscribeChat(({ event, event_type, data }) => {
			if (
				(event === EVENT_NEW && event_type === EVENT_TYPE_CONVERSATION) ||
				(event === EVENT_NEW && event_type === EVENT_TYPE_MESSAGE)
			) {
				ENTITY_DEPS.CONVERSATION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
			}
		});

		return () => unsubscribeChat();
	}, [queryClient]);

	return (
		<>
			<IconButton onClick={event => setAnchorEl(event.currentTarget)}>
				<Badge badgeContent={newConversations?.count} color="error">
					<InsertCommentIcon color="primary" />
				</Badge>
			</IconButton>

			<Popover
				open={!!anchorEl}
				anchorEl={anchorEl}
				onClose={() => setAnchorEl(null)}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right'
				}}
			>
				<div className={classes.list}>
					<div className={classes.tabHeader}>
						<ButtonBase
							className={clsx(classes.tabButton, { [classes.tabButtonActive]: tab === 0 })}
							type="button"
							onClick={() => setTab(0)}
						>
							Новые({newConversations?.count})
						</ButtonBase>
						<ButtonBase
							className={clsx(classes.tabButton, { [classes.tabButtonActive]: tab === 1 })}
							type="button"
							onClick={() => setTab(1)}
						>
							Все чаты({conversations?.count})
						</ButtonBase>
					</div>

					{tab === 0 && (
						<>
							{newConversations?.count === 0 ? (
								<div className={classes.spacing}>Нет новых сообщений</div>
							) : (
								<>
									{newConversations?.results.map(newConversation => (
										<div key={newConversation.uuid} className={classes.item}>
											<NotificationChatItem
												conversation={newConversation}
												onClick={() => handleOnRedirect(newConversation.uuid)}
											/>
										</div>
									))}

									{limitNewConversations < newConversations?.count && (
										<div className={classes.nextFetchButton}>
											<Button
												textNormal
												variant="outlined"
												disabled={
													isLoadingNewConversations ||
													isLoadingConversations ||
													isFetchingNewConversations ||
													isFetchingConversations
												}
												onClick={handleOnNextFetchNewConversations}
											>
												Показать ещё
											</Button>
										</div>
									)}
								</>
							)}
						</>
					)}

					{tab === 1 && (
						<>
							{conversations?.count === 0 ? (
								<div className={classes.spacing}>Нет чатов</div>
							) : (
								<>
									{conversations?.results.map(conversation => (
										<div key={conversation.uuid} className={classes.item}>
											<NotificationChatItem
												conversation={conversation}
												onClick={() => handleOnRedirect(conversation.uuid)}
											/>
										</div>
									))}

									{limitConversations < conversations?.count && (
										<div className={classes.nextFetchButton}>
											<Button
												textNormal
												variant="outlined"
												onClick={handleOnNextFetchConversations}
											>
												Показать ещё
											</Button>
										</div>
									)}
								</>
							)}
						</>
					)}
				</div>
			</Popover>
		</>
	);
}
