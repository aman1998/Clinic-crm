import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ButtonBase, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import clsx from 'clsx';
import { isBetween } from './isBetween';
import { INCREMENT_MINUTE, SPACING_BETWEEN_CELLS, WIDTH_LINE, HEIGHT_ROW } from './constants';

const useStyles = makeStyles(theme => ({
	timelineWrap: {
		height: HEIGHT_ROW,
		borderBottom: `${WIDTH_LINE}px solid ${theme.palette.grey[300]}`
	},
	timeline: {
		position: 'relative',
		height: '100%',
		overflow: 'hidden',
		backgroundImage: `
			linear-gradient(to right, ${theme.palette.grey[300]} ${WIDTH_LINE}px, transparent ${WIDTH_LINE}px), 
			linear-gradient(to right,  transparent ${SPACING_BETWEEN_CELLS}px, ${theme.palette.grey[300]} ${
			SPACING_BETWEEN_CELLS + WIDTH_LINE
		}px, transparent 2px)`,
		backgroundSize: SPACING_BETWEEN_CELLS * 2,
		'&:hover $lineActionWrap': {
			opacity: '.3'
		}
	},
	lineActionWrap: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		backgroundColor: theme.palette.primary.main,
		opacity: 0
	},
	lineActionError: {
		backgroundColor: theme.palette.error.main
	},
	lineAction: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		paddingLeft: SPACING_BETWEEN_CELLS / 2,
		paddingRight: SPACING_BETWEEN_CELLS / 2,
		transform: 'translate(-50%, 0)'
	},
	lineSelected: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		opacity: '0.8',
		backgroundColor: theme.palette.primary.main,
		pointerEvents: 'none'
	},
	segment: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		zIndex: 10
	},
	tooltipPlacementTop: {
		margin: 0
	}
}));

export function TimeLine({ value, duration, start, width, isInteractive, segments, onChange }) {
	const classes = useStyles();

	const getSegmentStyles = segment => {
		const segmentStart = moment(segment.start).startOf('minute');
		const segmentEnd = moment(segment.end).startOf('minute');

		const segmentStartDiff = segmentStart.diff(start, 'minutes');
		const segmentEndDiff = segmentEnd.diff(start, 'minutes');
		const left = (segmentStartDiff / INCREMENT_MINUTE) * SPACING_BETWEEN_CELLS;
		const right = width - (segmentEndDiff / INCREMENT_MINUTE) * SPACING_BETWEEN_CELLS + WIDTH_LINE;

		return { left, right };
	};

	const getDateTimeByOffset = offset => {
		const minute = (offset / SPACING_BETWEEN_CELLS) * INCREMENT_MINUTE;

		return moment(start).minute(minute).toDate();
	};

	const [isOverflowValue, setIsOverflowValue] = useState(false);
	const checkOnOverflow = dateTime => {
		setIsOverflowValue(
			segments.some(
				segment =>
					// @todo hard bugfix AIBO-434
					!moment(segment.start).isSame(segment.end) &&
					isBetween({
						start: segment.start,
						end: segment.end,
						betweenStart: dateTime,
						betweenEnd: moment(dateTime).add(duration, 'minute')
					})
			)
		);
	};

	const [hintDateTime, setHintDateTime] = useState('');
	const actionLineRef = useRef();
	const handleOnMousemove = event => {
		if (!isInteractive) {
			return;
		}

		const rect = event.currentTarget.getBoundingClientRect();
		const left = Math.round((event.clientX - rect.left) / SPACING_BETWEEN_CELLS) * SPACING_BETWEEN_CELLS;
		const dateTime = getDateTimeByOffset(left);
		const dateTimeWithDuration = moment(dateTime).add(duration, 'minute').toDate();

		const segmentStyles = getSegmentStyles({
			start: dateTime,
			end: dateTimeWithDuration
		});

		if (duration > 5) {
			setHintDateTime(`${moment(dateTime).format('HH:mm')}-${moment(dateTimeWithDuration).format('HH:mm')}`);
		} else {
			setHintDateTime(moment(dateTime).format('HH:mm'));
		}

		checkOnOverflow(dateTime);

		actionLineRef.current.style.left = `${segmentStyles.left}px`;
		actionLineRef.current.style.right = `${segmentStyles.right}px`;
	};

	const handleOnClickButtonLine = () => {
		const { offsetLeft } = actionLineRef.current;

		if (isOverflowValue) {
			return;
		}

		onChange(getDateTimeByOffset(offsetLeft));
	};

	return (
		<div className={classes.timelineWrap}>
			<div className={classes.timeline} style={{ minWidth: width + WIDTH_LINE }} onMouseMove={handleOnMousemove}>
				<Tooltip
					title={hintDateTime}
					placement="top"
					classes={{ tooltipPlacementTop: classes.tooltipPlacementTop }}
				>
					<div
						className={clsx(classes.lineActionWrap, { [classes.lineActionError]: isOverflowValue })}
						ref={actionLineRef}
					>
						<ButtonBase
							aria-label={hintDateTime}
							className={classes.lineAction}
							onClick={handleOnClickButtonLine}
						/>
					</div>
				</Tooltip>

				{value && (
					<div
						className={classes.lineSelected}
						style={getSegmentStyles({
							start: value,
							end: moment(value).add(duration, 'minute').toDate()
						})}
					/>
				)}

				{segments.map(segment => (
					<div key={segment.id} className={classes.segment} style={getSegmentStyles(segment)}>
						{segment.content(segment)}
					</div>
				))}
			</div>
		</div>
	);
}
TimeLine.defaultProps = {
	value: null,
	duration: null,
	isInteractive: true
};
TimeLine.propTypes = {
	value: PropTypes.instanceOf(Date),
	duration: PropTypes.number,
	start: PropTypes.instanceOf(Date).isRequired,
	width: PropTypes.number.isRequired,
	isInteractive: PropTypes.bool,
	segments: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
			start: PropTypes.instanceOf(Date).isRequired,
			end: PropTypes.instanceOf(Date).isRequired,
			content: PropTypes.func.isRequired
		})
	),
	onChange: PropTypes.func.isRequired
};
