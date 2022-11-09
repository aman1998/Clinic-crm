import { isValidUrl } from './isValidUrl';

describe.each`
	url                                               | expected
	${'http://mysite.com'}                            | ${true}
	${'https://mysite.com'}                           | ${true}
	${'https://mysite.com/'}                          | ${true}
	${' http://mysite.com '}                          | ${true}
	${' http://mysite.com/ '}                         | ${true}
	${' http://mysite.com/?test=test&test=&test="" '} | ${true}
	${'http://mysite.com/?test=test&test=&test=""'}   | ${true}
	${'http://mysite./?test=test&test=&test=""'}      | ${true}
	${'http:///?test=test&test=&test=""'}             | ${false}
	${''}                                             | ${false}
`('isValidUrl($url)', ({ url, expected }) => {
	test(`returns ${expected}`, () => {
		expect(isValidUrl(url)).toEqual(expected);
	});
});
