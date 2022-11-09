const KEY_MESSAGE = 'non_field_errors';

function getFieldErrors(errors) {
	if (typeof errors === 'object' && errors !== null && !Array.isArray(errors)) {
		return Object.entries(errors).map(([key, value]) => ({
			field: key,
			message: value ? getFieldErrors(value) : ''
		}));
	}

	if (Array.isArray(errors) && typeof errors[0] === 'string') {
		return errors.join(' ');
	}

	if (Array.isArray(errors)) {
		return errors.map(item => getFieldErrors(item));
	}

	return errors;
}

class ApiErrorHandling extends Error {
	constructor(err) {
		super();

		let error = err;
		if (typeof error !== 'object' || error === null) {
			error = {};
		}

		const structuredErrors = {
			name: 'ApiErrorHandling',
			code: null,
			data: null,
			userMessage: '',
			fieldErrors: []
		};

		if (
			!error.isAxiosError ||
			!error.response ||
			typeof error.response.data !== 'object' ||
			error.response.data === null
		) {
			Object.assign(this, structuredErrors);

			return;
		}

		if (error.response.status >= 400 && error.response.status < 500 && error.response.data) {
			structuredErrors.fieldErrors = getFieldErrors(error.response.data);
		}

		structuredErrors.code = error.response.status;
		structuredErrors.data = error.response.data;
		structuredErrors.userMessage = error.response.data[KEY_MESSAGE]?.join('. ') ?? '';
		Object.assign(this, structuredErrors);
	}
}

export const apiErrorHandler = {
	request: {
		onFulfilled: null,
		onRejected: null
	},

	response: {
		onFulfilled: null,
		// eslint-disable-next-line consistent-return
		onRejected: (error, config, code, request, response) => {
			// eslint-disable-next-line no-console
			console.log(error, config, code, request, response);
			if (error) return Promise.reject(new ApiErrorHandling(error));
		}
	}
};
