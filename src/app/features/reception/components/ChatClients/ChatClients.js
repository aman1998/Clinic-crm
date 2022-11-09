import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from 'react-query';
import moment from 'moment';
import { IconButton, Paper } from '@material-ui/core';
import { Create as CreateIcon } from '@material-ui/icons';
import { Button, TextField } from '../../../../bizKITUi';
import { Chat } from '../../../../bizKITUi/Chat';
import { chatService, ENTITY, ENTITY_DEPS } from '../../../../services';
import { modalPromise } from '../../../../common/ModalPromise';
import { getFullName } from '../../../../utils';
import { CallButton } from '../../../../common/CallButton';
import { ModalPatient } from '../../../../common/ModalPatient';
import { useAlert, useDebouncedFilterForm } from '../../../../hooks';
import { FooterMessages } from './FooterMessages';
import {
	STATUS_MESSAGE_PREPARING,
	STATUS_MESSAGE_READ,
	STATUS_MESSAGE_DELIVERED,
	STATUS_MESSAGE_SENT,
	EVENT_ACK,
	EVENT_NEW,
	EVENT_TYPE_MESSAGE,
	EVENT_TYPE_CONVERSATION
} from '../../../../services/chat/constants';

const MAP_STATUS_MESSAGE = {
	[STATUS_MESSAGE_PREPARING]: 'IS_WAIT',
	[STATUS_MESSAGE_READ]: 'IS_READ',
	[STATUS_MESSAGE_DELIVERED]: 'IS_DELIVERED',
	[STATUS_MESSAGE_SENT]: 'IS_SENT'
};

function getFormattedChat(chat) {
	if (!chat) {
		return null;
	}

	return {
		id: chat.uuid,
		avatar: chat.avatar,
		name: chat.patient ? getFullName(chat.patient) : chat.main_phone,
		description: chat.patient ? chat.main_phone : '',
		companyName: chat.company?.name ?? '',
		newMessages: chat.unread_messages,
		type: chat.channel_type,
		lastMessage: chat.last_message
			? {
					text: chat.last_message?.message ?? '',
					date: moment(chat.last_message.created_at).toDate(),
					status: MAP_STATUS_MESSAGE[chat.last_message.status]
			  }
			: null
	};
}

function getFormattedMessage(message) {
	return {
		id: message.uuid,
		text: message.message,
		audio: message.audio_path,
		isIncome: message.income,
		isNew: message.is_new,
		status: MAP_STATUS_MESSAGE[message.status],
		date: moment(message.created_at).toDate(),
		files: message.attachments?.map(attachment => attachment.url) ?? []
	};
}

const LIMIT_MESSAGES = 20;
const LIMIT_CONVERSATIONS = 20;

