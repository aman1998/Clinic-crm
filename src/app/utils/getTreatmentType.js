export function getTreatmentType(type) {
	if (type === 'blank') return 'На дому';
	if (type === 'service') return 'Стационарный';
	if (type === 'mixed') return 'Смешанный';
	return '';
}
