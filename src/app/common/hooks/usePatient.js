import { useCallback } from 'react';
import { usePromise } from '../../hooks';
import { patientsService } from '../../services';

/**
 * @deprecated in favour of `useQuery`
 */
export function usePatient() {
	const { isLoading, error, results, update } = usePromise();

	const getPatient = useCallback(
		uuid => update(() => patientsService.getPatientByUuid(uuid).then(({ data }) => data)),
		[update]
	);

	return {
		isLoading,
		error,
		data: results,
		get: getPatient
	};
}
