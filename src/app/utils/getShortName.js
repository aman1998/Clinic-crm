import { getFirstLetter } from './getFirstLetter';

/**
 * Return full name
 * @param obj {object}
 * @param obj.lastName {string}
 * @param obj.last_name {string}
 * @param obj.firstName {string}
 * @param obj.first_name {string}
 * @param obj.middleName {string}
 * @param obj.middle_name {string}
 * @return {string}
 */
export function getShortName(obj) {
	const name = [];
	const lastName = obj?.lastName || obj?.last_name;
	const firstName = obj?.firstName || obj?.first_name;
	const middleName = obj?.middleName || obj?.middle_name;

	if (lastName) {
		name.push(lastName);
	}

	if (firstName) {
		name.push(`${getFirstLetter(firstName)}.`);
	}

	if (middleName) {
		name.push(`${getFirstLetter(middleName)}.`);
	}

	return name.join(' ');
}
