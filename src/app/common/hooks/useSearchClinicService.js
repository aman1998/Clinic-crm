import { useCallback, useState, useEffect, useMemo } from 'react';
import { debounce } from '@material-ui/core';
import { useListServices } from './useListServices';
import { useClinicService } from './useClinicService';

/**
 * @deprecated in favour of `ServerAutocomplete`
 */
export function useSearchClinicService() {
	const { isLoading, update, error, data } = useListServices();
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
				name: newKeyword
			});
		}, 400),
		[]
	);

	const { get: getClinicService, error: errorClinicService, data: dataClinicService } = useClinicService();
	const getServiceByUuid = useCallback(uuid => getClinicService(uuid), [getClinicService]);
	useEffect(() => {
		if (!dataClinicService) {
			return;
		}
		setList(state => [...state, dataClinicService]);
		setValue(dataClinicService);
	}, [dataClinicService]);

	const actions = useMemo(
		() => ({
			setValue,
			update: handleOnChange,
			getByUuid: getServiceByUuid
		}),
		[getServiceByUuid, handleOnChange]
	);

	return {
		status: {
			isLoading,
			isError: !!error || !!errorClinicService
		},
		data: {
			value,
			keyword,
			listServices: list
		},
		actions
	};
}
