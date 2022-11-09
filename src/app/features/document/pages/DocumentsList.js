import React from 'react';
import { DocumentsList } from '../components/DocumentsList';
import { useToolbarTitle } from '../../../hooks';

export default function () {
	useToolbarTitle('Документы');

	return (
		<div className="m-16">
			<DocumentsList />
		</div>
	);
}
