/**
 * Replaces undefined or null with an empty string
 * @param obj {object}
 * @returns {object}
 */
export function normalizeObject(obj) {
	return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, value ?? '']));
}
