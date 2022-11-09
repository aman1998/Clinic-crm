export const normalizeNumberType = event => {
	const re = /^[0-9\b]+$/;
	if (!re.test(event?.key)) event.preventDefault();
};

// eslint-disable-next-line radix
export const getOnlyNumber = str => parseInt(str.replace(/[^\d]/g, ''));
