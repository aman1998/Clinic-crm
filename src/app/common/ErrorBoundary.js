import { useEffect, useCallback } from 'react';
import { useAlert } from '../hooks';

export function ErrorBoundary({ children }) {
	const { alertError } = useAlert();

	const errorHandling = useCallback(
		event => {
			event.preventDefault();
			alertError('Произошла ошибка, приложение может работать некорректно.');
		},
		[alertError]
	);

	useEffect(() => {
		window.addEventListener('unhandledrejection', errorHandling);

		return () => window.removeEventListener('unhandledrejection', errorHandling);
	}, [errorHandling]);

	return children;
}
