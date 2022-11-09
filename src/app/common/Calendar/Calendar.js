import React, { useState, useMemo, useEffect } from 'react';
import moment from 'moment';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton, ButtonBase } from '@material-ui/core';
import { ArrowBackIos as ArrowBackIosIcon, ArrowForwardIos as ArrowForwardIosIcon } from '@material-ui/icons';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const useStyles = makeStyles(theme => ({
	root: {
		backgroundColor: theme.palette.background.paper
	},
	header: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 10,
		fontWeight: 700
	},
	containerGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(7, 1fr)',
		textAlign: 'center'
	},
	itemMonth: {
		marginBottom: 8,
		fontWeight: 700
	},
	gridItem: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center'
	},
	itemDate: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		width: 40,
		height: 40,
		borderRadius: '50%',

		'&:disabled': {
			color: theme.palette.grey[500]
		},
		'&::before': {
			content: '""',
			position: 'absolute',
			top: '50%',
			right: 0,
			bottom: 0,
			left: '50%',
			display: 'block',
			width: '80%',
			height: '80%',
			border: '2px solid transparent',
			borderRadius: '50%',
			backgroundColor: 'transparent',
			transform: 'translate(-50%, -50%)'
		}
	},
	itemDateBlocked: {
		color: `${theme.palette.common.white} !important`,
		'&::before': {
			borderColor: theme.palette.error.main,
			backgroundColor: theme.palette.error.main
		}
	},
	itemDateHoliday: {
		color: `${theme.palette.common.white} !important`,

		'&::before': {
			backgroundColor: theme.palette.grey[500]
		}
	},
	itemDateSelected: {
		color: `${theme.palette.common.white} !important`,

		'&::before': {
			backgroundColor: theme.palette.primary.main
		}
	},
	dayOff: {
		color: theme.palette.grey[500]
	}
}));

const LANG = 'ru';
const LIST_DAYS_OF_WEEK = [1, 2, 3, 4, 5, 6, 0];
const COUNT_OF_MONTHS = 11;
const FIRST_MONTH_NUMBER = 0;
const TODAY = new Date();

/**
 * returns date without time
 * @param date - js object or a valid date string
 * @returns {Date}
 */
function getOnlyDate(date) {
	const jsDate = new Date(date);

	return new Date(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate());
}

function ItemDate({ selectedDate, date, disabledDates, holidays, workingDays, onChange, treatmentDays }) {
	const classes = useStyles();

	const isDateForBlocked = disabledDates.some(draftDate => getOnlyDate(draftDate).getTime() === date.getTime());
	const isDateHoliday = holidays.some(draftDate => getOnlyDate(draftDate).getTime() === date.getTime());
	const isWorkingDay = workingDays.some(item => item === date.getDay());
	const isTreatmentDay = treatmentDays.includes(moment(date).format('YYYY-MM-DD'));
	const isSelectedDate = date.getTime() === selectedDate?.getTime();

	return (
		<div className={classes.gridItem}>
			<ButtonBase
				aria-label={date.toDateString()}
				className={clsx(classes.itemDate, {
					[classes.itemDateBlocked]: isDateForBlocked,
					[classes.itemDateSelected]: isSelectedDate || isTreatmentDay
				})}
				disabled={!isWorkingDay || isDateHoliday}
				onClick={() => onChange(date)}
			>
				<span className="z-10">{date.getDate()}</span>
			</ButtonBase>
		</div>
	);
}
ItemDate.defaultProps = {
	selectedDate: null,
	holidays: [],
	treatmentDays: []
};
ItemDate.propTypes = {
	selectedDate: PropTypes.instanceOf(Date),
	date: PropTypes.instanceOf(Date).isRequired,
	disabledDates: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
	treatmentDays: PropTypes.arrayOf(PropTypes.string),
	holidays: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
	workingDays: PropTypes.arrayOf(PropTypes.number).isRequired,
	onChange: PropTypes.func.isRequired
};

