import { getFullName } from './getFullName';

describe.each`
	obj                                                                                 | expected
	${{ lastName: 'last name', firstName: 'first name', middleName: 'middle name' }}    | ${'last name first name middle name'}
	${{ lastName: 'last name', firstName: 'first name' }}                               | ${'last name first name'}
	${{ lastName: 'last name' }}                                                        | ${'last name'}
	${{ middleName: 'middle name' }}                                                    | ${'middle name'}
	${{ firstName: 'first name' }}                                                      | ${'first name'}
	${{ lastName: 'last name', middleName: 'middle name' }}                             | ${'last name middle name'}
	${{ firstName: 'first name', middleName: 'middle name' }}                           | ${'first name middle name'}
	${{ last_name: 'last name', first_name: 'first name', middle_name: 'middle name' }} | ${'last name first name middle name'}
	${{ last_name: 'last name', first_name: 'first name' }}                             | ${'last name first name'}
	${{ last_name: 'last name' }}                                                       | ${'last name'}
	${{ middle_name: 'middle name' }}                                                   | ${'middle name'}
	${{ first_name: 'first name' }}                                                     | ${'first name'}
	${{ last_name: 'last name', middle_name: 'middle name' }}                           | ${'last name middle name'}
	${{ first_name: 'first name', middle_name: 'middle name' }}                         | ${'first name middle name'}
`('getFullName($obj)', ({ obj, expected }) => {
	test(`returns ${expected}`, () => {
		expect(getFullName(obj)).toEqual(expected);
	});
});
