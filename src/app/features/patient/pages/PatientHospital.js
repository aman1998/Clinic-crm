import React from 'react';
import { useParams } from 'react-router-dom';
import { ListPatientHospital } from '../components';

export function PatientHospital() {
	const { patientUuid } = useParams();

	return (
		<div className="md:m-32 m-12">
			<ListPatientHospital patientsUuid={patientUuid} />
		</div>
	);
}
