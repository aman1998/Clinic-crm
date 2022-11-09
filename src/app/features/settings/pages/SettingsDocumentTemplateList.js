import React from 'react';
import { ListDocumentTemplate } from '../components/ListDocumentTemplate';
import { useToolbarTitle } from '../../../hooks';

export default function SettingsDocumentTemplateList() {
	useToolbarTitle('Документы');

	return (
		<div className="md:m-32 m-12">
			<ListDocumentTemplate />
		</div>
	);
}
