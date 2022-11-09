/**
 * Returns key by object value or undefined
 * @param object {object}
 * @param value {any}
 * @returns {string}
 */
export function getKeyByValue(object, value) {
	return Object.keys(object).find(key => object[key] === value);
}
