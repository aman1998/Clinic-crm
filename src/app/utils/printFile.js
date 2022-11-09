/**
 * Forms a link to raw data and prints
 * @param blob {Blob}
 * @param name {string | number}
 */
const createObjectURL = file => {
	if (window.webkitURL) {
		return window.webkitURL.createObjectURL(file);
	}
	if (window.URL && window.URL.createObjectURL) {
		return window.URL.createObjectURL(file);
	}
	return null;
};

export const printFile = (blob, name = '') => {
	const iframe = document.createElement('iframe');
	const url = createObjectURL(blob);
	iframe.style = 'display: none';
	iframe.src = url;

	iframe.onload = () => {
		iframe.contentWindow.print();
	};

	document.body.appendChild(iframe);
};
