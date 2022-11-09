import Axios from 'axios';
import { auth, apiErrorHandler, branch } from './interceptors';

function setAxiosInstanceInterceptors(instance, interceptors) {
	interceptors.forEach(interceptor => {
		instance.interceptors.request.use(interceptor.request.onFulfilled, interceptor.request.onRejected);
		instance.interceptors.response.use(interceptor.response.onFulfilled, interceptor.response.onRejected);
	});
}

const config = {
	// baseURL: process.env.REACT_APP_HTTP_API_URL,
	withCredentials: true
};

export const axios = Axios.create(config);

setAxiosInstanceInterceptors(axios, [auth, apiErrorHandler, branch]);
