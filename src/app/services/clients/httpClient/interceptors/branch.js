export const branch = {
	request: {
		onFulfilled: request => {
			const currentBranch = localStorage.getItem('branch') ?? null;
			let { params } = request;
			let { data } = request;

			if (request.method === 'get') {
				params = {
					branch: currentBranch,
					...params
				};
			} else if (!data || (data instanceof Object && request.data.constructor === Object)) {
				data = {
					branch: currentBranch,
					...data
				};
			}

			return {
				...request,
				params,
				data
			};
		},
		onRejected: null
	},

	response: {
		onFulfilled: null,
		onRejected: null
	}
};
