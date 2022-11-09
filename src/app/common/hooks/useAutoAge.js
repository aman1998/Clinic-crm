import { useCallback } from 'react';
import moment from 'moment';
import { useStateForm } from '../../hooks';

export function useAutoAge() {
	const { form, setInForm } = useStateForm({
		date: null,
		age: ''
	});

	const handleOnChangeDate = useCallback(
		date => {
			setInForm('date', date);

			const totalDays = moment(new Date()).diff(date, 'year');

			setInForm('age', totalDays);
		},
		[setInForm]
	);

	const handleOnChangeAge = useCallback(
		age => {
			setInForm('age', age);

			const totalDays = moment(new Date()).subtract(age, 'year');

			setInForm('date', totalDays.toDate());
		},
		[setInForm]
	);

	return {
		form,
		handleOnChangeAge,
		handleOnChangeDate
	};
}
