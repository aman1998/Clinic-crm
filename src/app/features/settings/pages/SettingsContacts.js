import React from 'react';
import { useToolbarTitle } from '../../../hooks';
import { FormClinicInformation } from '../components/FormClinicInformation';

export default function SettingsContacts() {
	useToolbarTitle('Контакты и реквизиты');

	return (
		<div className="md:m-32 m-12">
			<FormClinicInformation />
		</div>
	);
}
