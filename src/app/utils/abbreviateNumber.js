export function abbreviateNumber(num) {
	const number = Math.trunc(num);
	const suffixes = ['', 'K', 'M', 'B', 'T'];
	const suffixNum = Math.floor(`${number}`.length / 3);
	let shortValue = parseFloat((suffixNum !== 0 ? number / Math.pow(1000, suffixNum) : number).toPrecision(2));

	if (shortValue % 1 !== 0) {
		shortValue = shortValue.toFixed(1);
	}

	return shortValue + suffixes[suffixNum];
}
