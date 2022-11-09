import React, { useMemo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useQuery } from 'react-query';
import { ChartGantt } from '../../bizKITUi';
import { useObserverElement } from '../../hooks';
import { employeesService, equipmentsService, ENTITY } from '../../services';
import { defaults, getFullName } from '../../utils';
import { ReceptionSegment } from '../ReceptionSegment';
import { OperationSegment } from './OperationSegment';
import { DisabledSegment } from './DisabledSegment';
import { ErrorMessage } from '../ErrorMessage';
import {
	TYPE_SERVICE_COMMON,
	MONDAY_NAME,
	FRIDAY_NAME,
	SATURDAY_NAME,
	SUNDAY_NAME,
	THURSDAY_NAME,
	TUESDAY_NAME,
	WEDNESDAY_NAME
} from '../../services/clinic/constants';
import FuseLoading from '../../../@fuse/core/FuseLoading';

const defaultValues = {
	type: TYPE_SERVICE_COMMON,
	timeStart: null,
	timeEnd: null,
	dateReceipt: moment().toDate(),
	direction: null,
	doctor: null,
	service: null,
	offset: 0
};

function mergeDateWithTime(date, time) {
	const dateTime = moment(time);

	return moment(date)
		.set({
			hour: dateTime.get('hour'),
			minute: dateTime.get('minute'),
			second: dateTime.get('second')
		})
		.startOf('second')
		.toDate();
}

const mapDaysOfWeek = {
	[SUNDAY_NAME]: 0,
	[MONDAY_NAME]: 1,
	[TUESDAY_NAME]: 2,
	[WEDNESDAY_NAME]: 3,
	[THURSDAY_NAME]: 4,
	[FRIDAY_NAME]: 5,
	[SATURDAY_NAME]: 6
};

function getDisabledSegments(workingDays, dateReceipt) {
	const currentDay = moment(dateReceipt).day();
	const workingDay = workingDays.find(({ week_day }) => mapDaysOfWeek[week_day] === currentDay);

	if (!workingDay) {
		return [
			{
				id: 'dayOff',
				start: moment(dateReceipt).startOf('day').toDate(),
				end: moment(dateReceipt).hour(24).startOf('hour').toDate(),
				content: () => <DisabledSegment hint="Доктор не работает в это день" />
			}
		];
	}

	return [
		{
			id: 'lunch',
			start: mergeDateWithTime(dateReceipt, moment(workingDay.lunch_start_time, 'HH:mm:ss').toDate()),
			end: mergeDateWithTime(dateReceipt, moment(workingDay.lunch_end_time, 'HH:mm:ss').toDate()),
			content: () => <DisabledSegment hint="Обед" />
		},
		{
			id: 'startDay',
			start: moment(dateReceipt).startOf('day').toDate(),
			end: mergeDateWithTime(dateReceipt, moment(workingDay.start_time, 'HH:mm:ss').toDate()),
			content: () => <DisabledSegment hint="Доктор не работает в это время" />
		},
		{
			id: 'endDay',
			start: mergeDateWithTime(dateReceipt, moment(workingDay.end_time, 'HH:mm:ss').toDate()),
			end: moment(dateReceipt).hour(24).startOf('hour').toDate(),
			content: () => <DisabledSegment hint="Доктор не работает в это время" />
		}
	];
}

