import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import moment from 'moment';
import { useTheme, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
	AddCircle as AddCircleIcon,
	ArrowForward as ArrowForwardIcon,
	RemoveCircle as RemoveCircleIcon
} from '@material-ui/icons';
import { DataTable, Button, DatePickerField, TimePickerField, ServerAutocomplete } from '../../../../bizKITUi';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { useDebouncedFilterForm } from '../../../../hooks';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { ModalFinanceIncome } from '../../../../common/ModalFinanceIncome';
import { ENTITY, financeService } from '../../../../services';
import { getShortName, numberFormat } from '../../../../utils';
import { MONEY_ACCOUNT_TYPE_CASH, MONEY_ACCOUNT_TYPE_NON_CASH } from '../../../../services/companies/constants';
import {
	FINANCE_STATE_TYPE_COMING,
	FINANCE_STATE_TYPE_MOVING,
	FINANCE_STATE_TYPE_SPENDING
} from '../../../../services/finance/constants';
import { ModalFinanceTransfer } from '../../../../common/ModalFinanceTransfer';
import { ModalFinanceExpense } from '../../../../common/ModalFinanceExpense';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
	},
	btnReset: {
		display: 'flex',
		justifyContent: 'flex-end',
		marginLeft: 'auto',
		[theme.breakpoints.down(1128)]: {
			margin: '0',
			justifyContent: 'flex-start'
		}
	}
}));

