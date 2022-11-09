import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { ButtonBase, IconButton } from '@material-ui/core';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { modalPromise } from 'app/common/ModalPromise';
import { ModalTreatmentStatus } from 'app/features/treatment/components/ModalTreatmentStatus';
import { useScrollElement } from './useScrollElement';
import {
	OFFSET_SCROLL,
	WIDTH_CELL_TREATMENT,
	HEIGHT_ROW_TREATMENT,
	WIDTH_LINE,
	SPACING_BETWEEN_CELLS_TREATMENT,
	TREATMENT_COMPLETED,
	TREATMENT_WAITING,
	TREATMENT_CANCELED,
	TREATMENT_PAID,
	TREATMENT_PASSED_NOT_PAID,
	TREATMENT_MISSED
} from './constants';

const useStyles = makeStyles(theme => ({
	container: {
		position: 'relative',
		display: 'grid',
		gridTemplateColumns: '20% 80%',
		border: `${WIDTH_LINE}px solid ${theme.palette.grey[300]}`,
		backgroundColor: theme.palette.background.default
	},
	titleSection: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		height: 45,
		borderBottom: `${WIDTH_LINE}px solid ${theme.palette.grey[300]}`
	},
	prevButton: {
		display: 'flex',
		alignItems: 'center',
		height: '100%',
		borderRight: `${WIDTH_LINE}px solid ${theme.palette.grey[300]}`,
		borderLeft: `${WIDTH_LINE}px solid ${theme.palette.grey[300]}`
	},
	nextButtonWrap: {
		position: 'absolute',
		top: 0,
		right: 0,
		bottom: 0,
		zIndex: 2,
		display: 'flex',
		alignItems: 'center',
		height: 45,
		borderBottom: `${WIDTH_LINE}px solid ${theme.palette.grey[300]}`,
		borderLeft: `${WIDTH_LINE}px solid ${theme.palette.grey[300]}`,
		backgroundColor: theme.palette.background.default
	},
	title: {
		padding: 10,
		fontWeight: 'bold'
	},
	duration: {
		display: 'grid',
		gridAutoFlow: 'column',
		gridAutoColumns: WIDTH_CELL_TREATMENT,
		height: 45,
		borderBottom: `${WIDTH_LINE}px solid ${theme.palette.grey[300]}`,
		borderRight: `${WIDTH_LINE}px solid ${theme.palette.grey[300]}`
	},
	dayStatus: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		height: HEIGHT_ROW_TREATMENT,
		width: WIDTH_CELL_TREATMENT
	},
	dayStatusBlock: {
		position: 'relative',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: 30,
		height: 30,
		borderRadius: 5
	},
	dayStatusCross: {
		fontSize: 18
	},
	dayStatusEmptyBlock: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: 30,
		height: 30,
		borderRadius: 5
	},
	dayStatusBlockIsAppointed: {
		backgroundColor: theme.palette.warning.main
	},
	dayStatusBlockIsDone: {
		backgroundColor: theme.palette.success.main
	},
	dayStatusBlockNotPaid: {
		backgroundColor: theme.palette.warning.main
	},
	dayStatusBlockIsCancel: {
		backgroundColor: theme.palette.error.main
	},
	dayStatusBlockIsMissed: {
		backgroundColor: theme.palette.error.main
	},
	dayStatusBlockIsWaiting: {
		backgroundColor: theme.palette.grey
	},
	dateWrapper: {
		padding: '5px 0',
		borderLeft: `${WIDTH_LINE}px solid ${theme.palette.grey[300]}`,
		textAlign: 'center',
		'&:first-child': {
			borderLeft: 'none'
		}
	},
	date: {
		fontSize: 9
	},
	day: {
		fontSize: 16,
		fontWeight: 'bold'
	},
	section: {
		display: 'flex',
		flexWrap: 'nowrap',
		'&::after': {
			content: '""',
			display: 'block',
			width: 30,
			minWidth: 30
		}
	},
	rowName: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'flex-start',
		height: HEIGHT_ROW_TREATMENT,
		padding: SPACING_BETWEEN_CELLS_TREATMENT,
		overflow: 'hidden',
		borderRight: `${WIDTH_LINE}px solid ${theme.palette.grey[300]}`
	},
	name: {
		width: '100%',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		fontWeight: 700
	},
	description: {
		overflow: 'hidden'
	},
	buttonAddRow: {
		marginTop: 'auto'
	}
}));

/**
 * @param segments {array}
 * @return {array}
 */

