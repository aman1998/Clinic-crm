import React from 'react';
import { useParams } from 'react-router-dom';
import { ListDoctorPatients } from '../components';

export function DoctorPatients() {
	const { doctorUuid } = useParams();

	return (
		<div className="md:m-32 m-12">
			<ListDoctorPatients doctorUuid={doctorUuid} />
		</div>
	);
}
