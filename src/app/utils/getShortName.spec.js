import { getShortName } from './getShortName';

describe.each`
	obj                                                                                 | expected
	${{ lastName: 'last name', firstName: 'first name', middleName: 'middle name' }}    | ${'last name f. m.'}
	${{ lastName: 'last name', firstName: 'first name' }}                               | ${'last name f.'}
	${{ lastName: 'last name' }}                                                        | ${'last name'}
	${{ middleName: 'middle name' }}                                                    | ${'m.'}
	${{ firstName: 'first name' }}                                                      | ${'f.'}
	${{ lastName: 'last name', middleName: 'middle name' }}                             | ${'last name m.'}
	${{ firstName: 'first name', middleName: 'middle name' }}                           | ${'f. m.'}
	${{ last_name: 'last name', first_name: 'first name', middle_name: 'middle name' }} | ${'last name f. m.'}
	${{ last_name: 'last name', first_name: 'first name' }}                             | ${'last name f.'}
	${{ last_name: 'last name' }}                                                       | ${'last name'}
	${{ middle_name: 'middle name' }}                                                   | ${'m.'}
	${{ first_name: 'first name' }}                                                     | ${'f.'}
	${{ last_name: 'last name', middle_name: 'middle name' }}                           | ${'last name m.'}
	${{ first_name: 'first name', middle_name: 'middle name' }}                         | ${'f. m.'}
`('getShortName($obj)', ({ obj, expected }) => {
	test(`returns ${expected}`, () => {
		expect(getShortName(obj)).toEqual(expected);
	});
});
