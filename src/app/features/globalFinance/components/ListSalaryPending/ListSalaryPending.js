import React from 'react';
import { useQuery } from 'react-query';
import { makeStyles, Paper } from '@material-ui/core';
import { Button, DataTable, Amount, DatePickerField, MenuItem, TextField } from '../../../../bizKITUi';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { clinicService, employeesService, ENTITY } from '../../../../services';
import { useDebouncedFilterForm } from '../../../../hooks';
import { modalPromise } from '../../../../common/ModalPromise';
import { ModalEmployeeSalaryPending } from '../ModalEmployeeSalaryPending';
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

export function ListSalaryPending() {
	const classes = useStyles();

	const { form, debouncedForm, resetForm, setInForm, getPage, setPage } = useDebouncedFilterForm(defaultValues);

	const { isIdle, isLoading, isError, data } = useQuery(
		[ENTITY.EMPLOYEES_SALARY_PENDING, debouncedForm],
		({ queryKey }) => employeesService.getSalaryPending(queryKey[1]),
		{ enabled: !!(form.counterparty_type && form.period_start && form.period_end) }
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
			name: 'receptions_count',
			label: 'Кол-во приемов',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];
					return currentItem.data.receptions_count;
				}
			}
		},
		{
			name: 'receptions_summ',
			label: 'Сумма приемов',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];
					return <Amount value={currentItem.data.receptions_summ} />;
				}
			}
		},
		{
			name: 'expense',
			label: 'Сумма расходов',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];
					return <Amount value={currentItem.data.expense} />;
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
			label: 'Итого к выплате',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];
					return <Amount value={currentItem.data.payout_total} />;
				}
			}
		},
		{
			name: 'actions',
			label: 'Действия',
			options: {
				customBodyRenderLite: () => {
					return (
						<Button className="whitespace-no-wrap" textNormal variant="text">
							Выплатить ЗП
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
			const { counterparty } = data.results[rowMeta.dataIndex];

			modalPromise.open(({ onClose }) => (
				<ModalEmployeeSalaryPending
					isOpen
					onClose={onClose}
					counterpartyUuid={counterparty.uuid}
					counterpartyType={counterparty.type}
					initialValues={{ period_start: form.period_start, period_end: form.period_end }}
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
					fullWidth
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
						fullWidth
						InputProps={{
							size: 'small'
						}}
					/>
				)}

				<DatePickerField
					label="Дата от"
					inputVariant="outlined"
					size="small"
					fullWidth
					onlyValid
					value={form.period_start}
					onChange={date => setInForm('period_start', date)}
				/>
				<DatePickerField
					label="Дата до"
					inputVariant="outlined"
					size="small"
					fullWidth
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

			{isIdle ? (
				<div className="text-center">Необходимо указать настройки фильтрации</div>
			) : isLoading ? (
				<FuseLoading />
			) : isError ? (
				<ErrorMessage />
			) : (
				<DataTable data={data.results} columns={columns} options={tableOptions} />
			)}
		</>
	);
}
