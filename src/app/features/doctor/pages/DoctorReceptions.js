import React from 'react';
import { useParams } from 'react-router-dom';
import { ListDoctorReceptions } from '../components';

export function DoctorReceptions() {
	const { doctorUuid } = useParams();

	return (
		<div className="md:m-32 m-12">
			<ListDoctorReceptions doctorUuid={doctorUuid} />
		</div>
	);
}
