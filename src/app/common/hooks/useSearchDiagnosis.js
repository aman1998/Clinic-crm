import { useCallback, useState, useEffect, useMemo } from 'react';
import { debounce } from '@material-ui/core';
import { useDiagnosis } from './useDiagnosis';
import { useListDiagnosis } from './useListDiagnosis';

/**
 * @deprecated in favour of `ServerAutocomplete`
 */
export function useSearchDiagnosis() {
	const { isLoading, update, error, data } = useListDiagnosis();
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

	const { get: getDiagnosis, error: errorPatient, data: dataPatient } = useDiagnosis();
	const getDiagnosisByUuid = useCallback(uuid => getDiagnosis(uuid), [getDiagnosis]);
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
			getByUuid: getDiagnosisByUuid
		}),
		[getDiagnosisByUuid, handleOnChange]
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
