import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from '@material-ui/core';
import { useStateForm } from '../useStateForm';

export function useDebouncedFilterForm(defaultValues, onSubmit) {
	const [debouncedForm, setDebouncedForm] = useState(defaultValues);
	const { form, setInForm: setInFormOrig, handleChange: handleChangeOrig, ...rest } = useStateForm(
		defaultValues,
		onSubmit
	);
	const updateFilter = useRef(
		debounce(values => {
			setDebouncedForm(values);
		}, 500)
	);
	useEffect(() => {
		updateFilter.current(form);
	}, [form]);

	const setInForm = useCallback(
		(name, value) => {
			setInFormOrig(name, value);
			if (name !== 'offset') {
				setInFormOrig('offset', 0);
			}
		},
		[setInFormOrig]
	);

	const handleChange = useCallback(
		event => {
			handleChangeOrig(event);
			if (event.target.name !== 'offset') {
				setInFormOrig('offset', 0);
			}
		},
		[handleChangeOrig, setInFormOrig]
	);

	const setPage = useCallback(
		page => {
			setInFormOrig('offset', page * form.limit);
		},
		[form.limit, setInFormOrig]
	);
	const getPage = useCallback(() => {
		return Math.ceil(form.offset / form.limit);
	}, [form.limit, form.offset]);

	return {
		...rest,
		debouncedForm,
		form,
		setPage,
		getPage,
		setInForm,
		handleChange
	};
}
