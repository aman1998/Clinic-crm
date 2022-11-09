import { useCallback } from 'react';
import { debounce } from '@material-ui/core';

export function useDebounce(fn, delay = 250) {
	return useCallback(debounce(fn, delay), []);
}
