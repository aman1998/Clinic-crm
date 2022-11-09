import * as Actions from '../actions';

const initialState = {
	title: ''
};

const toolbar = (state = initialState, action) => {
	switch (action.type) {
		case Actions.SET_TITLE: {
			return {
				...state,
				title: action.title
			};
		}

		default: {
			return state;
		}
	}
};

export default toolbar;
