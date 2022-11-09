import { removeEmptyValuesFromObject } from './removeEmptyValuesFromObject';

describe.each`
	obj                                            | expected
	${{ car: null, cat: undefined, color: 'red' }} | ${{ color: 'red' }}
	${{ car: 0, cat: false, color: '' }}           | ${{ car: 0, cat: false, color: '' }}
	${{ car: 10, cat: 3.1415926535, color: NaN }}  | ${{ car: 10, cat: 3.1415926535, color: NaN }}
	${{ car: {}, cat: [], color: undefined }}      | ${{ car: {}, cat: [] }}
	${{ car: null, cat: null, color: undefined }}  | ${{}}
`('removeEmptyValuesFromObject($obj)', ({ obj, expected }) => {
	test(`returns ${expected}`, () => {
		expect(removeEmptyValuesFromObject(obj)).toEqual(expected);
	});
});
