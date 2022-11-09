import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Paper, Typography, useTheme, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { useMutation, useQuery } from 'react-query';
import { TextField, Button, MenuItem, DatePickerField } from '../../../../bizKITUi';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { ENTITY, globalFinanceService } from '../../../../services';
import {
	PERIOD_TYPE_MONTH,
	PERIOD_TYPE_YEAR,
	PERIOD_TYPE_QUARTER,
	PERIOD_TYPE_DAY
} from '../../../../services/globalFinance/constants';
import {
	TableFinanceStatistics,
	TableFinanceStatisticsAccordion,
	TableFinanceStatisticsCell,
	TableFinanceStatisticsDetails,
	TableFinanceStatisticsSummary
} from '../TableFinanceStatistics';
import { numberFormat } from '../../../../utils';
import { useAlert, useDebouncedFilterForm } from '../../../../hooks';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
		[theme.breakpoints.down(1100)]: {
			gridTemplateRows: 'auto auto'
		}
	},
	resetBtn: {
		display: 'flex',
		marginLeft: 'auto',
		[theme.breakpoints.down(1100)]: {
			margin: '0'
		}
	}
}));

function Rows({ rows }) {
	const theme = useTheme();
	const { palette } = theme;

	return rows.map((row, index) => {
		const isCollapse = row.children.length > 0;
		const classList = clsx({
			'font-bold': row.level === 1,
			italic: row.level === 2,
			'bg-gray-100': row.level === 1 && index === rows.length - 1
		});

		return (
			<TableFinanceStatisticsAccordion key={index} title={row.name} className={classList} isCollapse={isCollapse}>
				<TableFinanceStatisticsSummary>
					{row.data.map((coll, collIndex) => (
						<Fragment key={collIndex}>
							{'plan' in coll && (
								<TableFinanceStatisticsCell className={classList}>
									{numberFormat.currency(coll.plan)}
								</TableFinanceStatisticsCell>
							)}

							{'fact' in coll && (
								<TableFinanceStatisticsCell className={classList}>
									{numberFormat.currency(coll.fact)}
								</TableFinanceStatisticsCell>
							)}

							{'difference' in coll && (
								<TableFinanceStatisticsCell
									className={classList}
									style={{
										color: coll.difference < 0 ? palette.error.main : palette.success.main
									}}
								>
									{numberFormat.currency(coll.difference)}
								</TableFinanceStatisticsCell>
							)}
						</Fragment>
					))}
				</TableFinanceStatisticsSummary>

				<TableFinanceStatisticsDetails>
					<Rows rows={row.children} />
				</TableFinanceStatisticsDetails>
			</TableFinanceStatisticsAccordion>
		);
	});
}
Rows.propTypes = {
	rows: PropTypes.instanceOf(Array)
};

const now = new Date();
const defaultValues = {
	fact: '',
	period_type: '',
	start_date: new Date(now.setMonth(now.getMonth() - 1)),
	end_date: new Date(),
	limit: 10,
	offset: 0
};

export function ListActionsIncomeLossReport() {
	const { alertError } = useAlert();
	const classes = useStyles();

	const { form, debouncedForm, setForm, handleChange, setInForm } = useDebouncedFilterForm(defaultValues);

	const { isLoading, isError, data: actionsIncomeLossReport } = useQuery(
		[ENTITY.GLOBAL_FINANCE_ACTION_INCOME_LOSS_REPORT_TREE, debouncedForm],
		() => globalFinanceService.getActionsIncomeLossReportAsTree(debouncedForm)
	);

	const { mutate: handleOnExportToExcel, isLoading: isLoadingExport } = useMutation(
		({ payload }) => globalFinanceService.exportIncomeLossReport(payload),
		{
			onError: () => alertError('Не удалось скачать файл!')
		}
	);

	return (
		<>
			<div className="flex justify-between items-center mb-32">
				<Typography color="secondary" className="text-xl font-bold text-center">
					Прибыль и убытки
				</Typography>
				<div className="flex">
					<Paper>
						<Button
							disabled={isLoadingExport || isLoading}
							onClick={() => handleOnExportToExcel({ payload: debouncedForm })}
							variant="outlined"
							textNormal
						>
							Экспорт в Excel
						</Button>
					</Paper>
				</div>
			</div>

			<Paper className="p-20 mt-32 mb-32">
				<div className={`gap-10 ${classes.form}`}>
					<TextField
						select
						label="План/Факт"
						variant="outlined"
						fullWidth
						size="small"
						name="fact"
						value={form.fact}
						onChange={handleChange}
					>
						<MenuItem value="">План/Факт</MenuItem>
						<MenuItem value="false">План</MenuItem>
						<MenuItem value="true">Факт</MenuItem>
					</TextField>

					<TextField
						select
						label="Тип периода"
						variant="outlined"
						fullWidth
						size="small"
						name="period_type"
						value={form.period_type}
						onChange={handleChange}
					>
						<MenuItem value="">Все</MenuItem>
						<MenuItem value={PERIOD_TYPE_DAY}>День</MenuItem>
						<MenuItem value={PERIOD_TYPE_MONTH}>Месяц</MenuItem>
						<MenuItem value={PERIOD_TYPE_QUARTER}>Квартал</MenuItem>
						<MenuItem value={PERIOD_TYPE_YEAR}>Год</MenuItem>
					</TextField>
					<DatePickerField
						label="Дата начала"
						fullWidth
						size="small"
						name="start_date"
						value={form.start_date}
						onlyValid
						onChange={date => setInForm('start_date', date)}
					/>
					<DatePickerField
						label="Дата завершения"
						fullWidth
						size="small"
						name="end_date"
						value={form.end_date}
						onlyValid
						onChange={date => setInForm('end_date', date)}
					/>

					<div className={classes.resetBtn}>
						<Button
							textNormal
							variant="outlined"
							onClick={() => setForm(defaultValues)}
							disabled={isLoading}
						>
							Сбросить
						</Button>
					</div>
				</div>
			</Paper>

			{isError ? (
				<ErrorMessage />
			) : isLoading ? (
				<FuseLoading />
			) : (
				<TableFinanceStatistics
					title="Статья"
					months={actionsIncomeLossReport.periods}
					headers={actionsIncomeLossReport.valuesName}
				>
					<Rows rows={actionsIncomeLossReport.rows} />
				</TableFinanceStatistics>
			)}
		</>
	);
}
