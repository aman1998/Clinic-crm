import { useState, useRef } from 'react';
import { usePromise as usePromiseLib } from 'react-use';

/**
 * @deprecated in favour of `useQuery` from `react-query` lib
 */
export const usePromise = ({ defaultResults } = {}) => {
	const mounted = usePromiseLib();
	const [status, setStatus] = useState({
		isLoading: false,
		error: null,
		results: defaultResults ?? null
	});

	const updateRef = useRef(promise => {
		setStatus(state => ({
			...state,
			error: null,
			isLoading: true
		}));

		mounted(promise())
			.then(data => {
				setStatus({
					isLoading: false,
					error: null,
					results: data
				});
			})
			.catch(error => {
				// eslint-disable-next-line no-console
				console.error(error);

				setStatus(state => ({
					...state,
					isLoading: false,
					error
				}));
			});
	});

	const updateWithoutLoadingStateRef = useRef(promise => {
		setStatus(state => ({
			...state,
			error: null
		}));

		mounted(promise())
			.then(data => {
				setStatus(state => ({
					...state,
					error: null,
					results: data
				}));
			})
			.catch(error => {
				// eslint-disable-next-line no-console
				console.error(error);

				setStatus(state => ({
					...state,
					error
				}));
			});
	});

	return { ...status, update: updateRef.current, updateWithoutLoadingState: updateWithoutLoadingStateRef.current };
};
