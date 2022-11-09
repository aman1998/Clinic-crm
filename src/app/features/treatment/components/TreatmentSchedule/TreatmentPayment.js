import React, { useState } from 'react';
import { useParams } from 'react-router';
import { useQuery } from 'react-query';
import { makeStyles, Tabs, Tab, Paper } from '@material-ui/core';
import { treatmentService } from '../../../../services';
import { SERVICES, PAYMENT } from './constants';
import { Payments } from './Payments';

const useStyles = makeStyles(() => ({
	tabsPaper: {
		marginBottom: 25,
		boxShadow: 'none',
		background: 'inherit'
	},
	paymentContentWrapper: {
		marginBottom: 25
	}
}));

export function TreatmentPayment() {
	const { treatmentUuid } = useParams();

	const classes = useStyles();

	const [currentStatus, setCurrentStatus] = useState(PAYMENT);

	const { data: treatmentData } = useQuery([], () => {
		return treatmentService.getTreatmentByUuid(treatmentUuid).then(({ data }) => data);
	});

	const { data: paymentData } = useQuery(
		[treatmentData?.patient_info],
		() => {
			return treatmentService.getPaymentsByUuid(treatmentData?.patient_info.uuid).then(({ data }) => data);
		},
		{
			enabled: !!treatmentData?.patient_info
		}
	);

	return (
		<>
			<div className={classes.paymentContentWrapper}>
				<Paper className={classes.tabsPaper}>
					<Tabs
						value={currentStatus}
						onChange={(_, value) => setCurrentStatus(value)}
						indicatorColor="primary"
						textColor="primary"
					>
						<Tab label="Оплата" value={PAYMENT} />
						<Tab label="Услуги" value={SERVICES} />
					</Tabs>
				</Paper>
				<div className="flex ">
					<Payments
						treatmentUuid={treatmentUuid}
						patientPaymentData={paymentData}
						treatmenPaymentData={treatmentData?.payment_info}
						treatmentServicesData={treatmentData?.services_info}
						currentStatus={currentStatus}
					/>
				</div>
			</div>
		</>
	);
}
