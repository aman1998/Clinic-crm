import React, { useContext, useEffect, useState } from 'react';
import { useQueries } from 'react-query';
import moment from 'moment';
import { Grid, Paper, Typography, useTheme, makeStyles } from '@material-ui/core';
import {
	AddCircle as AddCircleIcon,
	ArrowForward as ArrowForwardIcon,
	RemoveCircle as RemoveCircleIcon
} from '@material-ui/icons';
import { globalFinanceService, ENTITY, companiesService } from '../../../../services';
import { useDebouncedFilterForm } from '../../../../hooks';
import { getFullName } from '../../../../utils';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { Amount, Button, DataTable, DatePickerField, MenuItem, TextField } from '../../../../bizKITUi';
import { ContextMenu } from '../../pages/GlobalFinance';
import { ModalGlobalFinance } from '../../../../common/ModalGlobalFinance';
import {
	GROUP_TYPE_COMING,
	GROUP_TYPE_SPENDING,
	GROUP_TYPE_MOVING,
	STATUS_DONE,
	STATUS_ACCEPTED,
	COUNTERPARTY_TYPE_MONEY_ACCOUNT
} from '../../../../services/globalFinance/constants';
import { TYPE_CATEGORY_GLOBAL_FINANCE } from '../../../../services/companies/constants';
import { BlockInfo } from '../../../../common/BlockInfo';
import { FieldCounterpartyAutocomplete } from '../../../../common/FieldCounterpartyAutocomplete';

const now = new Date();
const defaultValues = {
	type: '',
	fact: '',
	start_date_time: new Date(now.setMonth(now.getMonth() - 1)),
	end_date_time: new Date(),
	money_account: '',
	counterparty: null,
	state: '',
	limit: 10,
	offset: 0
};

const useStyles = makeStyles(() => ({
	form: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
	}
}));

