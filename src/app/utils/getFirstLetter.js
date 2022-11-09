/** return first letter
 * @param str {string}
 * @returns {string}
 */
export function getFirstLetter(str) {
	if (typeof str !== 'string') {
		return '';
	}

	return str[0];
}
