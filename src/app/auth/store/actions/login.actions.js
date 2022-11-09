import * as Actions from 'app/store/fuse/actions';
import { authService, auth } from '../../../services';
import * as UserActions from './user.actions';

export const LOGIN_ERROR = 'LOGIN_ERROR';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';

export function submitLogin(authData) {
	return dispatch =>
		authService
			.loginIn(authData)
			.then(res => {
				dispatch(getUserData());
				localStorage.setItem('token', res.data.access);
				return dispatch({
					type: LOGIN_SUCCESS
				});
			})
			.catch(error => {
				dispatch(Actions.showMessage({ message: 'Ошибка авторизации' }));
				return dispatch({
					type: LOGIN_ERROR,
					payload: error
				});
			});
}

export function getUserData() {
	return dispatch =>
		auth
			.getUserData()
			.then(res => {
				dispatch(UserActions.setUserData(res.data));
			})
			.catch(error => {});
}
