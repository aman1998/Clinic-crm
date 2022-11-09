import React from 'react';
import { useParams } from 'react-router-dom';
import { ListPatientReceptions } from '../components';

export function PatientReceptions() {
	const { patientUuid } = useParams();

	return (
		<div className="md:m-32 m-12">
			<ListPatientReceptions patientsUuid={patientUuid} />
		</div>
	);
}
