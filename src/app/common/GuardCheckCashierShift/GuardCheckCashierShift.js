import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import moment from 'moment';
import { ErrorMessage } from '../ErrorMessage';
import { ENTITY, financeService } from '../../services';
import { CASHIER_SHIFT_STATUS_OPEN } from '../../services/finance/constants';

export function GuardCheckCashierShift({ fallback, children, skipCheck }) {
	const date = moment().format('YYYY-MM-DD');
	const { isLoading, isError, data, refetch } = useQuery(
		[ENTITY.CASHIER_WORK_SHIFT_STATUS, date],
		() => financeService.getCashierShiftStatus(date),
		{ enabled: !skipCheck }
	);

	if (skipCheck) {
		return children({ retry: () => {} });
	}
	if (isLoading) {
		return null;
	}
	if (isError) {
		return <ErrorMessage />;
	}

	return data?.status === CASHIER_SHIFT_STATUS_OPEN
		? children({ retry: () => refetch() })
		: fallback({ isExists: !!data?.status, retry: () => refetch() });
}
GuardCheckCashierShift.defaultProps = {
	fallback: () => <></>,
	children: () => <></>,
	skipCheck: false
};
GuardCheckCashierShift.propTypes = {
	fallback: PropTypes.func,
	children: PropTypes.func,
	skipCheck: PropTypes.bool
};
