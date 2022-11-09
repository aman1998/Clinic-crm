import React, { useContext, useState, useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import { Box, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import { Button, DatePickerField, TextField, DataTable, MenuItem } from '../../../../bizKITUi';
import { useDebouncedFilterForm } from '../../../../hooks';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { numberFormat, getFullName, getShortName } from '../../../../utils';
import { financeService, authService, ENTITY } from '../../../../services';
import { ContextMenu } from '../../pages/Finance';
import { ModalCashierShift } from '../ModalCashierShift';
import { GuardCheckCashierShift } from '../../../../common/GuardCheckCashierShift';
import { ModalOpenCashierShift } from '../../../../common/ModalOpenCashierShift';
import { CASHIER_SHIFT_STATUS_CLOSED } from '../../../../services/finance/constants';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: 'minmax(230px, 300px) 170px 1fr',
		[theme.breakpoints.down(660)]: {
			gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
		}
	},
	buttonReset: {
		display: 'flex',
		justifyContent: 'flex-end',
		marginLeft: 'auto',
		width: 100,
		[theme.breakpoints.down(660)]: {
			margin: '0'
		}
	},
	formContainer: {
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(2),
		padding: theme.spacing(2)
	}
}));

const defaultValues = {
	date: null,
	cashier: '',
	limit: 10,
	offset: 0
};

export function ListCashierShift() {
	const classes = useStyles();

	const { form, debouncedForm, setInForm, setForm, setPage, getPage, handleChange } = useDebouncedFilterForm(
		defaultValues
	);
	const { isLoading, isError, data: cashierShifts } = useQuery([ENTITY.CASHIER_WORK_SHIFT, debouncedForm], () =>
		financeService.getCashierShifts(debouncedForm)
	);
	const { data: listUsers } = useQuery([ENTITY.USER, { limit: Number.MAX_SAFE_INTEGER }], () =>
		authService.getUsers({ limit: Number.MAX_SAFE_INTEGER })
	);

	const handleOnResetFilter = () => {
		setForm(defaultValues);
	};

	const [selectedShiftDate, setSelectedShiftDate] = useState(null);
	const [isShowModalOpen, setIsShowModalOpen] = useState(false);
	const today = moment().format('YYYY-MM-DD');

	const setMenu = useContext(ContextMenu);
	useEffect(() => {
		setMenu(
			<GuardCheckCashierShift
				fallback={({ isExists }) => (
					<>
						<Button
							onClick={() => {
								setIsShowModalOpen(true);
							}}
							textNormal
							disabled={isExists}
							className="ml-16"
							style={{ width: '150px' }}
						>
							Открыть смену
						</Button>

						{isShowModalOpen && (
							<ModalOpenCashierShift
								isOpen
								onClose={() => {
									setIsShowModalOpen(false);
								}}
							/>
						)}
					</>
				)}
			>
				{() => (
					<Button onClick={() => setSelectedShiftDate(today)} textNormal>
						Закрыть смену
					</Button>
				)}
			</GuardCheckCashierShift>
		);
		return () => setMenu(null);
	}, [isShowModalOpen, selectedShiftDate, setMenu, today]);

	const columns = useMemo(
		() => [
			{
				name: 'date',
				label: 'Дата',
				options: {
					customBodyRender: value => {
						return moment(value).format('DD.MM.YYYY');
					}
				}
			},
			{
				name: 'cashier',
				label: 'Кассир',
				options: {
					customBodyRender: value => {
						return getShortName(value) ?? '—';
					}
				}
			},
			{
				name: 'incoming_total',
				label: 'Приход',
				options: {
					customBodyRender: value => {
						return `${numberFormat.currency(value ?? 0)} ₸`;
					}
				}
			},
			{
				name: 'outgoing_total',
				label: 'Расход',
				options: {
					customBodyRender: value => {
						return `${numberFormat.currency(value ?? 0)} ₸`;
					}
				}
			},
			{
				name: 'end_day_balance',
				label: 'Остаток на конец дня',
				options: {
					customBodyRender: value => {
						return `${numberFormat.currency(value ?? 0)} ₸`;
					}
				}
			},
			{
				name: 'status',
				label: 'Статус',
				options: {
					customBodyRenderLite: dataIndex => {
						const { status, date } = cashierShifts.results[dataIndex];
						const isInvalid = date !== today && status !== CASHIER_SHIFT_STATUS_CLOSED;
						return (
							<Typography color={isInvalid ? 'error' : 'textPrimary'}>
								{financeService.getCashierShiftStatusNameByStatus(status)}
							</Typography>
						);
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
		],
		[cashierShifts, today]
	);
	const tableOptions = useMemo(
		() => ({
			serverSide: true,
			rowsPerPage: form.limit,
			page: getPage(),
			count: cashierShifts?.count ?? 0,
			onRowClick: (_, rowMeta) => {
				setSelectedShiftDate(cashierShifts.results[rowMeta.dataIndex].date);
			},
			onChangePage: page => setPage(page),
			onChangeRowsPerPage: limit => setInForm('limit', limit)
		}),
		[cashierShifts, form.limit, getPage, setInForm, setPage]
	);

	return (
		<>
			<Paper className={classes.formContainer}>
				<Box component="form" className={`gap-10 ${classes.form}`}>
					<TextField
						label="Кассир"
						variant="outlined"
						select
						name="cashier"
						value={form.cashier}
						size="small"
						onChange={handleChange}
					>
						<MenuItem value="">Не выбрано</MenuItem>
						{listUsers?.results.map(item => (
							<MenuItem value={item.uuid} key={item.uuid}>
								{getFullName(item)}
							</MenuItem>
						))}
					</TextField>

					<DatePickerField
						label="Дата"
						inputVariant="outlined"
						size="small"
						fullWidth
						onlyValid
						value={form.date}
						onChange={date => setInForm('date', date)}
					/>

					<Button
						textNormal
						className={classes.buttonReset}
						disabled={isLoading}
						onClick={handleOnResetFilter}
						variant="outlined"
					>
						Сбросить
					</Button>
				</Box>
			</Paper>

			{isLoading ? (
				<FuseLoading />
			) : isError ? (
				<ErrorMessage />
			) : (
				<DataTable columns={columns} options={tableOptions} data={cashierShifts.results} />
			)}

			{selectedShiftDate && (
				<ModalCashierShift
					isOpen
					cashierShiftDate={selectedShiftDate}
					onClose={() => {
						setSelectedShiftDate(null);
					}}
				/>
			)}
		</>
	);
}
