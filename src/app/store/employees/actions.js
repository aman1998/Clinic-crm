import { GET_DOCTORS } from './types';
import { employeesService } from '../../services';

export const getDoctorsList = params => dispatch => {
	dispatch({ type: GET_DOCTORS.PENDING });
	return employeesService
		.getDoctors(params)
		.then(({ data }) => {
			dispatch({
				type: GET_DOCTORS.SUCCESS,
				payload: data.results
			});
		})
		.catch(error => {
			dispatch({
				type: GET_DOCTORS.ERROR
			});

			throw error;
		});
};
