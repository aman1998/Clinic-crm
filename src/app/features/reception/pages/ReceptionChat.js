import React from 'react';
import { useLocation } from 'react-router';
import { ChatClients } from '../components';

export default function ReceptionChat() {
	const conversationUuid = new URLSearchParams(useLocation().search).get('conversationUuid');

	return (
		<div className="md:m-32 m-12">
			<ChatClients conversationUuid={conversationUuid} />
		</div>
	);
}
