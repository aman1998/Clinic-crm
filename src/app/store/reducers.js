import auth from 'app/auth/store/reducers';

import { combineReducers } from 'redux';
import notifications from './notifications/reducer';
import employees from './employees/reducer';

import fuse from './fuse/reducers';

const createReducer = asyncReducers =>
	combineReducers({
		auth,
		fuse,
		notifications,
		employees,

		...asyncReducers
	});

export default createReducer;
