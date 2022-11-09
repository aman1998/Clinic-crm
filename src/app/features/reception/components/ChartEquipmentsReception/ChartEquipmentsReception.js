import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import PropTypes from 'prop-types';
import moment from 'moment';
import { equipmentsService, ENTITY } from '../../../../services';
import { defaults } from '../../../../utils';
import { useObserverElement } from '../../../../hooks';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { ChartGantt } from '../../../../bizKITUi';
import { ReceptionSegment } from '../../../../common/ReceptionSegment';

const defaultValues = {
	timeStart: moment().set({ hour: 8 }).startOf('hour').toDate(),
	timeEnd: moment().set({ hour: 18 }).startOf('hour').toDate(),
	dateReceipt: moment().toDate(),
	equipment: null,
	service: null,
	offset: 0
};

export function ChartEquipmentsReception({ initialValues, onClickReception }) {
	const [limit, setLimit] = useState(6);
	const [values, setValues] = useState(defaults(initialValues, defaultValues));

	const { timeStart, timeEnd, dateReceipt } = values;
	const fetchingValues = {
		equipment: values.equipment,
		service: values.service,
		limit
	};

	useEffect(() => {
		setValues(defaults(initialValues, defaultValues));
	}, [initialValues]);

	const { isLoading, isFetching, isError, data } = useQuery(
		[ENTITY.RECEPTION_EQUIPMENT, fetchingValues],
		({ queryKey }) => equipmentsService.getEquipmentReceptions(queryKey[1]),
		{ keepPreviousData: true }
	);

	const ObserverElement = useObserverElement(() => {
		if (isLoading || data?.count <= limit) {
			return;
		}

		setLimit(limit * 2);
	});

	const dataChartEquipmentsReception = useMemo(
		() =>
			data?.results.map(item => ({
				id: item.uuid,
				name: item.name,
				description: item.profiles,
				maxRows: 0,
				segments: item.receptions
					.sort((a, b) => moment(a.updated_at).valueOf() - moment(b.updated_at).valueOf())
					.map(reception => ({
						id: reception.uuid,
						start: moment(reception.date_time).toDate(),
						end: moment(reception.date_time).add(reception.duration, 'minute').toDate(),
						content: () => <ReceptionSegment reception={reception} onClick={onClickReception} />
					}))
			})) ?? [],
		[data, onClickReception]
	);
	const mDateReceipt = moment(dateReceipt);
	const timeConfig = {
		start: moment(timeStart)
			.set({
				year: mDateReceipt.year(),
				month: mDateReceipt.month(),
				day: mDateReceipt.day()
			})
			.toDate(),
		end: moment(timeEnd)
			.set({
				year: mDateReceipt.year(),
				month: mDateReceipt.month(),
				day: mDateReceipt.day()
			})
			.toDate()
	};

	const opacity = isLoading || isFetching ? 0.5 : 1;

	if (isError) {
		return <ErrorMessage />;
	}
	return (
		<>
			<div style={{ opacity }}>
				<ChartGantt
					duration={1}
					title="Оборудование"
					data={dataChartEquipmentsReception}
					timeConfig={timeConfig}
				/>
			</div>

			<ObserverElement />
		</>
	);
}
ChartEquipmentsReception.defaultProps = {
	initialValues: {},
	onClickReception: () => {}
};
ChartEquipmentsReception.propTypes = {
	initialValues: PropTypes.shape({
		timeStart: PropTypes.instanceOf(Date),
		timeEnd: PropTypes.instanceOf(Date),
		dateReceipt: PropTypes.instanceOf(Date),
		equipment: PropTypes.string,
		service: PropTypes.string
	}),
	onClickReception: PropTypes.func
};
