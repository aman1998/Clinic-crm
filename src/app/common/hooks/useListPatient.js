import { useCallback } from 'react';
import { patientsService } from '../../services';
import { usePromise } from '../../hooks';

/**
 * @deprecated in favour of `useQuery`
 */
export function useListPatient() {
	const { isLoading, error, results, update } = usePromise({ defaultResults: { list: [], totalCount: 0 } });

	const updateListServices = useCallback(
		({ search, page = 0, limit = 10 } = {}) => {
			update(() => {
				const params = {
					search,
					limit,
					offset: limit * page
				};

				return patientsService.getPatients(params).then(({ data }) => ({
					list: data.results,
					totalCount: data.count
				}));
			});
		},
		[update]
	);

	return {
		isLoading,
		error,
		data: {
			list: results?.list ?? [],
			totalCount: results?.totalCount ?? 0
		},
		update: updateListServices
	};
}