export function ChartDoctorsSchedule({ value, duration, initialValues, onChange, onClickReception, onClickOperation }) {
	const [limit, setLimit] = useState(6);
	const [values, setValues] = useState(defaults(initialValues, defaultValues));
	useEffect(() => {
		setValues(defaults(initialValues, defaultValues));
	}, [initialValues]);

	const { timeStart, timeEnd, dateReceipt } = values;
	const fetchingValues = {
		date: moment(values.dateReceipt).format('DD.MM.YYYY'),
		direction: values.direction,
		doctor: values.doctor,
		limit
	};

	const {
		isLoading: isLoadingDoctorsSchedule,
		isFetching: isFetchingDoctorsSchedule,
		isError: isErrorDoctorsSchedule,
		data: doctorsSchedule
	} = useQuery(
		[ENTITY.DOCTOR_SCHEDULE, fetchingValues],
		({ queryKey }) => employeesService.getDoctorsSchedule(queryKey[1]).then(response => response.data),
		{ keepPreviousData: true }
	);

	const {
		isFetching: isFetchingEquipmentReceptions,
		isError: isErrorEquipmentReceptions,
		data: equipmentReceptions
	} = useQuery(
		[ENTITY.RECEPTION_EQUIPMENT, { service: values.service, limit: Number.MAX_SAFE_INTEGER }],
		({ queryKey }) => equipmentsService.getEquipmentReceptions(queryKey[1]),
		{ keepPreviousData: true, enabled: !!values.service }
	);

	const ObserverElement = useObserverElement(() => {
		if (isLoadingDoctorsSchedule || doctorsSchedule?.count <= limit) {
			return;
		}

		setLimit(limit * 2);
	});

	const optimalTimeRange = useMemo(() => {
		let start = null;
		let end = null;

		doctorsSchedule?.results.forEach(doctorSchedule => {
			const workingDay = doctorSchedule.working_days.find(
				({ week_day }) => mapDaysOfWeek[week_day] === moment(dateReceipt).day()
			);

			if (!workingDay) {
				return;
			}

			const startInMs = moment(
				mergeDateWithTime(dateReceipt, moment(workingDay.start_time, 'HH:mm:ss'))
			).valueOf();
			const endInMs = moment(mergeDateWithTime(dateReceipt, moment(workingDay.end_time, 'HH:mm:ss'))).valueOf();

			if (!start || startInMs < moment(start).valueOf()) {
				start = moment(startInMs).toDate();
			}

			if (!end || endInMs > moment(end).valueOf()) {
				end = moment(endInMs).toDate();
			}
		});

		return {
			start: start ?? moment(dateReceipt).set({ hour: 8 }).startOf('hour').toDate(),
			end: end ?? moment(dateReceipt).set({ hour: 18 }).startOf('hour').toDate()
		};
	}, [dateReceipt, doctorsSchedule]);

	const [additionalRows, setAdditionalRows] = useState({});
	useEffect(() => {
		setAdditionalRows({});
	}, [dateReceipt, doctorsSchedule]);

	const dataChart = useMemo(() => {
		const dataChartDoctorSchedule = [];
		const dataEquipmentReceptions = [];
		const disabledChartDoctorSchedule = [];

		if (equipmentReceptions) {
			for (const equipmentReception of equipmentReceptions.results) {
				equipmentReception.receptions.forEach(reception => {
					disabledChartDoctorSchedule.push({
						id: `${equipmentReception.uuid}${reception.uuid}`,
						start: moment(reception.date_time).toDate(),
						end: moment(reception.date_time).add(reception.duration, 'minute').toDate(),
						content: () => <DisabledSegment hint="Нет свободного оборудования" />
					});
				});

				dataEquipmentReceptions.push({
					id: equipmentReception.uuid,
					name: equipmentReception.name,
					description: 'Оборудование',
					maxRows: 0,
					isInteractive: false,
					segments: equipmentReception.receptions
						.sort((a, b) => moment(a.updated_at).valueOf() - moment(b.updated_at).valueOf())
						.map(reception => ({
							id: reception.uuid,
							start: moment(reception.date_time).toDate(),
							end: moment(reception.date_time).add(reception.duration, 'minute').toDate(),
							content: () => <ReceptionSegment reception={reception} onClick={onClickReception} />
						}))
				});
			}
		}

		if (doctorsSchedule) {
			doctorsSchedule?.results.forEach(doctorSchedule => {
				dataChartDoctorSchedule.push({
					id: doctorSchedule.uuid,
					name: getFullName(doctorSchedule),
					description: doctorSchedule.profiles,
					segments: [
						...doctorSchedule.receptions
							.sort((a, b) => moment(a.updated_at).valueOf() - moment(b.updated_at).valueOf())
							.map(reception => ({
								id: reception.uuid,
								start: moment(reception.date_time).toDate(),
								end: moment(reception.date_time).add(reception.duration, 'minute').toDate(),
								content: () => <ReceptionSegment reception={reception} onClick={onClickReception} />
							})),
						...doctorSchedule.operations
							.sort((a, b) => moment(a.updated_at).valueOf() - moment(b.updated_at).valueOf())
							.map(operation => ({
								id: operation.uuid,
								start: moment(operation.date_time).toDate(),
								end: moment(operation.date_time).add(operation.duration, 'minute').toDate(),
								content: () => <OperationSegment operation={operation} onClick={onClickOperation} />
							}))
					],
					disabled: [
						...getDisabledSegments(doctorSchedule.working_days, dateReceipt),
						...disabledChartDoctorSchedule,
						...doctorSchedule.operations.map(operation => ({
							id: `${doctorSchedule.uuid}${operation.uuid}`,
							start: moment(operation.date_time).toDate(),
							end: moment(operation.date_time).add(operation.duration, 'minute').toDate(),
							content: () => <DisabledSegment hint="В это время назначена операция" />
						}))
					]
				});
			});
		}

		return [...dataChartDoctorSchedule, ...dataEquipmentReceptions];
	}, [dateReceipt, doctorsSchedule, equipmentReceptions, onClickOperation, onClickReception]);

	const timeConfig = {
		start: timeStart ? mergeDateWithTime(dateReceipt, timeStart) : optimalTimeRange.start,
		end: timeEnd ? mergeDateWithTime(dateReceipt, timeEnd) : optimalTimeRange.end
	};

	const isError = isErrorDoctorsSchedule || isErrorEquipmentReceptions;
	const opacity = isFetchingDoctorsSchedule || isFetchingEquipmentReceptions ? 0.5 : 1;

	if (isError) {
		return <ErrorMessage />;
	}
	if (isLoadingDoctorsSchedule) {
		return <FuseLoading />;
	}
	return (
		<>
			<div style={{ opacity }}>
				<ChartGantt
					value={value}
					duration={duration ?? 1}
					title="Врачи"
					data={dataChart}
					timeConfig={timeConfig}
					additionalRows={additionalRows}
					onChangeAdditionalRows={setAdditionalRows}
					onChange={onChange}
				/>
			</div>

			<ObserverElement />
		</>
	);
}
ChartDoctorsSchedule.defaultProps = {
	initialValues: {},
	value: null,
	duration: null,
	onChange: () => {},
	onClickReception: () => {},
	onClickOperation: () => {}
};
ChartDoctorsSchedule.propTypes = {
	value: PropTypes.shape({
		id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
		dateTime: PropTypes.instanceOf(Date).isRequired
	}),
	duration: PropTypes.number,
	initialValues: PropTypes.shape({
		timeStart: PropTypes.instanceOf(Date),
		timeEnd: PropTypes.instanceOf(Date),
		dateReceipt: PropTypes.instanceOf(Date),
		direction: PropTypes.string,
		service: PropTypes.string,
		doctor: PropTypes.string
	}),
	onChange: PropTypes.func,
	onClickReception: PropTypes.func,
	onClickOperation: PropTypes.func
};
