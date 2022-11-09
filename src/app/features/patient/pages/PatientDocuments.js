import React from 'react';
import { useParams } from 'react-router-dom';
import { ListPatientDocuments } from '../components/ListPatientDocuments';

export function PatientDocuments() {
	const { patientUuid } = useParams();

	return (
		<div className="md:m-32 m-12">
			<ListPatientDocuments patientsUuid={patientUuid} />
		</div>
	);
}
