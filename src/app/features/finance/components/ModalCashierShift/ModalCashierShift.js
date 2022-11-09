import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useQueries, useMutation, useQueryClient, useQuery } from 'react-query';
import moment from 'moment';
import { MenuItem, Typography, makeStyles, useTheme, Grid } from '@material-ui/core';
import { TextField, DatePickerField, DialogTemplate, DataTable, Button } from '../../../../bizKITUi';
import { CardComment, Comments } from '../../../../common/Comments';
import { useAlert } from '../../../../hooks';
import { financeService, companiesService, ENTITY, ENTITY_DEPS } from '../../../../services';
import { getFullName, numberFormat } from '../../../../utils';
import { BlockInfo } from '../../../../common/BlockInfo';
import * as globalAuthSelectors from '../../../../auth/store/selectors/auth';
import {
	CASHIER_SHIFT_FINANCE_ACTION_TYPE_INCOMING,
	CASHIER_SHIFT_FINANCE_ACTION_TYPE_OUTGOING,
	CASHIER_SHIFT_FINANCE_ACTION_TYPE_MOVING,
	CASHIER_SHIFT_STATUS_CONTROL,
	CASHIER_SHIFT_STATUS_OPEN,
	CASHIER_SHIFT_STATUS_REWORK
} from '../../../../services/finance/constants';
import { TYPE_CATEGORY_CASH } from '../../../../services/companies/constants';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { ModalConfirmCloseCashierShift } from './ModalConfirmCloseCashierShift';
import { ModalConfirmReworkCashierShift } from './ModalConfirmReworkCashierShift';

const useStyles = makeStyles({
	header: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		flex: 1
	},
	headerItem: {
		minWidth: 170
	}
});

const columns = [
	{
		name: 'paid_date_time',
		label: 'Время',
		options: {
			customBodyRender: value => {
				return moment(value).format('HH:mm');
			}
		}
	},
	{
		name: 'counterparty',
		label: 'Контрагент',
		options: {
			customBodyRender: value => {
				return value ? getFullName(value) : '—';
			}
		}
	},
	{
		name: 'state',
		label: 'Статья',
		options: {
			customBodyRender: value => {
				return value.name;
			}
		}
	},
	{
		name: 'value',
		label: 'Сумма ₸',
		options: {
			customBodyRender: value => {
				return numberFormat.currency(value);
			}
		}
	},
	{
		name: 'money_account',
		label: 'Счёт',
		options: {
			customBodyRender: value => {
				return value?.name ?? '—';
			}
		}
	},
	{
		name: 'cashier',
		label: 'Кассир',
		options: {
			customBodyRender: value => {
				return value ? getFullName(value) : '—';
			}
		}
	}
];

const movingColumns = [
	{
		name: 'paid_date_time',
		label: 'Время',
		options: {
			customBodyRender: value => {
				return moment(value).format('HH:mm');
			}
		}
	},
	{
		name: 'sender_money_account',
		label: 'Отправитель',
		options: {
			customBodyRender: value => {
				return value?.name ?? '—';
			}
		}
	},
	{
		name: 'recipient_money_account',
		label: 'Получатель',
		options: {
			customBodyRender: value => {
				return value?.name ?? '—';
			}
		}
	},
	{
		name: 'state',
		label: 'Статья',
		options: {
			customBodyRender: value => {
				return value.name;
			}
		}
	},
	{
		name: 'value',
		label: 'Сумма ₸',
		options: {
			customBodyRender: value => {
				return numberFormat.currency(value);
			}
		}
	},
	{
		name: 'cashier',
		label: 'Кассир',
		options: {
			customBodyRender: value => {
				return value ? getFullName(value) : '—';
			}
		}
	}
];

