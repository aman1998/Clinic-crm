import React from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import FuseLoading from '../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../common/ErrorMessage';
import { employeesService, ENTITY } from '../../../services';
import { ListDoctorProducts } from '../components';

export function DoctorProducts() {
	const { doctorUuid } = useParams();
	const { isLoading, isError, data } = useQuery([ENTITY.DOCTOR, doctorUuid], () =>
		employeesService.getDoctor(doctorUuid).then(({ data: results }) => results)
	);

	return (
		<div className="md:m-32 m-12">
			{isLoading ? (
				<FuseLoading />
			) : isError ? (
				<ErrorMessage />
			) : !data?.user ? (
				<></>
			) : (
				<ListDoctorProducts userUuid={data.user.uuid} />
			)}
		</div>
	);
}
