import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Grid, Card, CardHeader, CardContent, Typography, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useToolbarTitle } from '../../../hooks';
import { FormDoctor } from '../components/FormDoctor';
import { FormWorkingDays } from '../components/FormWorkingDays';
import { employeesService, ENTITY } from '../../../services';
import { FormNotifications } from '../../../common/FormNotifications';
import { getFullName } from '../../../utils';
import { CalendarWeekendDays } from '../components/CalendarWeekendDays';

const useStyles = makeStyles(theme => ({
	card: {
		marginBottom: theme.spacing(2)
	}
}));

export function DoctorEdit() {
	const classes = useStyles();
	const { doctorUuid } = useParams();

	const { data } = useQuery([ENTITY.DOCTOR, doctorUuid], () => employeesService.getDoctor(doctorUuid));

	useToolbarTitle(getFullName(data ?? {}));

	return (
		<>
			<div className="md:m-32 m-12">
				<Grid container spacing={2}>
					<Grid item md={6} xs={12}>
						<Card className={classes.card}>
							<CardHeader
								title={
									<Typography color="secondary" variant="body1">
										Общая информация
									</Typography>
								}
							/>
							<Divider />
							<CardContent>
								<FormDoctor uuid={doctorUuid} />
							</CardContent>
						</Card>
						<CalendarWeekendDays doctorUuid={doctorUuid} />
					</Grid>
					<Grid item md={6} xs={12}>
						<Card className={classes.card}>
							<CardHeader
								title={
									<Typography color="secondary" variant="body1">
										Настройка рабочего времени
									</Typography>
								}
							/>
							<Divider />
							<CardContent>
								<FormWorkingDays doctorUuid={doctorUuid} />
							</CardContent>
						</Card>
						<Card>
							<CardHeader
								title={
									<Typography color="secondary" variant="body1">
										Настройка уведомлений
									</Typography>
								}
							/>
							<Divider />
							<CardContent>
								<FormNotifications />
							</CardContent>
						</Card>
					</Grid>
				</Grid>
			</div>
		</>
	);
}
