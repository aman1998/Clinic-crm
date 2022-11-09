import { defaults } from './defaults';

describe.each`
	target                  | defaultValues             | expected
	${{ foo: undefined }}   | ${{ foo: 10 }}            | ${{ foo: 10 }}
	${{ foo: 10 }}          | ${{ foo: undefined }}     | ${{ foo: 10 }}
	${{ foo: null }}        | ${{ foo: 10 }}            | ${{ foo: 10 }}
	${{ foo: 10 }}          | ${{ foo: null }}          | ${{ foo: 10 }}
	${{ foo: 10, bar: 12 }} | ${{ foo: null }}          | ${{ foo: 10, bar: 12 }}
	${{ foo: 10 }}          | ${{ foo: null, bar: 12 }} | ${{ foo: 10, bar: 12 }}
`('defaults($target, $defaultValues)', ({ target, defaultValues, expected }) => {
	test(`returns ${JSON.stringify(expected)}`, () => {
		expect(defaults(target, defaultValues)).toEqual(expected);
	});
});