export function Calendar({ value, disabledDates, holidays, isShowHeader, workingDays, onChange, treatmentDays }) {
	const classes = useStyles();

	const selectedDate = useMemo(() => (value ? getOnlyDate(value) : value), [value]);
	const [viewedMonth, setViewedMonth] = useState(TODAY.getMonth());
	const [viewedYear, setViewedYear] = useState(TODAY.getFullYear());
	const firstDayOfMonth = new Date(viewedYear, viewedMonth, 1);
	const lastDayOfMonth = new Date(viewedYear, viewedMonth + 1, 0);

	useEffect(() => {
		if (selectedDate) {
			setViewedYear(selectedDate.getFullYear());
			setViewedMonth(selectedDate.getMonth());
		}
	}, [selectedDate]);

	const offsetColumn = useMemo(() => {
		const index = LIST_DAYS_OF_WEEK.indexOf(firstDayOfMonth.getDay());

		return index === -1 ? 0 : index;
	}, [firstDayOfMonth]);

	const daysInCurrentMonth = useMemo(() => {
		const numberLastDay = lastDayOfMonth.getDate();

		return new Array(numberLastDay)
			.fill(numberLastDay)
			.map((item, index) => item - index)
			.map(day => new Date(viewedYear, viewedMonth, day))
			.reverse();
	}, [lastDayOfMonth, viewedMonth, viewedYear]);

	const nameOfDateBeingViewed = useMemo(() => {
		const format = {
			year: 'numeric',
			month: 'long'
		};

		return new Date(viewedYear, viewedMonth).toLocaleDateString(LANG, format);
	}, [viewedMonth, viewedYear]);

	const handleOnNextList = () => {
		if (viewedMonth >= COUNT_OF_MONTHS) {
			setViewedYear(viewedYear + 1);
			setViewedMonth(FIRST_MONTH_NUMBER);

			return;
		}

		setViewedMonth(viewedMonth + 1);
	};

	const handleOnPrevList = () => {
		if (viewedMonth <= FIRST_MONTH_NUMBER) {
			setViewedYear(viewedYear - 1);
			setViewedMonth(COUNT_OF_MONTHS);
			return;
		}

		setViewedMonth(viewedMonth - 1);
	};

	return (
		<div className={classes.root}>
			{isShowHeader && (
				<div className={classes.header}>
					<IconButton onClick={handleOnPrevList}>
						<ArrowBackIosIcon fontSize="small" />
					</IconButton>

					{nameOfDateBeingViewed}

					<IconButton onClick={handleOnNextList}>
						<ArrowForwardIosIcon fontSize="small" />
					</IconButton>
				</div>
			)}

			<div className={classes.containerGrid}>
				<div className={classes.itemMonth}>Пн</div>
				<div className={classes.itemMonth}>Вт</div>
				<div className={classes.itemMonth}>Ср</div>
				<div className={classes.itemMonth}>Чт</div>
				<div className={classes.itemMonth}>Пт</div>
				<div className={clsx(classes.itemMonth, classes.dayOff)}>Сб</div>
				<div className={clsx(classes.itemMonth, classes.dayOff)}>Вс</div>

				{!!offsetColumn && <div style={{ gridColumnEnd: `span ${offsetColumn}` }} />}

				{daysInCurrentMonth.map(date => (
					<ItemDate
						key={date.getTime()}
						selectedDate={selectedDate}
						date={date}
						disabledDates={disabledDates}
						holidays={holidays}
						workingDays={workingDays}
						onChange={onChange}
						treatmentDays={treatmentDays}
					/>
				))}
			</div>
		</div>
	);
}
Calendar.defaultProps = {
	value: null,
	isShowHeader: true,
	workingDays: [0, 1, 2, 3, 4, 5, 6],
	holidays: [],
	treatmentDays: [],
	onChange: () => {}
};
Calendar.propTypes = {
	value: PropTypes.instanceOf(Date),
	disabledDates: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
	holidays: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
	isShowHeader: PropTypes.bool,
	workingDays: PropTypes.arrayOf(PropTypes.number),
	treatmentDays: PropTypes.arrayOf(PropTypes.string),
	onChange: PropTypes.func
};
