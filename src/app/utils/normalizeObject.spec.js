import { normalizeObject } from './normalizeObject';

describe.each`
	obj                                            | expected
	${{ car: null, cat: undefined, color: 'red' }} | ${{ car: '', cat: '', color: 'red' }}
	${{ car: 0, cat: false, color: '' }}           | ${{ car: 0, cat: false, color: '' }}
	${{ car: 10, cat: 3.1415926535, color: NaN }}  | ${{ car: 10, cat: 3.1415926535, color: NaN }}
	${{ car: {}, cat: [], color: undefined }}      | ${{ car: {}, cat: [], color: '' }}
`('normalizeObject($obj)', ({ obj, expected }) => {
	test(`returns ${expected}`, () => {
		expect(normalizeObject(obj)).toEqual(expected);
	});
});
