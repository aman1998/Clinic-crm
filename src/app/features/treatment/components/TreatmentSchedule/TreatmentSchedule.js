import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useQuery } from 'react-query';
import { Calendar } from 'app/common/Calendar';
import { makeStyles, Tabs, Paper } from '@material-ui/core';
import { ChartGanttTreatment } from 'app/bizKITUi';
import { ENTITY, treatmentService } from '../../../../services';
import { OtherInformation } from './OtherInformation';
import { CLINIC, HOME } from './constants';
import { StyledTab } from '../Tabs';

const useStyles = makeStyles(theme => ({
	tabsPaper: {
		width: 'fit-content',
		marginBottom: 32,
		boxShadow: 'none',
		background: 'inherit'
	},
	calendarWrapper: {
		marginBottom: 32
	}
}));

export function TreatmentSchedule() {
	const [treatmentDays, setTreatmentDays] = useState([]);

	const { treatmentUuid } = useParams();

	const classes = useStyles();

	const [currentStatus, setCurrentStatus] = useState(CLINIC);

	const { data: treatmentData } = useQuery([ENTITY.TREATMENTS_SCHEDULE, currentStatus], () => {
		return treatmentService
			.getTreatmentSchedule(treatmentUuid, {
				additional_type: currentStatus === CLINIC ? 'service' : 'medicament'
			})
			.then(({ data }) => data);
	});

	useEffect(() => {
		if (treatmentData) {
			const dates = [];
			treatmentData?.forEach(item => {
				item?.days.forEach(dayItem => {
					if (!dates.includes(dayItem.day)) dates.push(dayItem.day);
				});
			});

			setTreatmentDays(dates);
		}
	}, [treatmentData]);

	return (
		<>
			<div className={classes.calendarWrapper}>
				<Paper className={classes.tabsPaper}>
					<Tabs
						value={currentStatus}
						onChange={(_, value) => setCurrentStatus(value)}
						indicatorColor="primary"
						textColor="primary"
					>
						<StyledTab label="Стационарное" value={CLINIC} />
						<StyledTab label="На дому" value={HOME} />
					</Tabs>
				</Paper>
				<div className="flex ">
					<div className="mr-20">
						<Calendar disabledDates={[]} treatmentDays={treatmentDays || []} />
					</div>
					<OtherInformation treatmentUuid={treatmentUuid} currentStatus={currentStatus} />
				</div>
			</div>
			<ChartGanttTreatment title="Дни лечения" data={treatmentData} treatmentUuid={treatmentUuid} />
		</>
	);
}
