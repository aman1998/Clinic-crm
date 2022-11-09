import FuseSplashScreen from '@fuse/core/FuseSplashScreen';
import React, { useEffect, useState } from 'react';
import { getUserData } from 'app/auth/store/actions';
import { useDispatch } from 'react-redux';
import { authService } from '../services';

export default function Auth(props) {
	const dispatch = useDispatch();

	const [waitAuthCheck, setWaitAuthCheck] = useState(true);

	useEffect(() => {
		(async () => {
			const token = localStorage.getItem('token');

			if (!token) {
				setWaitAuthCheck(false);

				return;
			}

			try {
				await authService.checkToken({ token });
				await dispatch(getUserData());
			} catch (error) {
				localStorage.removeItem('token');
			}

			setWaitAuthCheck(false);
		})();
	}, [dispatch]);

	return waitAuthCheck ? <FuseSplashScreen /> : <>{props.children}</>;
}
