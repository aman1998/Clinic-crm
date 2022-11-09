import React from 'react';
import { useParams } from 'react-router-dom';
import { ListDoctorDailyReports } from '../components';

export function DoctorDailyReports() {
	const { doctorUuid } = useParams();

	return (
		<div className="md:m-32 m-12">
			<ListDoctorDailyReports doctorUuid={doctorUuid} />
		</div>
	);
}
