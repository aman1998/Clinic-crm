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
export function getFullName(obj) {
	const name = [];
	const lastName = obj?.lastName || obj?.last_name;
	const firstName = obj?.firstName || obj?.first_name;
	const middleName = obj?.middleName || obj?.middle_name;

	if (lastName) {
		name.push(lastName);
	}

	if (firstName) {
		name.push(firstName);
	}

	if (middleName) {
		name.push(middleName);
	}

	return name.join(' ');
}
