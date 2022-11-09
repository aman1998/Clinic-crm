import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import { numberFormat } from '../../utils';

const GLYPH = {
	KZT: '₸'
};

/**
 * Displays formatted amount of currency with currency glyph
 * @param {object} props
 * @param {number} props.value amount of money
 * @param {('KZT')} [props.currency=KZT] ISO-4217 (3-symbols) currency code e.g. KZT
 * @param {boolean} [props.showPositiveSign=false] Shows plus sign for positive numbers
 */
export function Amount({ value, currency, showPositiveSign, className }) {
	return (
		<Typography variant="inherit" component="span" display="inline" className={className}>
			{showPositiveSign && value > 0 && '+'}
			{numberFormat.currency(value)}&nbsp;{GLYPH[currency]}
		</Typography>
	);
}
Amount.defaultProps = {
	className: null,
	currency: 'KZT',
	showPositiveSign: false
};
Amount.propTypes = {
	className: PropTypes.string,
	currency: PropTypes.oneOf(Object.keys(GLYPH)),
	value: PropTypes.number.isRequired,
	showPositiveSign: PropTypes.bool
};
