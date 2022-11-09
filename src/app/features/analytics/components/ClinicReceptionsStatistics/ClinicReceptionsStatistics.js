import React from 'react';
import PropTypes from 'prop-types';
import { useTheme, makeStyles } from '@material-ui/core';
import { BlockAnalyticsInfo } from '../BlockAnalyticsInfo';
import { numberFormat } from '../../../../utils';

const useStyles = makeStyles(() => ({
	blockAnalytic: {
		gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))'
	}
}));

export function ClinicReceptionsStatistics({ data }) {
	const theme = useTheme();
	const classes = useStyles();

	const DiversionItem = () => {
		const diversion = data.fact - data.plan;
		const percent = Math.round((data.plan * 100) / (data.fact || 1));
		let color;
		let statusText;

		if (diversion < 0) {
			color = theme.palette.error.main;
			statusText = `Отклонение от плана на ${Math.round(percent - (percent > 100 ? 100 : 0))}%`;
		}
		if (diversion > 0) {
			color = theme.palette.success.main;
			statusText = `План перевыполнен на ${Math.round(percent)}%`;
		}
		if (diversion === 0) {
			statusText = `Выполнено 100% от плана`;
		}

		return (
			<BlockAnalyticsInfo
				title="Отклонение"
				value={<>{numberFormat.currency(diversion)} ₸</>}
				info={<span style={{ color }}>{statusText}</span>}
				row={false}
			/>
		);
	};

	return (
		<>
			<div className={`grid gap-20 ${classes.blockAnalytic}`}>
				<BlockAnalyticsInfo title="Всего приемов" value={<span className="text-success">{data.count}</span>} />
				<BlockAnalyticsInfo
					title="Прием назначен"
					value={<span className="text-warning">{data.appointed}</span>}
				/>
				<BlockAnalyticsInfo
					title="Прием подтвержден"
					value={<span className="text-warning">{data.confirmed}</span>}
				/>
				<BlockAnalyticsInfo
					title="Отправлено на кассу"
					value={<span className="text-success">{data.cash}</span>}
				/>
				<BlockAnalyticsInfo
					title="Оплачено пациентом"
					value={<span className="text-success">{data.paid}</span>}
				/>
				<BlockAnalyticsInfo
					title="Прием не состоялся"
					value={<span className="text-error">{data.failed}</span>}
				/>
				<BlockAnalyticsInfo
					title="Прием не оплачен"
					value={<span className="text-error">{data.not_paid}</span>}
				/>
				<BlockAnalyticsInfo title="Прием отменен" value={<span className="text-error">{data.cancel}</span>} />
			</div>

			<div className={`grid gap-20 ${classes.blockAnalytic}`}>
				<BlockAnalyticsInfo
					title="План приемов"
					value={<span className="text-error">{numberFormat.currency(data.plan)} ₸</span>}
					info={<>Всего подтверждено: {data.confirmed}</>}
					row={false}
				/>
				<BlockAnalyticsInfo
					title="Факт приемов"
					value={<span className="text-error">{numberFormat.currency(data.fact)} ₸</span>}
					info={<>Состоялось приемов: {data.paid}</>}
					row={false}
				/>
				<DiversionItem />
			</div>
		</>
	);
}
ClinicReceptionsStatistics.propTypes = {
	data: PropTypes.shape({
		count: PropTypes.number.isRequired,
		appointed: PropTypes.number.isRequired,
		confirmed: PropTypes.number.isRequired,
		cash: PropTypes.number.isRequired,
		paid: PropTypes.number.isRequired,
		failed: PropTypes.number.isRequired,
		not_paid: PropTypes.number.isRequired,
		cancel: PropTypes.number.isRequired,
		plan: PropTypes.number.isRequired,
		fact: PropTypes.number.isRequired
	}).isRequired
};
