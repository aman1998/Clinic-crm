import React from 'react';
import { useParams } from 'react-router-dom';
import { ListPatientLaboratory } from '../components';

export function PatientLaboratory() {
	const { patientUuid } = useParams();

	return (
		<div className="md:m-32 m-12">
			<ListPatientLaboratory patientsUuid={patientUuid} />
		</div>
	);
}
