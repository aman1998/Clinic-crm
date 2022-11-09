import React, { useState } from 'react';
import { useQuery } from 'react-query';
import moment from 'moment';
import { Box, Paper, useTheme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { AddCircle as AddCircleIcon, Refresh as RefreshIcon } from '@material-ui/icons';
import { Button, DatePickerField, DataTable, TimePickerField, ServerAutocomplete } from '../../../../bizKITUi';
import { useDebouncedFilterForm } from '../../../../hooks';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { BlockReceptionStatus } from '../../../../common/BlockReceptionStatus';
import { OptionPatient } from '../../../../common/OptionPatient';
import { numberFormat, getFullName, getShortName } from '../../../../utils';
import { ModalFinanceIncome } from '../../../../common/ModalFinanceIncome';
import {
	FINANCE_BASE_TYPE_RECEPTION,
	FINANCE_BASE_TYPE_STATIONARY_RECEPTION,
	FINANCE_BASE_TYPE_LABORATORY_RECEPTION,
	FINANCE_BASE_TYPE_OPERATION
} from '../../../../services/finance/constants';
import { clinicService, employeesService, ENTITY, financeService, patientsService } from '../../../../services';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: '170px 140px 140px 160px 160px 160px 1fr',
		[theme.breakpoints.down(1379)]: {
			gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))'
		},
		[theme.breakpoints.down(767)]: {
			gridTemplateColumns: '1fr'
		}
	},
	button: {
		marginLeft: 'auto',
		width: 64,
		[theme.breakpoints.down(1379)]: {
			margin: 0
		}
	},
	formContainer: {
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(4),
		padding: theme.spacing(2)
	},
	infoText: {
		marginTop: 4,
		fontSize: 13
	}
}));

export function ListWaitingForPayment() {
	const classes = useStyles();
	const theme = useTheme();

	const { form, debouncedForm, getPage, setPage, setInForm, resetForm } = useDebouncedFilterForm({
		date: new Date(),
		counterparty: null,
		service: null,
		doctor: null,
		patient: null,
		time_to: null,
		time_from: null,
		limit: 10,
		offset: 0
	});
	const { isLoading, isError, data } = useQuery([ENTITY.FINANCE_ACTION_PENDING, debouncedForm], ({ queryKey }) =>
		financeService.getFinanceActionsPending(queryKey[1]).then(res => res.data)
	);

	const [selectedFinanceAction, setSelectedFinanceAction] = useState(null);

	const columns = [
		{
			name: 'type',
			label: 'Тип',
			options: {
				customBodyRenderLite: () => {
					return (
						<div style={{ color: theme.palette.success.main }}>
							<AddCircleIcon color="inherit" />
						</div>
					);
				}
			}
		},
		{
			name: 'date',
			label: 'Дата',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];

					return moment(currentItem.date_time).format('DD.MM.YYYY');
				}
			}
		},
		{
			name: 'time',
			label: 'Время',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];

					return moment(currentItem.date_time).format('HH:mm');
				}
			}
		},
		{
			name: 'counterparty',
			label: 'Отправитель',
			options: {
				customBodyRenderLite: dataIndex => {
					const { counterparty } = data.results[dataIndex];

					return (
						<div>
							{getFullName(counterparty)}
							<div className={classes.infoText}>Пациент</div>
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
					const { doctor } = data.results[dataIndex];

					return getShortName(doctor);
				}
			}
		},
		{
			name: 'service',
			label: 'Услуга',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];

					return {
						[FINANCE_BASE_TYPE_RECEPTION]: currentItem.service?.name ?? '',
						[FINANCE_BASE_TYPE_OPERATION]: currentItem.service?.name ?? '',
						[FINANCE_BASE_TYPE_STATIONARY_RECEPTION]: 'Прием стационара',
						[FINANCE_BASE_TYPE_LABORATORY_RECEPTION]: 'Прием лаборатории',
						[undefined]: currentItem.service?.name ?? ''
					}[currentItem.base_type];
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
			name: 'status',
			label: 'Статус',
			options: {
				customBodyRenderLite: () => {
					return <BlockReceptionStatus status="CASH" />;
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
			setSelectedFinanceAction(data.results[rowMeta.dataIndex]);
		},
		onChangePage: page => setPage(page),
		onChangeRowsPerPage: limit => setInForm('limit', limit)
	};

	return (
		<>
			<Paper className={classes.formContainer}>
				<Box component="form" className={`gap-10 ${classes.form}`}>
					<DatePickerField
						label="Дата приема"
						inputVariant="outlined"
						size="small"
						fullWidth
						className={classes.itemDate}
						onlyValid
						value={form.date}
						onChange={date => setInForm('date', date)}
					/>

					<TimePickerField
						label="Время от"
						inputVariant="outlined"
						size="small"
						fullWidth
						className={classes.itemTime}
						onlyValid
						value={form.time_from}
						onChange={date => setInForm('time_from', date)}
					/>

					<TimePickerField
						label="Время до"
						inputVariant="outlined"
						size="small"
						fullWidth
						className={classes.itemTime}
						onlyValid
						value={form.time_to}
						onChange={date => setInForm('time_to', date)}
					/>

					<ServerAutocomplete
						name="counterparty"
						label="Пациент"
						className={classes.itemFilter}
						InputProps={{
							size: 'small'
						}}
						value={form.counterparty}
						onChange={value => setInForm('counterparty', value?.uuid ?? null)}
						getOptionLabel={option => getFullName(option)}
						renderOption={option => <OptionPatient patient={option} />}
						onFetchList={(search, limit) =>
							patientsService.getPatients({ search, limit }).then(res => res.data)
						}
						onFetchItem={fetchUuid => patientsService.getPatientByUuid(fetchUuid).then(res => res.data)}
					/>

					<ServerAutocomplete
						name="service"
						label="Услуга"
						className={classes.itemFilter}
						InputProps={{
							size: 'small'
						}}
						value={form.service}
						onChange={value => setInForm('service', value?.uuid ?? null)}
						getOptionLabel={option => option.name}
						onFetchList={(name, limit) => clinicService.getServices({ name, limit }).then(res => res.data)}
						onFetchItem={fetchUuid => clinicService.getServiceById(fetchUuid).then(res => res.data)}
					/>

					<ServerAutocomplete
						name="doctor"
						label="Врач"
						className={classes.itemFilter}
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

			{selectedFinanceAction && (
				<ModalFinanceIncome
					isOpen
					financeActionPendingUuid={selectedFinanceAction.uuid}
					onClose={() => setSelectedFinanceAction(null)}
				/>
			)}

			{isLoading ? (
				<FuseLoading />
			) : isError ? (
				<ErrorMessage />
			) : (
				<DataTable columns={columns} options={tableOptions} data={data.results} />
			)}
		</>
	);
}
