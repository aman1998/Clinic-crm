import React from 'react';
import PropTypes from 'prop-types';
import { Divider, Grid, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from 'react-query';
import { FormPatient } from '../../../../common/FormPatient';
import { Amount } from '../../../../bizKITUi';
import { ENTITY, patientsService } from '../../../../services';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { BonusHistoryTable } from './BonusHistoryTable';

const useStyles = makeStyles(theme => ({
	bonus: {
		color: theme.palette.success.main,
		fontSize: 16,
		fontWeight: 'bold'
	}
}));

export function PatientInformation({ patientUuid }) {
	const classes = useStyles();

	const { isLoading, isError, data } = useQuery({
		queryKey: [ENTITY.PATIENT, patientUuid],
		queryFn: ({ queryKey }) => patientsService.getPatientByUuid(queryKey[1]).then(res => res.data),
		enabled: !!patientUuid
	});

	if (isError) {
		return <ErrorMessage />;
	}

	if (isLoading) {
		return <FuseLoading />;
	}

	return (
		<Grid className="md:p-32 p-12" container spacing={4}>
			<Grid item md={6} xs={12}>
				<Paper className="p-20">
					<Typography variant="subtitle1" className="pb-20">
						Основная информация
					</Typography>
					<Divider />
					<FormPatient patientsUuid={patientUuid} />
				</Paper>
			</Grid>
			<Grid item md={6} xs={12}>
				<Paper className="md:mb-32 mb-16 p-20 flex justify-between items-center">
					<Typography variant="subtitle1">Бонусный баланс</Typography>
					<Amount className={classes.bonus} value={data.bonuses_balance} />
				</Paper>
				<BonusHistoryTable patientUuid={patientUuid} />
			</Grid>
		</Grid>
	);
}

PatientInformation.propTypes = {
	patientUuid: PropTypes.string.isRequired
};
