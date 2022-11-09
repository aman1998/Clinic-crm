import { getFirstLetter } from './getFirstLetter';

describe.each`
	str                  | expected
	${'Misha Mihail'}    | ${'M'}
	${'   Misha Mihail'} | ${' '}
	${'Misha__$@#'}      | ${'M'}
	${'M isha__$'}       | ${'M'}
`('getFirstLetter($str)', ({ str, expected }) => {
	test(`returns ${expected}`, () => {
		expect(getFirstLetter(str)).toEqual(expected);
	});
});
