import moment from 'moment';

/**
 * Return weekdays or weekday
 * @param day {number} - days 1 2 3 4 5 6 7 where 1 is sunday
 * @param short {boolean}
 * @return {string|string[]}
 */
export function getWeekDays({ day, short } = {}) {
	const getWeekdays = short ? moment.weekdaysShort : moment.weekdays;
	const map = {
		1: 0,
		2: 1,
		3: 2,
		4: 3,
		5: 4,
		6: 5,
		7: 6
	};
	const orderWeekDays = [1, 2, 3, 4, 5, 6, 0];

	return day >= 0 ? getWeekdays(map[day]) : orderWeekDays.map(item => getWeekdays(item));
}
