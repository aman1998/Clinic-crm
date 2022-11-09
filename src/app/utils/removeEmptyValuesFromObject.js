/**
 * Remove empty values from object
 * @param obj {object}
 * @returns {object}
 */
export function removeEmptyValuesFromObject(obj) {
	return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value !== undefined && value !== null));
}
