import { useCallback } from 'react';
import { usePromise } from '../../hooks';
import { productsService } from '../../services/products';

/**
 * @deprecated in favour of `useQuery`
 */
export function useProductRemnant() {
	const { isLoading, error, results, update } = usePromise();

	const getProductRemnant = useCallback(
		(uuid, params) => update(() => productsService.getProductRemnant(uuid, params).then(({ data }) => data)),
		[update]
	);

	return {
		isLoading,
		error,
		data: results,
		get: getProductRemnant
	};
}
