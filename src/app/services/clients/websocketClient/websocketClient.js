import ReconnectingWebSocket from 'reconnecting-websocket';

const WEBSOCKET_API_URL = process.env.REACT_APP_WEBSOCKET_API_URL;
const connectionMap = {};

class WebSocketClientErrorHandling extends Error {
	constructor(error) {
		super();
		this.name = 'WebSocketClientErrorHandling';
		this.message = error?.message ?? error ?? '';
	}
}

export function webSocketClient(url, customConfig = {}) {
	if (url in connectionMap) {
		return connectionMap[url];
	}

	const delayBeforeClose = 5000;
	const protocols = null;
	const config = { debug: false, reconnectInterval: 30000, ...customConfig };
	const token = localStorage.getItem('token');
	const ws = new ReconnectingWebSocket(`${WEBSOCKET_API_URL}${url}?token=${token}`, protocols, config);

	const closeConnectionIfNotUsed = () => {
		if (ws.readyState === ws.OPEN && onmessageList.size > 0) {
			return;
		}

		ws.close();
	};
	const intervalId = setInterval(closeConnectionIfNotUsed, delayBeforeClose);

	const onmessageList = new Set();
	const onopenList = new Set();
	const onerrorList = new Set();
	const oncloseList = new Set();

	ws.onmessage = ({ data }) => {
		let parsedData = data;
		try {
			parsedData = JSON.parse(data);
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error(new WebSocketClientErrorHandling(`Invalid response from ${origin}`));
		}

		onmessageList.forEach(fn => {
			fn(parsedData);
		});
	};
	ws.onopen = data => {
		onopenList.forEach(fn => fn(data));
	};
	ws.onerror = error => {
		onerrorList.forEach(fn => fn(error));
	};
	ws.onclose = data => {
		oncloseList.forEach(fn => fn(data));
	};

	onerrorList.add(error => {
		// eslint-disable-next-line no-console
		console.error(new WebSocketClientErrorHandling(error));
	});

	oncloseList.add(() => {
		delete connectionMap[url];
		clearInterval(intervalId);
	});

	function subscribe(fn) {
		onmessageList.add(fn);

		return () => unsubscribe(fn);
	}
	function unsubscribe(fn) {
		onmessageList.delete(fn);
	}

	function send(data) {
		const dataAsJSON = JSON.stringify(data);

		return new Promise(resolve => {
			if (ws.readyState !== ws.OPEN) {
				const onopen = () => {
					ws.send(dataAsJSON);
					onopenList.delete(onopen);
					resolve();
				};
				onopenList.add(onopen);

				return;
			}

			ws.send(dataAsJSON);
			resolve();
		});
	}

	connectionMap[url] = {
		subscribe,
		send
	};

	return connectionMap[url];
}
