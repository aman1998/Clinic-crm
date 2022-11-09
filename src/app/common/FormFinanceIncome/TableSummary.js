import React from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import { Amount } from '../../bizKITUi';

function getCashbackAmount(totalCost, cashback) {
	if (!cashback) {
		return 0;
	}
	return totalCost * (cashback.accrual_percent / 100);
}
function getDiscountedCost(totalCost, discount) {
	if (!discount) {
		return 0;
	}
	return totalCost - (discount.write_off_percent / 100) * totalCost;
}
function getDiscountAmount(totalCost, discountedCost, discountValue) {
	if (discountValue) {
		return -1 * discountValue;
	}
	return discountedCost - totalCost;
}
function getTotalPayableAmount(totalCost, bonusesWrittenOff, discount, discountedCost) {
	if (bonusesWrittenOff) {
		return totalCost - bonusesWrittenOff;
	}
	if (discount) {
		return discountedCost;
	}
	return totalCost;
}

export function TableSummary({
	totalCost,
	bonusesWrittenOff,
	discount,
	cashback,
	discountValue,
	cashbackValue,
	totalPayable
}) {
	const discountedCost = getDiscountedCost(totalCost, discount);
	const totalPayableAmount =
		totalPayable ?? getTotalPayableAmount(totalCost, bonusesWrittenOff, discount, discountedCost);
	const cashbackAmount = cashbackValue ?? getCashbackAmount(totalCost, cashback);
	const discountAmount = getDiscountAmount(totalCost, discountedCost, discountValue);

	return (
		<Table>
			<TableBody>
				<TableRow className="bg-grey-100">
					<TableCell colSpan={3}>Сумма услуг и медикаментов</TableCell>
					<TableCell align="right">
						<Amount value={totalCost} />
					</TableCell>
				</TableRow>
				{!!bonusesWrittenOff && (
					<TableRow className="bg-grey-100">
						<TableCell colSpan={3}>Использовано бонусов</TableCell>
						<TableCell align="right">
							<Amount className="text-error" value={-1 * bonusesWrittenOff} />
						</TableCell>
					</TableRow>
				)}
				{!!discount && (
					<TableRow className="bg-grey-100">
						<TableCell colSpan={3}>{discount.name}</TableCell>
						<TableCell align="right">
							<Amount className="text-error" value={discountAmount} />
						</TableCell>
					</TableRow>
				)}
				<TableRow className="bg-grey-100">
					<TableCell colSpan={3}>Итого к оплате</TableCell>
					<TableCell align="right">
						<Amount value={totalPayableAmount} />
					</TableCell>
				</TableRow>
				{!!cashback && !discount && (
					<TableRow>
						<TableCell colSpan={3}>{cashback.name}</TableCell>
						<TableCell align="right">
							<Amount className="text-success" showPositiveSign value={cashbackAmount} />
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}
TableSummary.defaultProps = {
	discount: null,
	cashback: null,
	bonusesWrittenOff: 0,
	discountValue: null,
	cashbackValue: null,
	totalPayable: null
};
TableSummary.propTypes = {
	discount: PropTypes.shape({
		name: PropTypes.string.isRequired,
		write_off_percent: PropTypes.number.isRequired
	}),
	cashback: PropTypes.shape({
		name: PropTypes.string.isRequired,
		accrual_percent: PropTypes.number.isRequired
	}),
	bonusesWrittenOff: PropTypes.number,
	totalCost: PropTypes.number.isRequired,
	discountValue: PropTypes.number,
	cashbackValue: PropTypes.number,
	totalPayable: PropTypes.number
};
