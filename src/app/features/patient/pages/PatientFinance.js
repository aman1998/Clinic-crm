import React from 'react';
import { useParams } from 'react-router-dom';
import { ListPatientFinance } from '../components';

export function PatientFinance() {
	const { patientUuid } = useParams();

	return (
		<div className="md:m-32 m-12">
			<ListPatientFinance patientsUuid={patientUuid} />
		</div>
	);
}
