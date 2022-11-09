import React, { useContext, useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import moment from 'moment';
import { Box, Paper, useTheme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
	AddCircle as AddCircleIcon,
	RemoveCircle as RemoveCircleIcon,
	ArrowForward as ArrowForwardIcon,
	Refresh as RefreshIcon
} from '@material-ui/icons';
import {
	Button,
	DatePickerField,
	TextField,
	DataTable,
	TimePickerField,
	MenuItem,
	ServerAutocomplete
} from '../../../../bizKITUi';
import { useDebouncedFilterForm } from '../../../../hooks';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { numberFormat, getShortName } from '../../../../utils';
import {
	FINANCE_STATE_TYPE_COMING,
	FINANCE_STATE_TYPE_SPENDING,
	FINANCE_STATE_TYPE_MOVING
} from '../../../../services/finance/constants';
import { MONEY_ACCOUNT_TYPE_CASH, MONEY_ACCOUNT_TYPE_NON_CASH } from '../../../../services/companies/constants';
import { ENTITY, financeService } from '../../../../services';
import { PaymentStatistics } from '../PaymentStatistics';
import { ModalFinanceTransfer } from '../../../../common/ModalFinanceTransfer';
import { ModalFinanceIncome } from '../../../../common/ModalFinanceIncome';
import { ModalFinanceExpense } from '../../../../common/ModalFinanceExpense';
import { ContextMenu } from '../../pages/Finance';
import { FieldCounterpartyAutocomplete } from '../../../../common/FieldCounterpartyAutocomplete';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: '170px 140px 140px 1fr 1fr 1fr',
		[theme.breakpoints.down(1379)]: {
			gridTemplateColumns: '170px 140px 140px 1fr 1fr'
		},
		[theme.breakpoints.down(867)]: {
			gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
		}
	},
	button: {
		marginLeft: 'auto',
		width: 64,
		[theme.breakpoints.down(1379)]: {
			margin: '0'
		}
	},
	formContainer: {
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(2),
		padding: theme.spacing(2)
	},
	infoText: {
		marginTop: 4,
		fontSize: 13
	}
}));

const counterpartyTypeList = financeService.getCounterpartyTypeList();

export function ListPayments() {
	const classes = useStyles();
	const theme = useTheme();

	const { form, debouncedForm, setInForm, getPage, setPage, resetForm } = useDebouncedFilterForm({
		date: new Date(),
		state: null,
		counterparty: null,
		time_from: null,
		time_to: null,
		limit: 10,
		offset: 0
	});

	const [selectedCounterparty, setSelectedCounterparty] = useState('');

	const { isLoading, isError, data } = useQuery([ENTITY.FINANCE_ACTION, debouncedForm], ({ queryKey }) =>
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
					onClick={() => setIsShowModalFinanceIncome(true)}
				>
					Приход
				</Button>
				<Button
					textNormal
					className="whitespace-no-wrap ml-10"
					variant="outlined"
					customColor="secondary"
					startIcon={<RemoveCircleIcon />}
					onClick={() => setIsShowModalFinanceExpense(true)}
				>
					Расход
				</Button>
				<Button
					textNormal
					className="whitespace-no-wrap ml-10"
					variant="outlined"
					customColor="accent"
					startIcon={<ArrowForwardIcon />}
					onClick={() => setIsShowModalFinanceTransfer(true)}
				>
					Перемещение
				</Button>
			</div>
		);

		return () => setMenu(null);
	}, [setMenu]);

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
							title = item.counterparty.last_name
								? getShortName(item.counterparty)
								: item.counterparty.name;
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
			name: 'doctor',
			label: 'Врач',
			options: {
				customBodyRenderLite: dataIndex => {
					return getShortName(data.results[dataIndex].service?.doctor ?? {}) || '—';
				}
			}
		},
		{
			name: 'description',
			label: 'Описание',
			options: {
				customBodyRenderLite: dataIndex => {
					return data.results[dataIndex].description || '—';
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
					return (
						{
							[MONEY_ACCOUNT_TYPE_CASH]: 'Наличные',
							[MONEY_ACCOUNT_TYPE_NON_CASH]: 'Картой'
						}[data.results[dataIndex].money_account?.type] ?? '—'
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
		onRowClick: (_, rowMeta) => setSelectedFinanceAction(data.results[rowMeta.dataIndex]),
		onChangePage: page => setPage(page),
		onChangeRowsPerPage: limit => setInForm('limit', limit)
	};

	return (
		<>
			<Paper className={classes.formContainer}>
				<Box component="form" className={`gap-10 ${classes.form}`}>
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
						onlyValid
						value={form.time_from}
						onChange={date => setInForm('time_from', date)}
					/>

					<TimePickerField
						label="Время до"
						inputVariant="outlined"
						size="small"
						onlyValid
						value={form.time_to}
						onChange={date => setInForm('time_to', date)}
					/>

					<TextField
						size="small"
						fullWidth
						variant="outlined"
						select
						label="Тип контрагента"
						value={selectedCounterparty}
						onChange={event => setSelectedCounterparty(event.target.value)}
					>
						<MenuItem value="">Все</MenuItem>
						{counterpartyTypeList.map(item => (
							<MenuItem key={item.type} value={item.type}>
								{item.name}
							</MenuItem>
						))}
					</TextField>

					{selectedCounterparty && (
						<FieldCounterpartyAutocomplete
							type={selectedCounterparty}
							value={form.counterparty}
							onChange={value => setInForm('counterparty', value?.uuid ?? null)}
							label="Контрагент"
							InputProps={{ size: 'small' }}
						/>
					)}

					<ServerAutocomplete
						value={form.state}
						label="Статья"
						name="state"
						InputProps={{
							size: 'small'
						}}
						fullWidth
						getOptionLabel={option => option.name}
						onFetchList={name =>
							financeService.getFinanceStates({ name, limit: 10 }).then(res => res.data.results)
						}
						onFetchItem={uuid => financeService.getFinanceStateByUuid(uuid).then(res => res.data)}
						onChange={value => setInForm('state', value?.uuid ?? null)}
					/>

					<Button
						aria-label="Сбросить"
						type="reset"
						className={classes.button}
						disabled={isLoading}
						onClick={() => resetForm()}
					>
						<RefreshIcon />
					</Button>
				</Box>
			</Paper>

			<div className="my-16">
				<PaymentStatistics filter={debouncedForm} />
			</div>

			{isLoading ? (
				<FuseLoading />
			) : isError ? (
				<ErrorMessage />
			) : (
				<DataTable columns={columns} options={tableOptions} data={data.results} />
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
				/>
			)}
			{isShowModalFinanceExpense && (
				<ModalFinanceExpense
					isOpen
					financeActionUuid={selectedFinanceAction?.uuid}
					onClose={handleOnCloseModals}
				/>
			)}
		</>
	);
}
