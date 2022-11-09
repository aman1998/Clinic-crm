import React from 'react';
import { useParams } from 'react-router';
import { FormDocumentTemplateEdit } from '../components/FormDocumentTemplateEdit';
import { useToolbarTitle } from '../../../hooks';

export default function SettingsDocumentTemplateEdit() {
	useToolbarTitle('Документы');
	const { documentTemplateUuid } = useParams();

	return (
		<div className="md:m-32 m-12">
			<FormDocumentTemplateEdit documentTemplateUuid={documentTemplateUuid} />
		</div>
	);
}
