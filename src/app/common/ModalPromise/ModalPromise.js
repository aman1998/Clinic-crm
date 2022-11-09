import React, { Fragment, useEffect, useState } from 'react';

export const modalPromise = {
	elementsList: [],
	subscribeList: [],

	subscribe(fn) {
		this.subscribeList.push(fn);
	},

	setElementsList(list) {
		this.elementsList = list;

		this.subscribeList.forEach(subscribe => subscribe(this.elementsList));
	},

	closeLastElement() {
		this.setElementsList([...this.elementsList.slice(0, -1)]);
	},

	open(fn) {
		return new Promise(resolve => {
			const status = {
				isClose: false,
				isReject: false,
				isSuccess: false
			};

			const component = fn({
				onClose: payload => {
					resolve({ ...status, isClose: true, payload });
					this.closeLastElement();
				},
				onReject: payload => {
					resolve({ ...status, isReject: true, payload });
					this.closeLastElement();
				},
				onSuccess: payload => {
					resolve({ ...status, isSuccess: true, payload });
					this.closeLastElement();
				}
			});

			this.setElementsList([...this.elementsList, component]);
		});
	}
};

export function ModalPromiseContainer() {
	const [modals, setModals] = useState([]);

	useEffect(() => {
		modalPromise.subscribe(setModals);
	}, []);

	return modals.map((modal, index) => <Fragment key={index}>{modal}</Fragment>);
}
