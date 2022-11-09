export function jsonToFormData(json) {
	const formData = new FormData();

	Object.keys(json).map(key =>
		Array.isArray(json[key]) ? json[key].map(value => formData.append(key, value)) : formData.append(key, json[key])
	);

	return formData;
}