export function ChatClients({ conversationUuid }) {
	const queryClient = useQueryClient();
	const { alertError } = useAlert();

	const { form, debouncedForm, handleChange, resetForm } = useDebouncedFilterForm({
		account_name: ''
	});

	const [currentSelectedConversation, setCurrentSelectedConversation] = useState(null);

	const [textSearchConversations, setTextSearchConversations] = useState('');
	const [isNewConversations, setIsNewConversations] = useState(true);
	const [limitConversations, setLimitConversations] = useState(LIMIT_CONVERSATIONS);
	const conversationsQueryKey = useMemo(
		() => [
			ENTITY.CONVERSATION,
			{ name: textSearchConversations, is_new: isNewConversations, limit: limitConversations, ...debouncedForm }
		],
		[debouncedForm, isNewConversations, limitConversations, textSearchConversations]
	);
	const { data: conversations, isLoading: isLoadingConversations, isFetching: isFetchingConversations } = useQuery(
		conversationsQueryKey,
		({ queryKey }) => chatService.getConversations({ ...queryKey[1] }),
		{
			retry: true,
			keepPreviousData: true
		}
	);
	const handleOnFetchNextConversations = () => {
		if (isLoadingConversations || isFetchingConversations || conversations?.count <= limitConversations) {
			return;
		}

		setLimitConversations(limitConversations * 2);
	};

	const [textSearchMessages, setTextSearchMessages] = useState('');
	const messageQueryKey = useMemo(
		() => [
			ENTITY.CONVERSATION_MESSAGE,
			{ message: textSearchMessages, conversation: currentSelectedConversation?.uuid, limit: LIMIT_MESSAGES }
		],
		[currentSelectedConversation, textSearchMessages]
	);
	const {
		data: conversationMessages,
		fetchNextPage: fetchNextMessages,
		hasNextPage: hasNextMessages,
		isFetchingNextPage: isFetchingNextMessages
	} = useInfiniteQuery(
		messageQueryKey,
		({ queryKey, pageParam = 0 }) => chatService.getMessages({ ...queryKey[1], offset: pageParam }),
		{
			enabled: !!currentSelectedConversation,
			retry: true,
			cacheTime: 0,
			getNextPageParam: (lastPage, pages) =>
				lastPage.count > pages.length * LIMIT_MESSAGES ? pages.length * LIMIT_MESSAGES : false
		}
	);
	const conversationMessagesList = useMemo(
		() => conversationMessages?.pages.reduce((prev, current) => [...prev, ...current.results] ?? [], []),
		[conversationMessages]
	);
	const handleOnFetchNextMessages = () => {
		if (!hasNextMessages || isFetchingNextMessages) {
			return;
		}

		fetchNextMessages();
	};

	useQuery([conversationUuid], ({ queryKey }) => chatService.getConversation(queryKey), {
		onSuccess(data) {
			setCurrentSelectedConversation(data);
		},
		enabled: !!conversationUuid
	});

	const handleOnSearchConversations = text => {
		setIsNewConversations(false);
		setTextSearchConversations(text);
	};

	const handleOnAddPatient = () => {
		let initialValues = '';
		switch (currentSelectedConversation.channel_type) {
			case 'instagram':
				initialValues = { instagram_username: currentSelectedConversation.main_phone };
				break;
			case 'whatsapp':
				initialValues = { main_phone: currentSelectedConversation.main_phone };
				break;
			default:
				initialValues = '';
		}

		modalPromise.open(({ onClose }) => <ModalPatient isOpen initialValues={initialValues} onClose={onClose} />);
	};

	const sendMessage = useMutation(payload => chatService.sendMessage(payload));
	const handleOnSendMessage = ({ text, files }) => {
		sendMessage
			.mutateAsync({ message: text, files, conversation: currentSelectedConversation.uuid })
			.catch(() => alertError('Не удалось отправить сообщение'));
	};

	const chatMessages = useMemo(() => conversationMessagesList?.map(getFormattedMessage) ?? [], [
		conversationMessagesList
	]);
	const chats = useMemo(
		() =>
			conversations?.results.map(conversation =>
				getFormattedChat({
					...conversation,
					unread_messages:
						conversation.uuid === currentSelectedConversation?.uuid ? 0 : conversation.unread_messages
				})
			) ?? [],
		[conversations, currentSelectedConversation]
	);

	useEffect(() => {
		const conversation =
			currentSelectedConversation &&
			conversations?.results.find(({ uuid }) => uuid === currentSelectedConversation.uuid);

		if (!conversation?.unread_messages) {
			return;
		}

		chatService.readMessages(currentSelectedConversation.uuid).then(() => {
			ENTITY_DEPS.CONVERSATION.forEach(dep => {
				queryClient.invalidateQueries(dep);
			});
		});
	}, [chats, conversations, currentSelectedConversation, queryClient]);

	const handleOnChangeChatTabs = tab => {
		switch (tab) {
			case 0:
				setIsNewConversations(true);
				break;
			case 1:
				setIsNewConversations(false);
				break;
			default:
		}
	};

	const handleOnSelectChat = chat => {
		if (!chat) {
			setCurrentSelectedConversation(null);

			return;
		}

		setCurrentSelectedConversation(conversations.results.find(conversation => conversation.uuid === chat.id));
	};

	const updateMessage = useCallback(
		message => {
			if (message.conversation !== currentSelectedConversation?.uuid) {
				return;
			}

			queryClient.setQueryData(messageQueryKey, state => ({
				pages: state.pages.map(page => ({
					...page,
					results: page.results.map(result =>
						result.uuid === message.uuid ? { ...result, ...message } : result
					)
				})),
				pageParams: state.pageParams
			}));
		},
		[currentSelectedConversation, messageQueryKey, queryClient]
	);

	const addNewMessage = useCallback(
		message => {
			if (message.conversation !== currentSelectedConversation?.uuid) {
				ENTITY_DEPS.CONVERSATION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});

				return;
			}

			if (textSearchMessages) {
				return;
			}

			queryClient.setQueryData(messageQueryKey, state => {
				const newPages = state.pages.map(page => ({ ...page, count: page.count + 1 }));

				if (newPages[0].results.length >= LIMIT_MESSAGES) {
					return {
						pages: [{ count: newPages[0].count, results: [message] }, ...newPages],
						pageParams: [
							0,
							...state.pageParams.map(pageParam =>
								pageParam ? pageParam + LIMIT_MESSAGES : LIMIT_MESSAGES
							)
						]
					};
				}

				newPages[0] = {
					...newPages[0],
					results: [message, ...newPages[0].results]
				};

				return {
					pages: newPages,
					pageParams: state.pageParams
				};
			});
		},
		[currentSelectedConversation, messageQueryKey, queryClient, textSearchMessages]
	);

	const addNewConversation = useCallback(() => {
		ENTITY_DEPS.CONVERSATION.forEach(dep => {
			queryClient.invalidateQueries(dep);
		});
	}, [queryClient]);

	useEffect(() => {
		const unsubscribeChat = chatService.subscribeChat(({ event, event_type, data }) => {
			switch (true) {
				case event === EVENT_ACK && event_type === EVENT_TYPE_MESSAGE:
					updateMessage(data);
					break;
				case event === EVENT_NEW && event_type === EVENT_TYPE_MESSAGE:
					addNewMessage(data);
					break;
				case event === EVENT_NEW && event_type === EVENT_TYPE_CONVERSATION:
					addNewConversation();
					break;
				default:
			}
		});

		return () => unsubscribeChat();
	}, [addNewConversation, addNewMessage, updateMessage]);

	return (
		<>
			<Paper className="flex p-12 mb-32 gap-10">
				<TextField
					label="Поиск по аккаунту"
					type="text"
					variant="outlined"
					size="small"
					name="account_name"
					className="w-320"
					value={form.account_name}
					onChange={handleChange}
				/>

				<Button textNormal color="primary" variant="outlined" className="ml-auto" onClick={() => resetForm()}>
					Сбросить
				</Button>
			</Paper>

			<Chat
				chats={chats}
				messages={chatMessages}
				customMessageArea={<FooterMessages conversation={currentSelectedConversation} />}
				customHeaderArea={
					<div>
						{currentSelectedConversation?.patient ? (
							<IconButton
								color="primary"
								onClick={() =>
									modalPromise.open(({ onClose }) => (
										<ModalPatient
											isOpen
											patientsUuid={currentSelectedConversation.patient.uuid}
											onClose={onClose}
										/>
									))
								}
							>
								<CreateIcon />
							</IconButton>
						) : (
							<Button variant="text" textNormal onClick={handleOnAddPatient}>
								Добавить пациента
							</Button>
						)}

						<CallButton phoneNumber={currentSelectedConversation?.main_phone} />
					</div>
				}
				selectedChat={getFormattedChat(currentSelectedConversation)}
				onSelectChat={handleOnSelectChat}
				onSendMessage={handleOnSendMessage}
				onFetchMessages={handleOnFetchNextMessages}
				onFetchChats={handleOnFetchNextConversations}
				onChangeTab={handleOnChangeChatTabs}
				onSearchChats={handleOnSearchConversations}
				onSearchMessages={setTextSearchMessages}
			/>
		</>
	);
}
ChatClients.defaultProps = {
	conversationUuid: null
};
ChatClients.propTypes = {
	conversationUuid: PropTypes.string
};
