import React from 'react';
import { useParams } from 'react-router-dom';
import { PatientInformation } from '../components/PatientInformation';

export function PatientInfo() {
	const { patientUuid } = useParams();

	return <PatientInformation patientUuid={patientUuid} />;
}
