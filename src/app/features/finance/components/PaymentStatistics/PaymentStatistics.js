import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { Grid, useTheme } from '@material-ui/core';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { numberFormat } from '../../../../utils';
import { BlockInfo } from '../../../../common/BlockInfo';
import { Accordion } from '../../../../bizKITUi/Accordion';
import { ENTITY, financeService } from '../../../../services';

export function PaymentStatistics({ filter }) {
	const { palette } = useTheme();

	const { isLoading, isFetching, isError, data } = useQuery(
		[ENTITY.FINANCE_ACTION_STATISTIC, filter],
		({ queryKey }) => financeService.getFinanceActionsStatistics(queryKey[1]).then(res => res.data)
	);

	if (isLoading) {
		return <></>;
	}
	if (isError) {
		return <ErrorMessage />;
	}
	return (
		<Accordion title="Показать общую статистику">
			<Grid container spacing={2} style={{ opacity: isFetching ? '0.5' : 1 }}>
				<Grid item lg={3} xs={6}>
					<BlockInfo title="Оплачено пациентами" color={palette.success.main}>
						{numberFormat.currency(data.patients)} ₸
					</BlockInfo>
				</Grid>
				<Grid item lg={3} xs={6}>
					<BlockInfo title="Выплаты врачам" color={palette.error.main}>
						{numberFormat.currency(data.doctors)} ₸
					</BlockInfo>
				</Grid>
				<Grid item lg={3} xs={6}>
					<BlockInfo title="Партнерские выплаты" color={palette.error.main}>
						{numberFormat.currency(data.partners)} ₸
					</BlockInfo>
				</Grid>
				<Grid item lg={3} xs={6}>
					<BlockInfo title="Доступно к перемещению" color={palette.warning.main}>
						{numberFormat.currency(data.available)} ₸
					</BlockInfo>
				</Grid>
			</Grid>
		</Accordion>
	);
}
PaymentStatistics.defaultProps = {
	filter: {}
};
PaymentStatistics.propTypes = {
	filter: PropTypes.object
};