export function ListFinanceOperations() {
	const theme = useTheme();
	const classes = useStyles();

	const { form, debouncedForm, setForm, handleChange, setInForm, getPage, setPage } = useDebouncedFilterForm(
		defaultValues
	);

	const [
		{ isLoading: isLoadingFinanceAction, isError: isErrorFinanceAction, data: financeActions },
		{ isLoading: isLoadingGroups, isError: isErrorGroups, data: groups },
		{ isLoading: isLoadingMoneyAccounts, isError: isErrorMoneyAccounts, data: moneyAccounts }
	] = useQueries([
		{
			queryKey: [ENTITY.GLOBAL_FINANCE_ACTION, debouncedForm],
			queryFn: ({ queryKey }) => globalFinanceService.getActions(queryKey[1])
		},
		{
			queryKey: [ENTITY.GLOBAL_FINANCE_GROUP, { limit: Number.MAX_SAFE_INTEGER }],
			queryFn: ({ queryKey }) => globalFinanceService.getGroups(queryKey[1])
		},
		{
			queryKey: [
				ENTITY.MONEY_ACCOUNT,
				{ limit: Number.MAX_SAFE_INTEGER, category: TYPE_CATEGORY_GLOBAL_FINANCE }
			],
			queryFn: ({ queryKey }) => companiesService.getMoneyAccounts(queryKey[1]).then(({ data }) => data)
		}
	]);

	const [propsModalFinance, setPropsModalFinance] = useState({});
	const [isShowModalFinance, setIsShowModalFinance] = useState(false);
	const handleOnCloseFinanceModal = () => {
		setPropsModalFinance(null);
		setIsShowModalFinance(false);
	};

	const setMenu = useContext(ContextMenu);
	useEffect(() => {
		setMenu(
			<div className="flex">
				<Button
					textNormal
					className="whitespace-no-wrap ml-10"
					variant="outlined"
					customColor="primary"
					startIcon={<AddCircleIcon />}
					onClick={() => {
						setPropsModalFinance({ type: GROUP_TYPE_COMING });
						setIsShowModalFinance(true);
					}}
				>
					Приход
				</Button>
				<Button
					textNormal
					className="whitespace-no-wrap ml-10"
					variant="outlined"
					customColor="secondary"
					startIcon={<RemoveCircleIcon />}
					onClick={() => {
						setPropsModalFinance({ type: GROUP_TYPE_SPENDING });
						setIsShowModalFinance(true);
					}}
				>
					Расход
				</Button>
				<Button
					textNormal
					className="whitespace-no-wrap ml-10"
					variant="outlined"
					customColor="accent"
					startIcon={<ArrowForwardIcon />}
					onClick={() => {
						setPropsModalFinance({ type: GROUP_TYPE_MOVING });
						setIsShowModalFinance(true);
					}}
				>
					Перемещение
				</Button>
			</div>
		);

		return () => setMenu(null);
	}, [setMenu]);

	const groupsByType = groups?.results.filter(
		item =>
			(form.type === defaultValues.state ? true : item.type === form.type) &&
			item.global_finance_states.length > 0
	);

	const groupsTypeList = globalFinanceService.getGroupsTypeList();

	const counterpartyTypeList = globalFinanceService
		.getCounterpartyTypeList()
		.filter(item => item.type !== COUNTERPARTY_TYPE_MONEY_ACCOUNT);
	const [selectedCounterparty, setSelectedCounterparty] = useState('');
	const selectedGroup = groups?.results.find(
		group => group.global_finance_states.findIndex(state => state.uuid === form.state) > -1
	);
	const isMovingSelectedGroup = selectedGroup?.type === GROUP_TYPE_MOVING || form.type === GROUP_TYPE_MOVING;

	const handleOnChangeType = event => {
		handleChange(event);
		setInForm('state', defaultValues.state);
		setSelectedCounterparty('');
	};
	const handleOnChangeState = event => {
		handleChange(event);
		setSelectedCounterparty('');
		setInForm('counterparty', defaultValues.counterparty);
	};
	const handleOnChangeCounterparty = event => {
		setInForm('counterparty', defaultValues.counterparty);
		setSelectedCounterparty(event.target.value);
	};

	const columns = [
		{
			name: 'type',
			label: 'Тип',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = financeActions.results[dataIndex];

					return {
						[GROUP_TYPE_COMING]: <AddCircleIcon style={{ color: theme.palette.success.main }} />,
						[GROUP_TYPE_SPENDING]: <RemoveCircleIcon style={{ color: theme.palette.error.main }} />,
						[GROUP_TYPE_MOVING]: <ArrowForwardIcon style={{ color: theme.palette.warning.main }} />
					}[currentItem.type];
				}
			}
		},
		{
			name: 'amountPlan',
			label: 'Сумма план',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = financeActions.results[dataIndex];

					return <Amount value={Number(currentItem.plan_value_kzt)} />;
				}
			}
		},
		{
			name: 'amountFact',
			label: 'Сумма факт',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = financeActions.results[dataIndex];

					return currentItem.fact_value_kzt ? <Amount value={Number(currentItem.fact_value_kzt)} /> : '—';
				}
			}
		},
		{
			name: 'fact',
			label: 'План/Факт',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = financeActions.results[dataIndex];

					if ([STATUS_ACCEPTED, STATUS_DONE].includes(currentItem.status)) {
						return <span>Факт</span>;
					}

					return <span>План</span>;
				}
			}
		},
		{
			name: 'state',
			label: 'Статья',
			options: {
				customBodyRenderLite: dataIndex => {
					return financeActions.results[dataIndex]?.global_finance_state?.name;
				}
			}
		},
		{
			name: 'counterparty',
			label: 'Контрагент',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = financeActions.results[dataIndex];
					return currentItem.counterparty?.name ?? (getFullName(currentItem.counterparty ?? {}) || '—');
				}
			}
		},
		{
			name: 'planPaymentDate',
			label: 'Дата операции',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = financeActions.results[dataIndex];
					let date;

					if (currentItem.status === STATUS_DONE) {
						date = currentItem.fact_payment_date;
					} else {
						date = currentItem.plan_payment_date;
					}

					return (
						<>
							<div>{moment(date).format('DD.MM.YYYY')}</div>
							<div>{moment(date).format('HH:mm')}</div>
						</>
					);
				}
			}
		}
	];
	const tableOptions = {
		serverSide: true,
		rowsPerPage: form.limit,
		page: getPage(),
		count: financeActions?.count ?? 0,
		onRowClick: (_, rowMeta) => {
			setIsShowModalFinance(true);
			setPropsModalFinance({ globalFinanceUuid: financeActions.results[rowMeta.dataIndex].uuid });
		},
		onChangePage: page => setPage(page),
		onChangeRowsPerPage: limit => setInForm('limit', limit)
	};

	const isLoading = isLoadingGroups || isLoadingMoneyAccounts;
	const isError = isErrorGroups || isErrorMoneyAccounts;

	if (isLoading) {
		return <FuseLoading />;
	}
	if (isError) {
		return <ErrorMessage />;
	}
	return (
		<>
			<div className="flex justify-between items-center mb-32">
				<Typography color="secondary" className="text-xl font-bold text-center">
					Финансовые операции
				</Typography>
			</div>

			<Grid container spacing={2}>
				{moneyAccounts.results.map(item => (
					<Grid item key={item.uuid} md={3} sm={6} xs={12}>
						<BlockInfo title={item.name}>
							<Amount value={item.balance} />
						</BlockInfo>
					</Grid>
				))}
			</Grid>

			<Paper className="p-20 my-32">
				<div className={`gap-10 ${classes.form}`}>
					<TextField
						label="Тип"
						value={form.type}
						name="type"
						select
						size="small"
						variant="outlined"
						onChange={handleOnChangeType}
					>
						<MenuItem value="">Все</MenuItem>
						{groupsTypeList.map(item => (
							<MenuItem value={item.type} key={item.type}>
								{item.name}
							</MenuItem>
						))}
					</TextField>

					<TextField
						select
						label="Статья"
						variant="outlined"
						size="small"
						name="state"
						value={form.state}
						onChange={handleOnChangeState}
					>
						<MenuItem value="">Все</MenuItem>
						{groupsByType.map(group => [
							<MenuItem key={group.uuid} value={group.uuid} disabled>
								{group.name}
							</MenuItem>,
							group.global_finance_states.map(state => (
								<MenuItem key={state.uuid} isGrouped value={state.uuid}>
									{state.name}
								</MenuItem>
							))
						])}
					</TextField>
					<TextField
						select
						label="План/Факт"
						variant="outlined"
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
						label="Счёт"
						variant="outlined"
						size="small"
						name="money_account"
						value={form.money_account}
						onChange={handleChange}
					>
						<MenuItem value="">Все</MenuItem>
						{moneyAccounts.results.map(item => (
							<MenuItem value={item.uuid} key={item.uuid}>
								{item.name}
							</MenuItem>
						))}
					</TextField>
					<TextField
						size="small"
						variant="outlined"
						select
						label="Тип контрагента"
						value={selectedCounterparty}
						InputProps={{
							readOnly: isMovingSelectedGroup
						}}
						onChange={handleOnChangeCounterparty}
					>
						<MenuItem value="">Все</MenuItem>
						{counterpartyTypeList.map(item => (
							<MenuItem key={item.type} value={item.type}>
								{item.name}
							</MenuItem>
						))}
					</TextField>

					{selectedCounterparty ? (
						<FieldCounterpartyAutocomplete
							type={selectedCounterparty}
							label="Контрагент"
							value={form.counterparty}
							onChange={(_, value) => setInForm('counterparty', value?.uuid ?? null)}
							InputProps={{ size: 'small' }}
						/>
					) : (
						<TextField label="Контрагент" size="small" variant="outlined" InputProps={{ readOnly: true }} />
					)}

					<DatePickerField
						label="Дата начала"
						size="small"
						name="start_date_time"
						value={form.start_date_time}
						onlyValid
						onChange={date => setInForm('start_date_time', date)}
					/>
					<DatePickerField
						label="Дата окончания"
						size="small"
						name="end_date_time"
						value={form.end_date_time}
						onlyValid
						onChange={date => setInForm('end_date_time', date)}
					/>
					<Button
						textNormal
						variant="outlined"
						onClick={() => setForm(defaultValues)}
						disabled={isLoadingFinanceAction}
					>
						Сбросить
					</Button>
				</div>
			</Paper>

			{isLoadingFinanceAction ? (
				<FuseLoading />
			) : isErrorFinanceAction ? (
				<ErrorMessage />
			) : (
				<DataTable data={financeActions.results} columns={columns} options={tableOptions} />
			)}

			{isShowModalFinance && (
				<ModalGlobalFinance {...propsModalFinance} isOpen onClose={handleOnCloseFinanceModal} />
			)}
		</>
	);
}
