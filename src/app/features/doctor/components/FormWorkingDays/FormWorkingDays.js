import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import moment from 'moment';
import {
	List,
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
	Switch,
	Divider,
	Grid,
	Collapse
} from '@material-ui/core';
import { TimePickerField, Button } from '../../../../bizKITUi';
import { employeesService, ENTITY, ENTITY_DEPS } from '../../../../services';
import { WEEKDAYS } from '../../../../services/employees/constants';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { useAlert } from '../../../../hooks';

const getDefaultWorkingDay = weekDay => ({
	week_day: weekDay,
	lunch_start_time: '13:00:00',
	lunch_end_time: '14:00:00',
	start_time: '09:00:00',
	end_time: '18:00:00'
});

const DAYS = [
	WEEKDAYS.MONDAY,
	WEEKDAYS.TUESDAY,
	WEEKDAYS.WEDNESDAY,
	WEEKDAYS.THURSDAY,
	WEEKDAYS.FRIDAY,
	WEEKDAYS.SATURDAY,
	WEEKDAYS.SUNDAY
];
const DAYS_TITLE = {
	[WEEKDAYS.MONDAY]: 'Понедельник',
	[WEEKDAYS.TUESDAY]: 'Вторник',
	[WEEKDAYS.WEDNESDAY]: 'Среда',
	[WEEKDAYS.THURSDAY]: 'Четверг',
	[WEEKDAYS.FRIDAY]: 'Пятница',
	[WEEKDAYS.SATURDAY]: 'Суббота',
	[WEEKDAYS.SUNDAY]: 'Воскресенье'
};

function fillEmptyDays(listWorkingDays) {
	return DAYS.map(day => listWorkingDays.find(item => item.week_day === day) ?? getDefaultWorkingDay(day));
}

function timeToISO(time) {
	return moment(time, 'HH:mm:ss').toISOString();
}

export function FormWorkingDays({ doctorUuid }) {
	const { alertSuccess, alertError } = useAlert();
	const queryClient = useQueryClient();

	const [daySwitchState, setDaySwitchState] = useState({
		[WEEKDAYS.MONDAY]: false,
		[WEEKDAYS.TUESDAY]: false,
		[WEEKDAYS.WEDNESDAY]: false,
		[WEEKDAYS.THURSDAY]: false,
		[WEEKDAYS.FRIDAY]: false,
		[WEEKDAYS.SATURDAY]: false,
		[WEEKDAYS.SUNDAY]: false
	});

	const { isLoading, isError, data } = useQuery([ENTITY.DOCTOR, doctorUuid], () =>
		employeesService.getDoctor(doctorUuid).then(({ data: response }) => response)
	);
	const [workingDays, setWorkingDays] = useState([]);
	useEffect(() => {
		if (!data) {
			return;
		}
		setWorkingDays(fillEmptyDays(data.working_days ?? []));
		DAYS.forEach(day => {
			setDaySwitchState(state => ({ ...state, [day]: data.working_days?.some(item => item.week_day === day) }));
		});
	}, [data]);

	const updateWorkingDays = useMutation(({ uuid, payload }) =>
		employeesService.changeDoctorWorkingDays(uuid, payload)
	);
	const handleSubmit = () => {
		const currentBranch = localStorage.getItem('branch') ?? null;

		const payload = {
			branch: [currentBranch], // The array will always have one value. Ideally, you should send a string, but the backend asks for an array
			working_days: workingDays
				.filter(item => daySwitchState[item.week_day])
				.map(item => {
					const newItem = {
						...item,
						branch: currentBranch
					};
					return newItem;
				})
		};
		updateWorkingDays
			.mutateAsync({ uuid: doctorUuid, payload })
			.then(() => {
				alertSuccess('Расписание успешно сохранено');
				ENTITY_DEPS.DOCTOR.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
			})
			.catch(error => {
				alertError('Не удалось обновить расписание');
			});
	};

	const handleChangeTime = (weekDay, field, date) => {
		const newValue = workingDays.map(item => {
			if (item.week_day === weekDay) {
				const time = moment(date).isValid() ? moment(date).format('HH:mm:ss') : null;
				return { ...item, [field]: time };
			}
			return item;
		});
		setWorkingDays(newValue);
	};

	if (isLoading) {
		return <FuseLoading />;
	}
	if (isError) {
		return <ErrorMessage />;
	}
	return (
		<>
			<List>
				{workingDays.map(item => (
					<Fragment key={item.week_day}>
						<ListItem>
							<ListItemText primary={DAYS_TITLE[item.week_day]} />
							<ListItemSecondaryAction>
								<Switch
									checked={daySwitchState[item.week_day]}
									onChange={() =>
										setDaySwitchState(state => ({
											...state,
											[item.week_day]: !state[item.week_day]
										}))
									}
									edge="end"
								/>
							</ListItemSecondaryAction>
						</ListItem>
						<Collapse in={daySwitchState[item.week_day]} timeout="auto" unmountOnExit>
							<Grid className="p-10 pt-20 pb-20" container spacing={2}>
								<Grid item xs={6}>
									<TimePickerField
										onChange={date => handleChangeTime(item.week_day, 'start_time', date)}
										value={timeToISO(item.start_time)}
										label="Начало работы"
									/>
								</Grid>
								<Grid item xs={6}>
									<TimePickerField
										onChange={date => handleChangeTime(item.week_day, 'end_time', date)}
										value={timeToISO(item.end_time)}
										label="Конец работы"
									/>
								</Grid>
								<Grid item xs={6}>
									<TimePickerField
										onChange={date => handleChangeTime(item.week_day, 'lunch_start_time', date)}
										value={timeToISO(item.lunch_start_time)}
										label="Начало обеда"
									/>
								</Grid>
								<Grid item xs={6}>
									<TimePickerField
										onChange={date => handleChangeTime(item.week_day, 'lunch_end_time', date)}
										value={timeToISO(item.lunch_end_time)}
										label="Конец обеда"
									/>
								</Grid>
							</Grid>
						</Collapse>
						<Divider />
					</Fragment>
				))}
			</List>

			<div className="pt-20">
				<Button textNormal onClick={handleSubmit} disabled={updateWorkingDays.isLoading}>
					Сохранить
				</Button>
			</div>
		</>
	);
}

FormWorkingDays.propTypes = {
	doctorUuid: PropTypes.string.isRequired
};
