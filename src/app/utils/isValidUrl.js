/**
 * Check on is valid url
 * @param url {string}
 * @return {boolean}
 */
export function isValidUrl(url) {
	try {
		return !!new URL(url);
	} catch (e) {
		return false;
	}
}
