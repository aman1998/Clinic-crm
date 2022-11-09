// TODO remove this intersepter after add public api interface
export const auth = {
	request: {
		onFulfilled: data => {
			const token = localStorage.getItem('token');

			return {
				...data,
				headers: {
					...data.headers,
					Authorization: `Bearer ${token}`
				}
			};
		},
		onRejected: null
	},

	response: {
		onFulfilled: null,
		onRejected: error => {
			if (error && error.isAxiosError && error.response?.status === 401) {
				localStorage.removeItem('token');
				localStorage.removeItem('branch');
				window.location.replace('/logout');
			}

			return Promise.reject(error);
		}
	}
};
