import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { Grid, useTheme } from '@material-ui/core';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { numberFormat } from '../../../../utils';
import { BlockInfo } from '../../../../common/BlockInfo';
import { Accordion } from '../../../../bizKITUi';
import { ENTITY, financeService } from '../../../../services';

export function ReportDayStatistics({ filter }) {
	const { palette } = useTheme();

	const { isLoading, isFetching, isError, data } = useQuery(
		[ENTITY.FINANCE_ACTION_REPORT_DAY_STATISTIC, filter],
		({ queryKey }) => financeService.getFinanceActionsReportDayStatistics(queryKey[1]).then(res => res.data)
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
					<BlockInfo title="Общая сумма приемов" color={palette.success.main}>
						{numberFormat.currency(data.receptions_sum)} ₸
					</BlockInfo>
				</Grid>
				<Grid item lg={3} xs={6}>
					<BlockInfo title="Сумма выплат врачам" color={palette.error.main}>
						{numberFormat.currency(data.doctors_sum)} ₸
					</BlockInfo>
				</Grid>
				<Grid item lg={3} xs={6}>
					<BlockInfo title="Выплачено врачам" color={palette.error.main}>
						{numberFormat.currency(data.doctors_paid)} ₸
					</BlockInfo>
				</Grid>
				<Grid item lg={3} xs={6}>
					<BlockInfo title="Осталось выплатить" color={palette.warning.main}>
						{numberFormat.currency(data.left_pay_doctors)} ₸
					</BlockInfo>
				</Grid>
			</Grid>
		</Accordion>
	);
}
ReportDayStatistics.defaultProps = {
	filter: {}
};
ReportDayStatistics.propTypes = {
	filter: PropTypes.object
};
