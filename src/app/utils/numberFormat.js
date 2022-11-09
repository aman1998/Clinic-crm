import range from 'lodash/range';
/**
 * An object that provides methods for formatting numbers.
 */
export const numberFormat = {
	/**
	 * method for formatting currency
	 * @param c {number | string}
	 * @returns {string}
	 */
	currency: c =>
		Number(c)
			? new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(c)
			: '0',
	array: number => Array.from(String(number), Number),
	split: number => number.split(','),
	decimal: d => /^\d{1,2}(\.\d{1,2})?$|^\.\d{2}$/.test(d)
};

export const daysFormat = days => {
	/**
	 * method for formatting days
	 * @param days: string = 1, 2, 3-4, 6-9, 10
	 * @returns [number]
	 */
	if (Array.isArray(days)) {
		return days;
	}
	const arrayOfDays = days.includes(',') ? days.split(',') : [days];
	const rangeDays = arrayOfDays.filter(num => num.includes('-'));
	let singleDays = arrayOfDays.filter(num => !num.includes('-')).map(num => num && Number(num));

	rangeDays.forEach(day => {
		const currentRangeDays = day.split('-');
		const isNumber = !Number.isNaN(Number(currentRangeDays[0])) && !Number.isNaN(Number(currentRangeDays[1]));

		if (isNumber) {
			singleDays.push(...range(Number(currentRangeDays[0]), Number(currentRangeDays[1]) + 1));
		} else {
			singleDays.push(NaN);
		}
	});

	singleDays = [...new Set(singleDays)].sort((a, b) => a - b).filter(day => day > 0 || Number.isNaN(day));

	return singleDays;
};

export const decimalPercentOnChange = /^(\d*)(\.\d{0,2})?$/g;
