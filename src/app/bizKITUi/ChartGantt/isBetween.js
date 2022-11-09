import moment from 'moment';

/**
 * Checks two segments for collision
 * @param start {string}
 * @param end {string}
 * @param betweenStart {string}
 * @param betweenEnd {string}
 * @return {boolean}
 */
export function isBetween({ start, end, betweenStart, betweenEnd }) {
	const valueOfStart = moment(start).valueOf();
	const valueOfEnd = moment(end).valueOf();
	const valueOfBetweenStart = moment(betweenStart).valueOf();
	const valueOfBetweenEnd = moment(betweenEnd).valueOf();

	return (
		(valueOfStart >= valueOfBetweenStart && valueOfStart < valueOfBetweenEnd) ||
		(valueOfBetweenStart >= valueOfStart && valueOfBetweenStart < valueOfEnd)
	);
}
