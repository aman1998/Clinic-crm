import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Paper } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Refresh as RefreshIcon } from '@material-ui/icons';
import { Button, DatePickerField, DataTable, ServerAutocomplete } from '../../../../bizKITUi';
import { useDebouncedFilterForm } from '../../../../hooks';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { numberFormat, getFullName } from '../../../../utils';
import { ReportDayStatistics } from '../ReportDayStatistics';
import { ModalFinanceExpense } from '../../../../common/ModalFinanceExpense';
import { employeesService, ENTITY, financeService } from '../../../../services';

const useStyles = makeStyles(theme => ({
	itemDoctor: {
		maxWidth: 220,
		minWidth: 220,
		marginLeft: theme.spacing(2)
	},
	itemDate: {
		maxWidth: 170,
		minWidth: 170
	},
	button: {
		marginLeft: theme.spacing(2)
	},
	formContainer: {
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(2),
		padding: theme.spacing(2)
	}
}));

export function ListFinanceActionsReportDay() {
	const classes = useStyles();
	const { palette } = useTheme();

	const { form, debouncedForm, getPage, setPage, setInForm, resetForm } = useDebouncedFilterForm({
		date: new Date(),
		doctor: null,
		limit: 10,
		offset: 0
	});
	const { isLoading, isError, data } = useQuery([ENTITY.FINANCE_ACTION_REPORT_DAY, debouncedForm], ({ queryKey }) =>
		financeService.getFinanceActionsReportDay(queryKey[1]).then(res => res.data)
	);

	const [selectedActionReportDay, setSelectedActionReportDay] = useState(null);

	const columns = [
		{
			name: 'doctor',
			label: 'Врач',
			options: {
				customBodyRenderLite: dataIndex => {
					return getFullName(data.results[dataIndex]);
				}
			}
		},
		{
			name: 'NumberAppointmentsPlan',
			label: 'Кол-во приемов план',
			options: {
				customBodyRenderLite: dataIndex => {
					return data.results[dataIndex].receptions_plan;
				}
			}
		},
		{
			name: 'NumberReceptionsFact',
			label: 'Кол-во приемов факт',
			options: {
				customBodyRenderLite: dataIndex => {
					return data.results[dataIndex].receptions_fact;
				}
			}
		},
		{
			name: 'amountReceptionsPlan',
			label: 'Сумма приемов план',
			options: {
				customBodyRenderLite: dataIndex => {
					return `${numberFormat.currency(data.results[dataIndex].receptions_sum_plan)} ₸`;
				}
			}
		},
		{
			name: 'sumReceptionsFact',
			label: 'Сумма приемов факт',
			options: {
				customBodyRenderLite: dataIndex => {
					return `${numberFormat.currency(data.results[dataIndex].receptions_sum_fact)} ₸`;
				}
			}
		},
		{
			name: 'amountToBePaid',
			label: 'Сумма к выплате',
			options: {
				customBodyRenderLite: dataIndex => {
					return `${numberFormat.currency(data.results[dataIndex].paid_sum)} ₸`;
				}
			}
		},
		{
			name: 'amountToBePaid',
			label: 'Выплачено врачу',
			options: {
				customBodyRenderLite: dataIndex => {
					return `${numberFormat.currency(data.results[dataIndex].paid_doctor)} ₸`;
				}
			}
		},
		{
			name: 'amountToPaid',
			label: 'Осталось выплатить',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];

					return `${numberFormat.currency(currentItem.paid_sum - currentItem.paid_doctor)} ₸`;
				}
			}
		},
		{
			name: 'paymentState',
			label: 'Статус оплаты',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];

					return currentItem.status ? (
						<div style={{ color: palette.success.main }}>Оплачено врачу</div>
					) : (
						<div style={{ color: palette.error.main }}>Ожидание оплаты</div>
					);
				}
			}
		}
	];
	const tableOptions = {
		serverSide: true,
		rowsPerPage: form.limit,
		page: getPage(),
		count: data?.count ?? 0,
		onRowClick: (_, rowMeta) => {
			setSelectedActionReportDay(data.results[rowMeta.dataIndex]);
		},
		onChangePage: page => setPage(page),
		onChangeRowsPerPage: limit => setInForm('limit', limit)
	};

	return (
		<>
			<Paper className={classes.formContainer}>
				<form className="flex">
					<DatePickerField
						label="Дата "
						inputVariant="outlined"
						size="small"
						fullWidth
						onlyValid
						className={classes.itemDate}
						value={form.date}
						onChange={date => setInForm('date', date)}
					/>

					<ServerAutocomplete
						name="doctor"
						label="Врач"
						className={classes.itemDoctor}
						InputProps={{
							size: 'small'
						}}
						value={form.doctor}
						onChange={value => setInForm('doctor', value?.uuid ?? null)}
						getOptionLabel={option => getFullName(option)}
						onFetchList={(search, limit) =>
							employeesService.getDoctors({ search, limit }).then(res => res.data)
						}
						onFetchItem={fetchUuid => employeesService.getDoctor(fetchUuid).then(res => res.data)}
					/>

					<div className="ml-auto">
						<Button
							aria-label="Сбросить"
							type="reset"
							className={classes.button}
							disabled={isLoading}
							onClick={() => resetForm()}
						>
							<RefreshIcon />
						</Button>
					</div>
				</form>
			</Paper>

			<div className="my-16">
				<ReportDayStatistics filter={debouncedForm} />
			</div>

			{isLoading ? (
				<FuseLoading />
			) : isError ? (
				<ErrorMessage />
			) : (
				<DataTable columns={columns} options={tableOptions} data={data.results} />
			)}

			{selectedActionReportDay && (
				<ModalFinanceExpense
					isOpen
					onClose={() => setSelectedActionReportDay(null)}
					financeActionUuid={
						selectedActionReportDay.status ? selectedActionReportDay.paid_doctor_action_uuid : null
					}
					initialValues={{
						value: selectedActionReportDay.paid_sum - selectedActionReportDay.paid_doctor,
						state: selectedActionReportDay.paid_doctor_finance_state,
						counterparty: selectedActionReportDay.uuid,
						paid_date_time: form.date
					}}
				/>
			)}
		</>
	);
}
