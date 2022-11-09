import { useCallback, useState, useEffect, useRef } from 'react';
import { debounce } from '@material-ui/core';
import { usePromise } from '../usePromise';

/**
 * @deprecated use `ServerAutocomplete` component instead
 */
export function useSearchByKeyword({ onUpdateList, onUpdateItem, uniqueValue }) {
	const { isLoading: isLoadingList, error: errorList, results: resultsList, update: updateList } = usePromise();
	const { isLoading: isLoadingItem, error: errorItem, results: resultsItem, update: updateItem } = usePromise();

	const keywordRef = useRef(null);

	const [data, setData] = useState(null);

	const handleOnSearch = useCallback(
		debounce((keyword, params) => {
			if (keyword === keywordRef.current) {
				return;
			}

			keywordRef.current = keyword;

			updateList(() => onUpdateList(keyword, params));
		}, 400),
		[]
	);

	const handleOnUpdateItem = useRef(onUpdateItem);
	useEffect(() => {
		handleOnUpdateItem.current = onUpdateItem;
	});

	useEffect(() => {
		if (uniqueValue) {
			updateItem(() => handleOnUpdateItem.current());
		}
	}, [uniqueValue, updateItem, handleOnUpdateItem]);
	useEffect(() => {
		if (!resultsItem) {
			return;
		}
		setData([resultsItem]);
	}, [resultsItem]);

	useEffect(() => {
		if (!resultsList) {
			return;
		}
		setData(resultsList);
	}, [resultsList]);

	return {
		isLoading: isLoadingList || isLoadingItem,
		isError: errorList || errorItem,
		result: data,
		search: handleOnSearch
	};
}
