import { useRef, useEffect } from 'react';
import deepEqual from 'lodash/isEqual';

function checkDeps(deps) {
	if (!deps || !deps.length) {
		throw new Error('useDeepCompareEffect should not be used with no dependencies. Use useEffect instead.');
	}
	if (deps.every(isPrimitive)) {
		throw new Error(
			'useDeepCompareEffect should not be used with dependencies that are all primitive values. Use React.useEffect instead.'
		);
	}
}

function isPrimitive(val) {
	return val == null || /^[sbn]/.test(typeof val);
}

function useDeepCompareMemoize(value) {
	const ref = useRef();

	if (!deepEqual(value, ref.current)) {
		ref.current = value;
	}

	return ref.current;
}

/**
 * @deprecated in favour of `useEffect`
 * @param {Function} callback
 * @param {Array} dependencies
 */
export function useDeepCompareEffect(callback, dependencies) {
	if (process.env.NODE_ENV !== 'production') {
		checkDeps(dependencies);
	}
	useEffect(callback, useDeepCompareMemoize(dependencies));
}