export function ListPatientFinance({ patientsUuid }) {
	const theme = useTheme();
	const classes = useStyles();

	const { form, debouncedForm, setInForm, getPage, setPage, resetForm } = useDebouncedFilterForm({
		counterparty: patientsUuid,
		date: null,
		state: null,
		time_from: null,
		time_to: null,
		limit: 10,
		offset: 0
	});

	const { isLoading, isError, data, refetch } = useQuery([ENTITY.FINANCE_ACTION, debouncedForm], ({ queryKey }) =>
		financeService.getFinanceActions(queryKey[1]).then(res => res.data)
	);

	const [selectedFinanceAction, setSelectedFinanceAction] = useState(null);
	const [isShowModalFinanceTransfer, setIsShowModalFinanceTransfer] = useState(false);
	const [isShowModalFinanceIncome, setIsShowModalFinanceIncome] = useState(false);
	const [isShowModalFinanceExpense, setIsShowModalFinanceExpense] = useState(false);
	useEffect(() => {
		if (!selectedFinanceAction) {
			return;
		}

		if (selectedFinanceAction.type === FINANCE_STATE_TYPE_COMING) {
			setIsShowModalFinanceIncome(true);
		}

		if (selectedFinanceAction.type === FINANCE_STATE_TYPE_MOVING) {
			setIsShowModalFinanceTransfer(true);
		}

		if (selectedFinanceAction.type === FINANCE_STATE_TYPE_SPENDING) {
			setIsShowModalFinanceExpense(true);
		}
	}, [selectedFinanceAction]);
	const handleOnCloseModals = () => {
		setSelectedFinanceAction(null);
		setIsShowModalFinanceTransfer(false);
		setIsShowModalFinanceIncome(false);
		setIsShowModalFinanceExpense(false);
	};

	const columns = [
		{
			name: 'type',
			label: 'Тип',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];

					return {
						[FINANCE_STATE_TYPE_COMING]: <AddCircleIcon style={{ color: theme.palette.success.main }} />,
						[FINANCE_STATE_TYPE_SPENDING]: <RemoveCircleIcon style={{ color: theme.palette.error.main }} />,
						[FINANCE_STATE_TYPE_MOVING]: <ArrowForwardIcon style={{ color: theme.palette.warning.main }} />
					}[currentItem.type];
				}
			}
		},
		{
			name: 'date',
			label: 'Дата',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];
					const momentDate = moment(currentItem.paid_date_time);

					return (
						<>
							<div>{momentDate.format('DD.MM.YYYY')}</div>
							<div>{momentDate.format('HH:mm')}</div>
						</>
					);
				}
			}
		},
		{
			name: 'state',
			label: 'Статья',
			options: {
				customBodyRenderLite: dataIndex => {
					const { state } = data.results[dataIndex];

					return state.name;
				}
			}
		},
		{
			name: 'sender',
			label: 'Отправитель',
			options: {
				customBodyRenderLite: dataIndex => {
					const item = data.results[dataIndex];
					let title = '';
					let infoText = '';

					switch (item.type) {
						case FINANCE_STATE_TYPE_MOVING:
							title = item.sender_money_account.name;
							infoText = 'Счёт';
							break;
						case FINANCE_STATE_TYPE_COMING:
							title = item.counterparty.name ?? getShortName(item.counterparty);
							infoText = financeService.getCounterpartyTypeNameByType(item.state.counterparty_type);
							break;
						case FINANCE_STATE_TYPE_SPENDING:
							title = getShortName(item.cashier);
							infoText = 'Кассир';
							break;
						default:
					}

					return (
						<div>
							{title}
							<div className={classes.infoText}>{infoText}</div>
						</div>
					);
				}
			}
		},
		{
			name: 'recipient',
			label: 'Получатель',
			options: {
				customBodyRenderLite: dataIndex => {
					const item = data.results[dataIndex];
					let title = '';
					let infoText = '';

					switch (item.type) {
						case FINANCE_STATE_TYPE_MOVING:
							title = item.recipient_money_account.name;
							infoText = 'Счёт';
							break;
						case FINANCE_STATE_TYPE_COMING:
							title = getShortName(item.cashier);
							infoText = 'Кассир';
							break;
						case FINANCE_STATE_TYPE_SPENDING:
							title = item.counterparty.name ?? getShortName(item.counterparty);
							infoText = financeService.getCounterpartyTypeNameByType(item.state.counterparty_type);
							break;
						default:
					}

					return (
						<div>
							{title}
							<div className={classes.infoText}>{infoText}</div>
						</div>
					);
				}
			}
		},
		{
			name: 'description',
			label: 'Описание',
			options: {
				customBodyRenderLite: dataIndex => {
					return data.results[dataIndex].description;
				}
			}
		},
		{
			name: 'amount',
			label: 'Сумма ₸',
			options: {
				customBodyRenderLite: dataIndex => {
					return numberFormat.currency(data.results[dataIndex].value);
				}
			}
		},
		{
			name: 'moneyAccount',
			label: 'Счёт',
			options: {
				customBodyRenderLite: dataIndex => {
					return {
						[MONEY_ACCOUNT_TYPE_CASH]: 'Наличные',
						[MONEY_ACCOUNT_TYPE_NON_CASH]: 'Картой'
					}[data.results[dataIndex].money_account.type];
				}
			}
		}
	];
	const tableOptions = {
		serverSide: true,
		rowsPerPage: form.limit,
		page: getPage(),
		count: data?.count ?? 0,
		onRowClick: (_, rowMeta) => setSelectedFinanceAction(data.results[rowMeta.dataIndex]),
		onChangePage: page => setPage(page),
		onChangeRowsPerPage: limit => setInForm('limit', limit)
	};

	return (
		<>
			<Paper className="p-12 mb-32">
				<form className={`gap-10 ${classes.form}`}>
					<DatePickerField
						label="Дата платежа"
						inputVariant="outlined"
						size="small"
						onlyValid
						value={form.date}
						onChange={date => setInForm('date', date)}
					/>

					<TimePickerField
						label="Время от"
						inputVariant="outlined"
						size="small"
						fullWidth
						onlyValid
						value={form.time_from}
						onChange={date => setInForm('time_from', date)}
					/>

					<TimePickerField
						label="Время до"
						inputVariant="outlined"
						size="small"
						fullWidth
						onlyValid
						value={form.time_to}
						onChange={date => setInForm('time_to', date)}
					/>

					<ServerAutocomplete
						getOptionLabel={option => option.name}
						label="Статья"
						fullWidth
						InputProps={{ size: 'small' }}
						onFetchList={(name, limit) =>
							financeService.getFinanceStates({ name, limit }).then(res => res.data)
						}
						onFetchItem={uuid => financeService.getFinanceStateByUuid(uuid).then(res => res.data)}
						value={form.state}
						onChange={value => setInForm('state', value?.uuid ?? null)}
					/>

					<div className={classes.btnReset}>
						<Button textNormal color="primary" variant="outlined" onClick={() => resetForm()}>
							Сбросить
						</Button>
					</div>
				</form>
			</Paper>

			{isLoading ? (
				<FuseLoading />
			) : isError ? (
				<ErrorMessage />
			) : (
				<DataTable data={data.results} columns={columns} options={tableOptions} />
			)}

			{isShowModalFinanceIncome && (
				<ModalFinanceIncome
					isOpen
					financeActionUuid={selectedFinanceAction?.uuid}
					onClose={handleOnCloseModals}
				/>
			)}
			{isShowModalFinanceTransfer && (
				<ModalFinanceTransfer
					isOpen
					financeActionUuid={selectedFinanceAction?.uuid}
					onClose={handleOnCloseModals}
					onUpdate={() => refetch()}
				/>
			)}
			{isShowModalFinanceExpense && (
				<ModalFinanceExpense
					isOpen
					financeActionUuid={selectedFinanceAction?.uuid}
					onClose={handleOnCloseModals}
					onUpdate={() => refetch()}
				/>
			)}
		</>
	);
}
ListPatientFinance.propTypes = {
	patientsUuid: PropTypes.string.isRequired
};
