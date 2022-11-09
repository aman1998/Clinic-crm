import { useCallback } from 'react';
import { productsService } from '../../services/products';
import { usePromise } from '../../hooks';

/**
 * @deprecated in favour of `useQuery`
 */
export function useListProductsRemnants() {
	const { isLoading, error, results, update } = usePromise({ defaultResults: { list: [], totalCount: 0 } });

	const updateListProductsRemnants = useCallback(
		({ page = 0, limit = 10, ...params } = {}) => {
			update(() => {
				const modifyParams = {
					limit,
					offset: limit * page,
					...params
				};

				return productsService.getProductsRemnants(modifyParams).then(({ data }) => ({
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
			list: results.list,
			totalCount: results.totalCount
		},
		update: updateListProductsRemnants
	};
}
