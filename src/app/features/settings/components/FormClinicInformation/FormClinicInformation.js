import React from 'react';
import { useQueries } from 'react-query';
import { Grid } from '@material-ui/core';
import { clinicService } from '../../../../services/clinic';
import { ENTITY } from '../../../../services';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { FormRequisiteInfo } from './FormRequisiteInfo';
import { FormContactInfo } from './FormContactInfo';

export function FormClinicInformation() {
	const [
		{ isLoading: isLoadingContactData, isError: irErrorContactData, data: contactData },
		{ isLoading: isLoadingRequisiteData, isError: isErrorRequisiteData, data: requisiteData }
	] = useQueries([
		{
			queryKey: [ENTITY.CLINIC_INFORMATION],
			queryFn: () => clinicService.getContactInfo().then(data => data?.results?.[0])
		},
		{
			queryKey: [ENTITY.CLINIC_REQUISITE],
			queryFn: () => clinicService.getRequisiteInfo().then(data => data?.results?.[0])
		}
	]);

	if (isLoadingContactData || isLoadingRequisiteData) {
		return <FuseLoading />;
	}
	if (irErrorContactData || isErrorRequisiteData) {
		return <ErrorMessage />;
	}
	return (
		<Grid container spacing={2}>
			<Grid item md={6} xs={12}>
				<FormContactInfo contact={contactData} uuid={contactData?.uuid} />
			</Grid>
			<Grid item md={6} xs={12}>
				<FormRequisiteInfo requisite={requisiteData} uuid={requisiteData?.uuid} />
			</Grid>
		</Grid>
	);
}
