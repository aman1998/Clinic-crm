import { useCallback } from 'react';
import { usePromise } from '../../hooks';
import { clinicService } from '../../services';

/**
 * @deprecated in favour of `useQuery`
 */
export function useClinicReceptionsStatistics() {
	const { isLoading, error, results, update } = usePromise();

	const getClinicReceptionsStatistics = useCallback(
		uuid => update(() => clinicService.getClinicReceptionsStatistics(uuid).then(({ data }) => data)),
		[update]
	);

	return {
		isLoading,
		error,
		data: results,
		get: getClinicReceptionsStatistics
	};
}
