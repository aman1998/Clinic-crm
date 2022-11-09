import { useCallback } from 'react';
import { usePromise } from '../../hooks';
import { clinicService } from '../../services';

/**
 * @deprecated in favour of `useQuery([ENTITY.SERVICE])`
 */
export function useClinicService() {
	const { isLoading, error, results, update } = usePromise();

	const getClinicService = useCallback(uuid => update(() => clinicService.getServiceById(uuid)), [update]);

	return {
		isLoading,
		error,
		data: results,
		get: getClinicService
	};
}
