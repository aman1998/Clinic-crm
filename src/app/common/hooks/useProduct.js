import { useCallback } from 'react';
import { usePromise } from '../../hooks';
import { productsService } from '../../services/products';

/**
 * @deprecated in favour of `useQuery`
 */
export function useProduct() {
	const { isLoading, error, results, update } = usePromise();

	const getProduct = useCallback(uuid => update(() => productsService.getProduct(uuid).then(({ data }) => data)), [
		update
	]);

	return {
		isLoading,
		error,
		data: results,
		get: getProduct
	};
}
