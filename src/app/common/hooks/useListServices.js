import { useCallback } from 'react';
import { clinicService } from '../../services';
import { usePromise } from '../../hooks';

/**
 * @deprecated in favour of `useQuery`
 */
export function useListServices() {
	const { isLoading, error, results, update } = usePromise({
		defaultResults: {
			list: [],
			totalCount: 0
		}
	});

	const updateListServices = useCallback(
		({ page = 0, limit = 10, ...params } = {}) => {
			update(() => {
				const modifyParams = {
					...params,
					limit,
					offset: limit * page
				};

				return clinicService.getServices(modifyParams).then(({ data }) => ({
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
			list: results?.list,
			totalCount: results?.totalCount
		},
		update: updateListServices
	};
}
