import React from 'react';
import { FormHolidays } from '../components';
import { useToolbarTitle } from '../../../hooks';

export function SettingsHolidays() {
	useToolbarTitle('Календарь праздников');

	return (
		<div className="md:m-32 m-12">
			<FormHolidays />
		</div>
	);
}
export default SettingsHolidays;
