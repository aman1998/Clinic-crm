import { removeEmptyValuesFromObject } from './removeEmptyValuesFromObject';

/**
 * It is like _.defaults but works only with one object
 * @param {object} target
 * @param {object} defaultValues
 * @returns {object}
 */
export function defaults(target, defaultValues) {
	return { ...defaultValues, ...removeEmptyValuesFromObject(target) };
}
