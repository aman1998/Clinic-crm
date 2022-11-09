/**
 * Forms a link to raw data and saves it to the device
 * @param blob {Blob}
 * @param name {string | number}
 */
export function saveFile(blob, name = '') {
	const a = document.createElement('a');
	const url = window.URL.createObjectURL(blob);

	a.style = 'display: none';
	document.body.appendChild(a);
	a.href = url;
	a.download = name;
	a.click();

	window.URL.revokeObjectURL(url);
	document.body.removeChild(a);
}