export function ModalCashierShift({ isOpen, onClose, cashierShiftDate }) {
	const { palette } = useTheme();
	const classes = useStyles();
	const { alertError } = useAlert();
	const queryClient = useQueryClient();

	const [pageIncomingActions, setPageIncomingActions] = useState(0);
	const [limitIncomingActions, setLimitIncomingActions] = useState(10);

	const [pageOutgoingActions, setPageOutgoingActions] = useState(0);
	const [limitOutgoingActions, setLimitOutgoingActions] = useState(10);

	const [pageMovingActions, setPageMovingActions] = useState(0);
	const [limitMovingActions, setLimitMovingActions] = useState(10);

	const { isLoading: isLoadingIncomingActions, isError: isErrorIncomingActions, data: incomingActions } = useQuery({
		queryKey: [
			ENTITY.CASHIER_WORK_SHIFT_FINANCE_ACTIONS,
			cashierShiftDate,
			{
				type: CASHIER_SHIFT_FINANCE_ACTION_TYPE_INCOMING,
				offset: pageIncomingActions * limitIncomingActions,
				limit: limitIncomingActions
			}
		],
		queryFn: ({ queryKey }) => financeService.getCashierShiftFinanceActions(cashierShiftDate, queryKey[2]),
		keepPreviousData: true
	});
	const { isLoading: isLoadingOutgoingActions, isError: isErrorOutgoingActions, data: outgoingActions } = useQuery({
		queryKey: [
			ENTITY.CASHIER_WORK_SHIFT_FINANCE_ACTIONS,
			cashierShiftDate,
			{
				type: CASHIER_SHIFT_FINANCE_ACTION_TYPE_OUTGOING,
				offset: pageOutgoingActions * limitOutgoingActions,
				limit: limitOutgoingActions
			}
		],
		queryFn: ({ queryKey }) => financeService.getCashierShiftFinanceActions(cashierShiftDate, queryKey[2]),
		keepPreviousData: true
	});
	const { isLoading: isLoadingMovingActions, isError: isErrorMovingActions, data: movingActions } = useQuery({
		queryKey: [
			ENTITY.CASHIER_WORK_SHIFT_FINANCE_ACTIONS,
			cashierShiftDate,
			{
				type: CASHIER_SHIFT_FINANCE_ACTION_TYPE_MOVING,
				offset: pageMovingActions * limitMovingActions,
				limit: limitMovingActions
			}
		],
		queryFn: ({ queryKey }) => financeService.getCashierShiftFinanceActions(cashierShiftDate, queryKey[2])
	});
	const [
		{
			isLoading: isLoadingCashierShift,
			isFetching: isFetchingCashierShift,
			isError: isErrorCashierShift,
			data: cashierShift
		},
		{ isLoading: isLoadingMoneyAccounts, isError: isErrorMoneyAccounts, data: moneyAccounts },
		{ isLoading: isLoadingStatistics, isError: isErrorStatistics, data: statistics }
	] = useQueries([
		{
			queryKey: [ENTITY.CASHIER_WORK_SHIFT, cashierShiftDate],
			queryFn: () => financeService.getCashierShift(cashierShiftDate)
		},
		{
			queryKey: [ENTITY.MONEY_ACCOUNT, { category: TYPE_CATEGORY_CASH }],
			queryFn: () => companiesService.getMoneyAccounts({ category: TYPE_CATEGORY_CASH }).then(({ data }) => data)
		},
		{
			queryKey: [ENTITY.CASHIER_WORK_SHIFT_STATISTICS, cashierShiftDate],
			queryFn: () => financeService.getCashierShiftStatistics(cashierShiftDate)
		}
	]);

	const tableOptionsIncomingActions = useMemo(
		() => ({
			serverSide: true,
			rowsPerPage: limitIncomingActions,
			page: pageIncomingActions,
			count: incomingActions?.results?.count ?? 0,
			onChangePage: page => setPageIncomingActions(page),
			onChangeRowsPerPage: limit => setLimitIncomingActions(limit)
		}),
		[incomingActions, limitIncomingActions, pageIncomingActions]
	);

	const tableOptionsOutgoingActions = useMemo(
		() => ({
			serverSide: true,
			rowsPerPage: limitOutgoingActions,
			page: pageOutgoingActions,
			count: outgoingActions?.results?.count ?? 0,
			onChangePage: page => setPageOutgoingActions(page),
			onChangeRowsPerPage: limit => setLimitOutgoingActions(limit)
		}),
		[outgoingActions, limitOutgoingActions, pageOutgoingActions]
	);

	const tableOptionsMovingActions = useMemo(
		() => ({
			serverSide: true,
			rowsPerPage: limitMovingActions,
			page: pageMovingActions,
			count: movingActions?.results?.count ?? 0,
			onChangePage: page => setPageMovingActions(page),
			onChangeRowsPerPage: limit => setLimitMovingActions(limit)
		}),
		[movingActions, limitMovingActions, pageMovingActions]
	);

	const currentUser = useSelector(globalAuthSelectors.currentUser);
	const isCurrentUserResponsible = cashierShift?.responsible?.uuid === currentUser.data.uuid;
	const isCurrentUserCashier = cashierShift?.cashier?.uuid === currentUser.data.uuid;

	const [isShowModalCloseCashierShift, setIsShowModalCloseCashierShift] = useState(false);
	const [isShowModalReworkCashierShift, setIsShowModalReworkCashierShift] = useState(false);

	// Mutations

	const addComment = useMutation(text => financeService.addCashierShiftComment(cashierShiftDate, text));
	const handleAddComment = text => {
		addComment
			.mutateAsync({ text })
			.then(({ data }) => {
				queryClient.setQueryData([ENTITY.CASHIER_WORK_SHIFT, cashierShiftDate], {
					...cashierShift,
					comments: [...cashierShift.comments, { ...data, created_by: currentUser }]
				});
			})
			.catch(() => {
				alertError('Не удалось добавить комментарий');
			});
	};

	const controlCashierShift = useMutation(date => financeService.controlCashierShift(date));
	const handleControlCashierShift = () => {
		controlCashierShift
			.mutateAsync(cashierShiftDate)
			.then(() => {
				ENTITY_DEPS.CASHIER_WORK_SHIFT.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
			})
			.catch(() => {
				alertError('Не удалось отправить кассовую смену на контроль');
			});
	};

	const isSomeLoading = [
		isLoadingMoneyAccounts,
		isLoadingStatistics,
		isLoadingIncomingActions,
		isLoadingOutgoingActions,
		isLoadingMovingActions
	].includes(true);

	const isSomeError = [
		isErrorMoneyAccounts,
		isErrorStatistics,
		isErrorIncomingActions,
		isErrorOutgoingActions,
		isErrorMovingActions
	].includes(true);

	const canSendToControl = [CASHIER_SHIFT_STATUS_OPEN, CASHIER_SHIFT_STATUS_REWORK].includes(cashierShift?.status);
	const isCashierShiftOnControl = cashierShift?.status === CASHIER_SHIFT_STATUS_CONTROL;
	const moneyAccountBalances = cashierShift?.money_account_balances
		? cashierShift.money_account_balances
		: moment(cashierShiftDate).isSame(moment(), 'day')
		? moneyAccounts?.results
		: [];
	const totalMoneyAccountBalances = moneyAccountBalances?.reduce((acc, cur) => acc + cur.balance, 0);

	return (
		<DialogTemplate
			isOpen={isOpen}
			onClose={onClose}
			headerFull
			header={
				<div className="flex">
					<Typography color="secondary" className="flex items-center text-xl font-bold whitespace-no-wrap">
						Закрытие кассовой смены
					</Typography>

					{isLoadingCashierShift ? (
						<></>
					) : isErrorCashierShift ? (
						<ErrorMessage />
					) : (
						<div className={classes.header}>
							<DatePickerField
								label="Дата"
								value={cashierShift.date}
								className="mr-10"
								size="small"
								readOnly
								InputProps={{ readOnly: true }}
							/>
							<TextField
								label="Кассир"
								value={cashierShift.cashier.uuid}
								className="mr-10"
								variant="outlined"
								select
								readOnly
								InputProps={{ readOnly: true }}
								size="small"
							>
								<MenuItem value={cashierShift.cashier.uuid}>
									{getFullName(cashierShift.cashier)}
								</MenuItem>
							</TextField>
							<TextField
								label="Ответственный"
								value={cashierShift.responsible.uuid}
								variant="outlined"
								select
								readOnly
								InputProps={{ readOnly: true }}
								size="small"
							>
								<MenuItem value={cashierShift.responsible.uuid}>
									{getFullName(cashierShift.responsible)}
								</MenuItem>
							</TextField>
						</div>
					)}
				</div>
			}
			leftContent={
				isSomeLoading ? (
					<FuseLoading />
				) : isSomeError ? (
					<ErrorMessage />
				) : (
					<>
						<Typography className="mb-8" variant="h6" component="h2">
							Остатки на счетах
						</Typography>
						<Grid container spacing={2}>
							<Grid item md={3} xs={6}>
								<BlockInfo title="Итого" color={palette.success.main}>
									{numberFormat.currency(totalMoneyAccountBalances)} ₸
								</BlockInfo>
							</Grid>

							{moneyAccountBalances?.map(item => (
								<Grid key={item.uuid} item md={3} xs={6}>
									<BlockInfo title={item.name} color={palette.success.main}>
										{numberFormat.currency(item.balance)} ₸
									</BlockInfo>
								</Grid>
							))}
						</Grid>

						<Typography className="mt-20 mb-8" variant="h6" component="h2">
							Приходные операции
						</Typography>
						<Grid container spacing={2}>
							<Grid item md={3} xs={6}>
								<BlockInfo title="Итого" color={palette.text.primary}>
									{numberFormat.currency(statistics.incoming_data.total)} ₸
								</BlockInfo>
							</Grid>
							{statistics.incoming_data.money_accounts.map(item => (
								<Grid key={item.money_account} item md={3} xs={6}>
									<BlockInfo title={item.money_account} color={palette.text.primary}>
										{numberFormat.currency(item.sum)} ₸
									</BlockInfo>
								</Grid>
							))}
						</Grid>

						<div className="mt-32" />

						<DataTable
							columns={columns}
							options={tableOptionsIncomingActions}
							data={incomingActions.results}
						/>

						<Typography className="mt-20 mb-8" variant="h6" component="h2">
							Расходные операции
						</Typography>
						<Grid container spacing={2}>
							<Grid item md={3} xs={6}>
								<BlockInfo title="Итого" color={palette.text.primary}>
									{numberFormat.currency(statistics.outgoing_data.total)} ₸
								</BlockInfo>
							</Grid>
							{statistics.outgoing_data.money_accounts.map(item => (
								<Grid key={item.money_account} item md={3} xs={6}>
									<BlockInfo title={item.money_account} color={palette.text.primary}>
										{numberFormat.currency(item.sum)} ₸
									</BlockInfo>
								</Grid>
							))}
						</Grid>

						<div className="mt-32" />

						<DataTable
							columns={columns}
							options={tableOptionsOutgoingActions}
							data={outgoingActions.results}
						/>

						<div className="mt-32" />

						<Typography className="mt-20 mb-8" variant="h6" component="h2">
							Перемещения средств
						</Typography>
						<Grid container spacing={2}>
							<Grid item md={3} xs={6}>
								<BlockInfo title="Перемещено в кассу" color={palette.text.primary}>
									{numberFormat.currency(statistics.moving_data?.moving_incoming)} ₸
								</BlockInfo>
							</Grid>
							<Grid item md={3} xs={6}>
								<BlockInfo title="Перемещено из кассы" color={palette.text.primary}>
									{numberFormat.currency(statistics.moving_data?.moving_outgoing)} ₸
								</BlockInfo>
							</Grid>
							<Grid item md={3} xs={6}>
								<BlockInfo title="Перемещено внутри кассы" color={palette.text.primary}>
									{numberFormat.currency(statistics.moving_data?.moving_internal)} ₸
								</BlockInfo>
							</Grid>
						</Grid>

						<div className="mt-32" />

						<DataTable
							columns={movingColumns}
							options={tableOptionsMovingActions}
							data={movingActions.results}
						/>

						<div className="mt-32" />
					</>
				)
			}
			rightContent={
				<Comments
					comments={
						<>
							{cashierShift?.comments?.map(item => (
								<div key={item.uuid} className="mb-20">
									<CardComment
										comment={{
											fullName: item.created_by ? getFullName(item.created_by) : '—',
											text: item.text,
											createdAt: item.created_at
										}}
									/>
								</div>
							))}
						</>
					}
					isHideHistory
					isDisableAdd={!cashierShift || addComment.isLoading}
					addComment={handleAddComment}
				/>
			}
			footer={
				<div className="flex">
					{isCurrentUserCashier && (
						<Button
							onClick={handleControlCashierShift}
							className="mr-16"
							customColor="primary"
							textNormal
							disabled={!canSendToControl || controlCashierShift.isLoading || isFetchingCashierShift}
						>
							Отправить на контроль
						</Button>
					)}
					{isCurrentUserResponsible && (
						<>
							<Button
								onClick={() => setIsShowModalCloseCashierShift(true)}
								className="mr-16"
								customColor="primary"
								textNormal
								disabled={!isCashierShiftOnControl}
							>
								Утвердить смену
							</Button>
							<Button
								onClick={() => setIsShowModalReworkCashierShift(true)}
								className="mr-16"
								textNormal
								disabled={!isCashierShiftOnControl}
							>
								Вернуть на доработку
							</Button>

							{isShowModalCloseCashierShift && (
								<ModalConfirmCloseCashierShift
									isOpen
									cashierShiftDate={cashierShiftDate}
									onClose={() => setIsShowModalCloseCashierShift(false)}
								/>
							)}

							{isShowModalReworkCashierShift && (
								<ModalConfirmReworkCashierShift
									isOpen
									cashierShiftDate={cashierShiftDate}
									onClose={() => setIsShowModalReworkCashierShift(false)}
								/>
							)}
						</>
					)}
				</div>
			}
		/>
	);
}
ModalCashierShift.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	cashierShiftDate: PropTypes.string.isRequired,
	onClose: PropTypes.func.isRequired
};
