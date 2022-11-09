import { uniqueId } from 'lodash';
import { useMemo } from 'react';

/**
 * Generates unique id and returns it memoized value
 * @returns {string}
 */
export function useUniqueId() {
	return useMemo(() => uniqueId(), []);
}
