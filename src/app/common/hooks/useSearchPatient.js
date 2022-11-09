import { useCallback, useState, useEffect, useMemo } from 'react';
import { debounce } from '@material-ui/core';
import { usePatient } from './usePatient';
import { useListPatient } from './useListPatient';

/**
 * @deprecated in favour of `ServerAutocomplete`
 */
export function useSearchPatient() {
	const { isLoading, update, error, data } = useListPatient();
	const [value, setValue] = useState(null);
	const [keyword, setKeyword] = useState(null);

	const [list, setList] = useState(data.list);
	useEffect(() => {
		setList(data.list);
	}, [data.list]);

	const handleOnChange = useCallback(
		debounce((newKeyword, params) => {
			setKeyword(newKeyword);

			update({
				...params,
				search: newKeyword
			});
		}, 400),
		[]
	);

	const { get: getPatient, error: errorPatient, data: dataPatient } = usePatient();
	const getPatientByUuid = useCallback(uuid => getPatient(uuid), [getPatient]);
	useEffect(() => {
		if (!dataPatient) {
			return;
		}
		setList(state => [...state, dataPatient]);
		setValue(dataPatient);
	}, [dataPatient]);

	const actions = useMemo(
		() => ({
			setValue,
			update: handleOnChange,
			getByUuid: getPatientByUuid
		}),
		[getPatientByUuid, handleOnChange]
	);

	return {
		status: {
			isLoading,
			isError: !!error || !!errorPatient
		},
		data: {
			value,
			keyword,
			listPatient: list
		},
		actions
	};
}
