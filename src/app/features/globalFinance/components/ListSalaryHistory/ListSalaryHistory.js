import React from 'react';
import { useQuery } from 'react-query';
import moment from 'moment';
import { MenuItem, Paper, makeStyles } from '@material-ui/core';
import { Button, DataTable, Amount, DatePickerField, TextField } from '../../../../bizKITUi';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { clinicService, employeesService, ENTITY } from '../../../../services';
import { useDebouncedFilterForm } from '../../../../hooks';
import { modalPromise } from '../../../../common/ModalPromise';
import { ModalEmployeeSalaryHistory } from '../ModalEmployeeSalaryHistory';
import { FieldCounterpartyAutocomplete } from '../../../../common/FieldCounterpartyAutocomplete';

const now = new Date();
const defaultValues = {
	counterparty_type: '',
	counterparty: null,
	period_start: new Date(now.setMonth(now.getMonth() - 1)),
	period_end: new Date(),
	limit: 10,
	offset: 0
};

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
	},
	resetBtn: {
		display: 'flex',
		marginLeft: 'auto',
		[theme.breakpoints.down(1000)]: {
			margin: '0'
		}
	}
}));

const counterpartyTypeList = clinicService.getClinicCounterpartyTypeList();

export function ListSalaryHistory() {
	const classes = useStyles();

	const { form, debouncedForm, resetForm, setInForm, getPage, setPage } = useDebouncedFilterForm(defaultValues);

	const { isLoading, isError, data } = useQuery([ENTITY.EMPLOYEES_SALARY_HISTORY, debouncedForm], ({ queryKey }) =>
		employeesService.getSalaryHistoryList(queryKey[1])
	);

	const handleOnChangeCounterpartyType = counterparty => {
		setInForm('counterparty_type', counterparty);
		setInForm('counterparty', null);
	};

	const columns = [
		{
			name: 'counterparty',
			label: 'Контрагент',
			options: {
				customBodyRenderLite: dataIndex => {
					const { counterparty } = data.results[dataIndex];
					return <span className="whitespace-no-wrap">{counterparty.name}</span>;
				}
			}
		},
		{
			name: 'counterparty_type',
			label: 'Тип контрагента',
			options: {
				customBodyRenderLite: dataIndex => {
					const { counterparty } = data.results[dataIndex];
					return (
						<span className="whitespace-no-wrap">
							{clinicService.getClinicCounterpartyByType(counterparty.type).name}
						</span>
					);
				}
			}
		},
		{
			name: 'period',
			label: 'Период',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];
					const fmtStartDate = moment(currentItem.data.period_start).format('DD.MM.YYYY');
					const fmtEndDate = moment(currentItem.data.period_end).format('DD.MM.YYYY');
					return `${fmtStartDate} — ${fmtEndDate}`;
				}
			}
		},
		{
			name: 'salary',
			label: 'Оклад',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];
					return <Amount value={currentItem.data.salary} />;
				}
			}
		},
		{
			name: 'income',
			label: 'Сумма доходов',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];
					return <Amount value={currentItem.data.income} />;
				}
			}
		},
		{
			name: 'payout_total',
			label: 'Всего выплачено',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];
					return <Amount value={currentItem.data.payout_total} />;
				}
			}
		},
		{
			name: 'payout_date',
			label: 'Дата выплаты',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];
					return moment(currentItem.data.payout_date).format('DD.MM.YYYY');
				}
			}
		},
		{
			name: 'actions',
			label: 'Действия',
			options: {
				customBodyRenderLite: () => {
					return (
						<Button textNormal variant="text">
							Подробнее
						</Button>
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
			modalPromise.open(({ onClose }) => (
				<ModalEmployeeSalaryHistory
					isOpen
					onClose={onClose}
					paymentUuid={data.results[rowMeta.dataIndex].uuid}
				/>
			));
		},
		onChangePage: page => setPage(page),
		onChangeRowsPerPage: limit => setInForm('limit', limit)
	};

	return (
		<>
			<Paper component="form" className={`p-16 my-32 gap-10 ${classes.form}`}>
				<TextField
					label="Тип контрагента"
					select
					variant="outlined"
					size="small"
					value={form.counterparty_type}
					onChange={event => handleOnChangeCounterpartyType(event.target.value)}
				>
					<MenuItem value="">Все</MenuItem>
					{counterpartyTypeList.map(item => (
						<MenuItem key={item.type} value={item.type}>
							{item.name}
						</MenuItem>
					))}
				</TextField>

				{!!form.counterparty_type && (
					<FieldCounterpartyAutocomplete
						type={form.counterparty_type}
						value={form.counterparty}
						onChange={value => setInForm('counterparty', value?.uuid ?? null)}
						label="Контрагент"
						InputProps={{
							size: 'small'
						}}
					/>
				)}

				<DatePickerField
					label="Дата от"
					inputVariant="outlined"
					size="small"
					onlyValid
					value={form.period_start}
					onChange={date => setInForm('period_start', date)}
				/>
				<DatePickerField
					label="Дата до"
					inputVariant="outlined"
					size="small"
					onlyValid
					value={form.period_end}
					onChange={date => setInForm('period_end', date)}
				/>

				<div className={classes.resetBtn}>
					<Button textNormal variant="outlined" onClick={() => resetForm()} disabled={isLoading}>
						Сбросить
					</Button>
				</div>
			</Paper>

			{isLoading ? (
				<FuseLoading />
			) : isError ? (
				<ErrorMessage />
			) : (
				<DataTable data={data.results} columns={columns} options={tableOptions} />
			)}
		</>
	);
}
