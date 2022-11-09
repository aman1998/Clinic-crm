import { useCallback, useState, useEffect } from 'react';
import { debounce } from '@material-ui/core';
import { useProductRemnant } from './useProductRemnant';
import { useListProductsRemnants } from './useListProductsRemnants';

/**
 * @deprecated in favour of `ServerAutocomplete`
 */
export function useSearchProductsRemnants() {
	const { isLoading, update, error, data } = useListProductsRemnants();
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
				name_vendor_code_manufacturer: newKeyword
			});
		}, 400),
		[]
	);

	const { get: getProductRemnant, error: errorProductRemnant, data: dataProductRemnant } = useProductRemnant();
	const getProductRemnantByUuid = useCallback((uuid, params) => getProductRemnant(uuid, params), [getProductRemnant]);
	useEffect(() => {
		if (!dataProductRemnant) {
			return;
		}
		setList(state => [...state, dataProductRemnant]);
		setValue(dataProductRemnant);
	}, [dataProductRemnant]);

	return {
		status: {
			isLoading,
			isError: !!error || !!errorProductRemnant
		},
		data: {
			value,
			keyword,
			listProductRemnant: list
		},
		actions: {
			setValue,
			update: handleOnChange,
			getByUuid: getProductRemnantByUuid
		}
	};
}
