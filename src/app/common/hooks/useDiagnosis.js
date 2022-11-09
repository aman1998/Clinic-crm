import { useCallback } from 'react';
import { usePromise } from '../../hooks';
import { treatmentService } from '../../services';

/**
 * @deprecated in favour of `useQuery`
 */
export function useDiagnosis() {
	const { isLoading, error, results, update } = usePromise();

	const getDiagnosis = useCallback(
		uuid => update(() => treatmentService.getTreatmentTemplateByUuid(uuid).then(({ data }) => data)),
		[update]
	);

	return {
		isLoading,
		error,
		data: results,
		get: getDiagnosis
	};
}
