import { getKeyByValue } from './getKeyByValue';

describe.each`
	object                                          | value    | expected
	${{ carId: 'car', catId: 'cat', redId: 'red' }} | ${'car'} | ${'carId'}
	${{ carId: 'car ', redId: 'red' }}              | ${'car'} | ${undefined}
	${{ carId: 'car ', redId: 'red' }}              | ${' '}   | ${undefined}
	${{}}                                           | ${''}    | ${undefined}
	${{}}                                           | ${'car'} | ${undefined}
	${{ carId: 'car' }}                             | ${'car'} | ${'carId'}
`('getKeyByValue($object, $value)', ({ object, value, expected }) => {
	test(`returns ${expected}`, () => {
		expect(getKeyByValue(object, value)).toEqual(expected);
	});
});
