import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import { Amount } from '../../../../bizKITUi';

export function PayoutDetails({ payoutValue, payoutPercent, payoutPercentWithExpense }) {
	return (
		<>
			{!!payoutPercent && (
				<>
					<Typography component="span" color="primary">
						{payoutPercent}%
					</Typography>
					{!!(payoutPercentWithExpense || payoutValue) && ' + '}
				</>
			)}
			{!!payoutPercentWithExpense && (
				<>
					<Typography component="span" color="error">
						{payoutPercentWithExpense}%
					</Typography>
					{!!payoutValue && ' + '}
				</>
			)}
			{!!payoutValue && (
				<Typography component="span" color="secondary">
					<Amount value={payoutValue} />
				</Typography>
			)}
			{!payoutPercent && !payoutPercentWithExpense && !payoutValue && '—'}
		</>
	);
}
PayoutDetails.defaultProps = {
	payoutPercent: null,
	payoutPercentWithExpense: null,
	payoutValue: null
};
PayoutDetails.propTypes = {
	payoutPercent: PropTypes.number,
	payoutPercentWithExpense: PropTypes.number,
	payoutValue: PropTypes.number
};
