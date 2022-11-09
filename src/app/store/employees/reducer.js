import { GET_DOCTORS } from './types';

const initialState = {
	doctorsList: [],
	isDoctorsListPending: false
};

export default function (state = initialState, { type, payload }) {
	switch (type) {
		case GET_DOCTORS.PENDING:
			return {
				...state,
				isDoctorsListPending: true
			};
		case GET_DOCTORS.SUCCESS:
			return {
				...state,
				doctorsList: payload,
				isDoctorsListPending: false
			};
		case GET_DOCTORS.ERROR:
			return {
				...state,
				isDoctorsListPending: false
			};
		default: {
			return state;
		}
	}
}
