import { toBoolean } from './toBoolean';

describe.each`
	value      | expected
	${'true'}  | ${true}
	${1}       | ${true}
	${'y'}     | ${true}
	${true}    | ${true}
	${'false'} | ${false}
	${false}   | ${false}
`('toBoolean($value)', ({ value, expected }) => {
	test(`returns ${expected}`, () => {
		expect(toBoolean(value)).toEqual(expected);
	});
});
