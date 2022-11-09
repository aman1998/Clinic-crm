import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '@material-ui/core';
import {
	ChevronLeft as ChevronLeftIcon,
	ChevronRight as ChevronRightIcon,
	AddCircle as AddCircleIcon
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import { Button } from '../Button';
import { isBetween } from './isBetween';
import { useScrollElement } from './useScrollElement';
import { TimeLine } from './TimeLine';
import { OFFSET_SCROLL, WIDTH_CELL, HEIGHT_ROW, WIDTH_LINE, SPACING_BETWEEN_CELLS } from './constants';

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
		height: 70,
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
		height: 70,
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
		gridAutoColumns: WIDTH_CELL,
		height: 70,
		borderBottom: `${WIDTH_LINE}px solid ${theme.palette.grey[300]}`,
		borderRight: `${WIDTH_LINE}px solid ${theme.palette.grey[300]}`
	},
	hour: {
		padding: '10px 0',
		borderLeft: `${WIDTH_LINE}px solid ${theme.palette.grey[300]}`,
		fontSize: 18,
		fontWeight: 'bold',
		textAlign: 'center',
		'&:first-child': {
			borderLeft: 'none'
		}
	},
	minutes: {
		display: 'flex',
		marginTop: 10,
		fontSize: 12
	},
	minute: {
		minWidth: SPACING_BETWEEN_CELLS * 2,
		transform: 'translate(50%, 0)'
	},
	section: {
		display: 'flex',
		flexWrap: 'nowrap',
		'&::after': {
			content: '""',
			display: 'block',
			width: 40,
			minWidth: 40
		}
	},
	rowName: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-start',
		height: HEIGHT_ROW,
		padding: SPACING_BETWEEN_CELLS,
		overflow: 'hidden',
		borderRight: `${WIDTH_LINE}px solid ${theme.palette.grey[300]}`,
		borderBottom: `${WIDTH_LINE}px solid ${theme.palette.grey[300]}`
	},
	name: {
		width: '100%',
		marginBottom: 5,
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
function getTimelines(segments) {
	const timelines = [[]];

	segments.forEach(segment => {
		const index = timelines.findIndex(
			timeline =>
				!timeline.some(timelineSegment =>
					isBetween({
						start: segment.start,
						end: segment.end,
						betweenStart: timelineSegment.start,
						betweenEnd: timelineSegment.end
					})
				)
		);

		if (index === -1) {
			timelines.push([segment]);

			return;
		}

		timelines[index].push(segment);
	});

	return timelines;
}

/**
 * @param dateTime {string}
 * @return {string}
 */
function roundDateTimeByMinute(dateTime) {
	const start = moment(dateTime);
	const remainder = 30 - (start.minute() % 30);

	return moment(start).add(remainder, 'minutes').toISOString();
}

export function ChartGantt({
	value,
	duration,
	title,
	data,
	timeConfig,
	additionalRows,
	onChangeAdditionalRows,
	onChange
}) {
	const classes = useStyles();
	const { scrollNext, scrollPrev, containerRef } = useScrollElement({ offset: OFFSET_SCROLL });

	const start = moment(timeConfig.start).startOf('hour').toISOString();
	const end = roundDateTimeByMinute(timeConfig.end);

	const hours = useMemo(() => {
		const hoursList = [];
		const currentHour = moment(start);

		while (true) {
			if (moment(currentHour).isSameOrAfter(moment(end), 'hour')) {
				return hoursList;
			}

			hoursList.push(currentHour.toISOString());
			currentHour.add(1, 'hour');
		}
	}, [end, start]);
	const timelineWidth = hours.length * WIDTH_CELL;

	const handleOnAddRow = id => {
		const increment = 1;
		const count = id in additionalRows ? additionalRows[id] + increment : increment;

		onChangeAdditionalRows({ ...additionalRows, [id]: count });
	};
	const structuredData = useMemo(
		() =>
			data.map(item => {
				const currentSegments = item.segments.filter(segment =>
					isBetween({
						start: segment.start,
						end: segment.end,
						betweenStart: timeConfig.start,
						betweenEnd: timeConfig.end
					})
				);
				const currentDisabled =
					item.disabled?.filter(segment =>
						isBetween({
							start: segment.start,
							end: segment.end,
							betweenStart: timeConfig.start,
							betweenEnd: timeConfig.end
						})
					) ?? [];

				let timelines = getTimelines(currentSegments);

				if (item.id in additionalRows) {
					timelines = [...timelines, ...new Array(additionalRows[item.id]).fill([])];
				}

				timelines = timelines.map(timeline => [...currentDisabled, ...timeline]);

				return {
					...item,
					timelines
				};
			}),
		[additionalRows, data, timeConfig.end, timeConfig.start]
	);

	const trimDescription = (description, countTimelines) => {
		if (!description) {
			return '';
		}

		const maxLength = countTimelines > 1 ? 100 * countTimelines : 30;

		if (description.length <= maxLength) {
			return description;
		}

		return `${description.substring(0, maxLength)}...`;
	};

	const getTimelineValue = (item, index) => {
		if (!value || value.id !== item.id || value.row !== index) {
			return null;
		}

		return value.dateTime;
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

				{structuredData.map(item => (
					<div
						key={item.id}
						className={classes.rowName}
						style={{ height: item.timelines.length * HEIGHT_ROW }}
					>
						<div className={classes.name}>{item.name}</div>
						<div className={classes.description}>
							{trimDescription(item.description, item.timelines.length)}
						</div>

						{onChangeAdditionalRows && (
							<Button
								className={classes.buttonAddRow}
								variant="text"
								textNormal
								startIcon={<AddCircleIcon />}
								size="small"
								disabled={item.timelines.length >= item.maxRows}
								onClick={() => handleOnAddRow(item.id)}
							>
								Добавить ряд
							</Button>
						)}
					</div>
				))}
			</div>

			<div ref={containerRef} className={classes.section}>
				<div>
					<div className={classes.duration}>
						{hours.map(hour => (
							<div key={hour} className={classes.hour}>
								{moment(hour).format('H')}
							</div>
						))}
						<div className={classes.nextButtonWrap}>
							<IconButton aria-label="Следующее время" size="small" color="primary" onClick={scrollNext}>
								<ChevronRightIcon fontSize="large" />
							</IconButton>
						</div>
					</div>

					{structuredData.map(item => (
						<div key={item.id}>
							{item.timelines.map((segments, index) => (
								<TimeLine
									key={index}
									value={getTimelineValue(item, index)}
									isInteractive={item.isInteractive}
									duration={duration}
									start={moment(start).toDate()}
									width={timelineWidth}
									segments={segments}
									onChange={dateTime =>
										onChange({
											id: item.id,
											row: index,
											dateTime
										})
									}
								/>
							))}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
ChartGantt.defaultProps = {
	value: null,
	duration: null,
	additionalRows: {},
	onChangeAdditionalRows: null,
	onChange: () => {}
};
ChartGantt.propTypes = {
	value: PropTypes.shape({
		id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
		dateTime: PropTypes.instanceOf(Date).isRequired,
		row: PropTypes.number
	}),
	duration: PropTypes.number.isRequired, // minute
	title: PropTypes.string.isRequired,
	timeConfig: PropTypes.shape({
		start: PropTypes.instanceOf(Date).isRequired,
		end: PropTypes.instanceOf(Date).isRequired
	}).isRequired,
	additionalRows: PropTypes.shape({
		id: PropTypes.number
	}),
	data: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
			name: PropTypes.string,
			description: PropTypes.string,
			segments: PropTypes.array.isRequired,
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
	onChangeAdditionalRows: PropTypes.func,
	onChange: PropTypes.func
};
