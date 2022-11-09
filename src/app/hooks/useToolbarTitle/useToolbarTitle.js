import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setToolbarTitle } from '../../store/fuse/actions';

/**
 * Sets page title in toolbar
 * @param {string|{ name: string, content: JSX.Element }} title
 */
export function useToolbarTitle(title) {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setToolbarTitle(title));
		return () => {
			dispatch(setToolbarTitle(''));
		};
	}, [title, dispatch]);
}
