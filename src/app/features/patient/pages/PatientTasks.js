import React from 'react';
import { useParams } from 'react-router-dom';

import { ListPatientTasks } from '../components';

export function PatientTasks() {
	const { patientUuid } = useParams();

	return (
		<div className="md:m-32 m-12">
			<ListPatientTasks patientUuid={patientUuid} />
		</div>
	);
}