export function ChartGanttTreatment({ title, data, treatmentUuid }) {
	const classes = useStyles();
	const { scrollNext, scrollPrev, containerRef } = useScrollElement({ offset: OFFSET_SCROLL });

	const getClassStatus = status => {
		switch (status) {
			case TREATMENT_COMPLETED:
				return classes.dayStatusBlockIsDone;
			case TREATMENT_PAID:
				return classes.dayStatusBlockIsDone;
			case TREATMENT_WAITING:
				return classes.dayStatusBlockIsAppointed;
			case TREATMENT_PASSED_NOT_PAID:
				return classes.dayStatusBlockNotPaid;
			case TREATMENT_CANCELED:
				return classes.dayStatusBlockIsCancel;
			case TREATMENT_MISSED:
				return classes.dayStatusBlockIsMissed;
			default:
				return classes.dayStatusBlockIsWaiting;
		}
	};

	const checkIsCross = status =>
		status === TREATMENT_COMPLETED || status === TREATMENT_PASSED_NOT_PAID || status === TREATMENT_CANCELED;

	const getFilledDates = (date, filledDayCount) => {
		const _date = new Date(date);
		const _currentDate = new Date(date);
		_date.setDate(_date.getDate() + filledDayCount);
		_currentDate.setDate(_currentDate.getDate() + 1);

		const dateArray = [];
		let currentDate = moment(_currentDate);
		const stopDates = moment(_date);
		while (currentDate <= stopDates) {
			dateArray.push(moment(currentDate).format('YYYY-MM-DD'));
			currentDate = moment(currentDate).add(1, 'days');
		}

		return dateArray;
	};

	const getAllDates = () => {
		const dates = [];
		data?.forEach(item => {
			item?.days.forEach(dayItem => {
				if (!dates.includes(dayItem.day)) dates.push(dayItem.day);
			});
		});

		if (dates.length < 30) {
			return dates.sort().concat(getFilledDates(dates[dates.length - 1], 30 - (dates.length - 1)));
		}

		return dates.sort();
	};

	const checkIsStatus = (arr, day) => {
		const checkStatus = arr.map(item => item.day).includes(day);
		if (checkStatus) {
			const obj = arr.find(item => item.day === day);
			return (
				<div key={obj.day} className={classes.dayStatus}>
					<ButtonBase
						className={`${classes.dayStatusBlock} ${getClassStatus(obj.items[0]?.status)}`}
						onClick={() =>
							modalPromise.open(({ onClose }) => (
								<ModalTreatmentStatus
									onClose={onClose}
									isOpen
									initialValues={obj.items[0]}
									treatmentUuid={treatmentUuid}
								/>
							))
						}
					>
						{checkIsCross(obj.items[0]?.status) && <div className={classes.dayStatusCross}>x</div>}
					</ButtonBase>
				</div>
			);
		}
		return <></>;
	};

	return (
		<div className={classes.container}>
			<div>
				<div className={classes.titleSection}>
					<div className={classes.title}>{title}</div>

					<div className={classes.prevButton}>
						<IconButton aria-label="Предыдущее время" size="small" color="primary" onClick={scrollPrev}>
							<ChevronLeftIcon fontSize="large" />
						</IconButton>
					</div>
				</div>

				{data?.map(item => (
					<div key={item.name} className={classes.rowName} style={{ height: HEIGHT_ROW_TREATMENT }}>
						<div className={classes.name}>{item.name}</div>
					</div>
				))}
			</div>

			<div ref={containerRef} className={classes.section}>
				<div>
					<div className={classes.duration}>
						{getAllDates().map((date, index) => (
							<div key={date} className={classes.dateWrapper}>
								<div className={classes.date}>{date}</div>
								<div className={classes.day}>{index + 1}</div>
							</div>
						))}
						<div className={classes.nextButtonWrap}>
							<IconButton aria-label="Следующее время" size="small" color="primary" onClick={scrollNext}>
								<ChevronRightIcon fontSize="large" />
							</IconButton>
						</div>
					</div>

					{data?.map(item => (
						<div key={item.name} className="flex">
							{getAllDates().map(day => (
								<div key={day} className={classes.dayStatus}>
									{checkIsStatus(item?.days, day)}
								</div>
							))}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
ChartGanttTreatment.defaultProps = {
	value: null
};
ChartGanttTreatment.propTypes = {
	value: PropTypes.shape({
		id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
		dateTime: PropTypes.instanceOf(Date).isRequired,
		row: PropTypes.number
	}),
	title: PropTypes.string.isRequired,
	data: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
			name: PropTypes.string,
			description: PropTypes.string,
			segments: PropTypes.arrayOf(PropTypes.array).isRequired,
			maxRows: PropTypes.number,
			isInteractive: PropTypes.bool,
			disabled: PropTypes.arrayOf(
				PropTypes.shape({
					id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
					start: PropTypes.instanceOf(Date),
					end: PropTypes.instanceOf(Date)
				})
			)
		})
	).isRequired,
	treatmentUuid: PropTypes.string.isRequired
};
