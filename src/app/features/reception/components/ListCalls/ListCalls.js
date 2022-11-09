import React, { useState, useMemo, useContext, useEffect } from 'react';
import { useQuery } from 'react-query';
import moment from 'moment';

import { Paper, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import PlayCircleOutlineOutlinedIcon from '@material-ui/icons/PlayCircleOutlineOutlined';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ContextMenu } from '../../pages/Reception';
import { BlockReceptionStatus } from '../../../../common/BlockReceptionStatus';
import { CallStatusIndicator } from '../../../../common/CallStatusIndicator';
import { getShortName } from '../../../../utils';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { useDebouncedFilterForm } from '../../../../hooks';
import { Button, DatePickerField, TextField, DataTable, MenuItem, TimePickerField } from '../../../../bizKITUi';
import { ModalReceive } from '../../../../common/ModalReceive';
import { ModalReserve } from '../../../../common/ModalReserve';
import { ModalAppointmentInfo } from '../../../../common/ModalAppointmentInfo';
import { telephonyService, clinicService, ENTITY } from '../../../../services';
import { ModalCallsRecord } from '../../../../common/ModalCallsRecord';
import { CallButton } from '../../../../common/CallButton';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: 'repeat(7, 1fr)',
		[theme.breakpoints.down(1500)]: {
			gridTemplateColumns: 'repeat(5, 1fr)'
		},
		[theme.breakpoints.down(1500)]: {
			gridTemplateColumns: 'repeat(3, 1fr)'
		},
		[theme.breakpoints.down(767)]: {
			gridTemplateColumns: '1fr'
		}
	},
	btnReset: {
		display: 'flex',
		justifyContent: 'flex-end',
		marginLeft: 'auto',
		width: 115,
		[theme.breakpoints.down(1500)]: {
			margin: '0',
			justifyContent: 'flex-start'
		}
	},
	formContainer: {
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(4),
		padding: theme.spacing(2)
	}
}));

export function ListCalls() {
	const classes = useStyles();

	const [selectedCallToListen, setSelectedCallToListen] = useState(null);
	const [selectedCall, setSelectedCall] = useState(null);
	const [isShowModalReceive, setIsShowModalReceive] = useState(false);
	const [isShowModalReserve, setIsShowModalReserve] = useState(false);

	const setMenu = useContext(ContextMenu);

	useEffect(() => {
		setMenu(
			<div className="flex">
				<Button
					textNormal
					className="whitespace-no-wrap"
					variant="outlined"
					onClick={() => setIsShowModalReserve(true)}
				>
					Добавить резерв
				</Button>
				<Button textNormal className="whitespace-no-wrap ml-10" onClick={() => setIsShowModalReceive(true)}>
					Добавить новый приём
				</Button>
			</div>
		);
		return () => setMenu(null);
	}, [setMenu]);

	const { form, debouncedForm, getPage, setPage, resetForm, setInForm } = useDebouncedFilterForm({
		date: null,
		time_from: null,
		time_to: null,
		variant: '',
		patient: '',
		status: '',
		limit: 10,
		offset: 0
	});

	const { isLoading, isError, data } = useQuery([ENTITY.CALL, debouncedForm], ({ queryKey }) =>
		telephonyService.getCalls(queryKey[1])
	);

	const handleOnResetFilter = event => {
		event.preventDefault();
		resetForm();
	};
	const handleOnCloseModalReceive = () => {
		setIsShowModalReceive(false);
		setSelectedCall(null);
	};

	const columns = useMemo(
		() => [
			{
				name: 'type',
				label: 'Тип',
				options: {
					customBodyRenderLite: dataIndex => {
						const currentItem = data.results[dataIndex];
						return <CallStatusIndicator status={currentItem.status} type={currentItem.type} />;
					}
				}
			},
			{
				name: 'start_date',
				label: 'Дата',
				options: {
					customBodyRenderLite: dataIndex => {
						const currentItem = data.results[dataIndex];
						return moment(currentItem.start_date_time).format('DD.MM.YYYY');
					}
				}
			},
			{
				name: 'start_time',
				label: 'Время',
				options: {
					customBodyRenderLite: dataIndex => {
						const currentItem = data.results[dataIndex];
						return moment(currentItem.start_date_time).format('HH:mm');
					}
				}
			},
			{
				name: 'client_phone',
				label: 'Номер',
				options: {
					customBodyRenderLite: dataIndex => {
						const { client_phone } = data.results[dataIndex];
						return (
							<>
								{client_phone} <CallButton phoneNumber={client_phone} />
							</>
						);
					}
				}
			},
			{
				name: 'patient',
				label: 'Пациент',
				options: {
					customBodyRenderLite: dataIndex => {
						const currentItem = data.results[dataIndex];
						return currentItem?.patient ? getShortName(currentItem.patient) : '—';
					}
				}
			},
			{
				name: 'status',
				label: 'Статус',
				options: {
					customBodyRenderLite: dataIndex => {
						const currentItem = data.results[dataIndex];
						return currentItem?.receive ? (
							<BlockReceptionStatus status={currentItem.receive.status} />
						) : (
							'—'
						);
					}
				}
			},
			{
				name: 'actions',
				label: 'Запись звонка',
				options: {
					customBodyRenderLite: dataIndex => {
						const currentItem = data.results[dataIndex];
						return currentItem?.record ? (
							<Button
								textNormal
								variant="text"
								startIcon={<PlayCircleOutlineOutlinedIcon />}
								onClick={event => {
									event.stopPropagation();
									setSelectedCallToListen(currentItem);
								}}
							>
								Прослушать
							</Button>
						) : (
							'—'
						);
					}
				}
			}
		],
		[data]
	);
	const tableOptions = {
		serverSide: true,
		rowsPerPage: form.limit,
		page: getPage(),
		count: data?.count ?? 0,
		onRowClick: (_, rowMeta) => {
			const currentItem = data.results[rowMeta.dataIndex];
			setSelectedCall(currentItem);
			if (!currentItem.receive) {
				setIsShowModalReceive(true);
			}
		},
		onChangePage: page => setPage(page),
		onChangeRowsPerPage: limit => setInForm('limit', limit)
	};

	return (
		<>
			<Paper className={classes.formContainer}>
				<Box component="form" className={`gap-10 ${classes.form}`}>
					<DatePickerField
						label="Дата звонка"
						inputVariant="outlined"
						size="small"
						fullWidth
						onlyValid
						value={form.date}
						name="date"
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

					<TextField
						select
						label="Тип"
						variant="outlined"
						size="small"
						fullWidth
						value={form.variant}
						onChange={event => setInForm('variant', event.target.value)}
					>
						<MenuItem value="">Все</MenuItem>
						{telephonyService.callVariants.map(item => (
							<MenuItem key={item.name} value={item.type}>
								{item.name}
							</MenuItem>
						))}
					</TextField>

					<TextField
						label="Пациент/телефон"
						variant="outlined"
						size="small"
						fullWidth
						value={form.patient}
						onChange={event => setInForm('patient', event.target.value)}
					/>

					<TextField
						select
						label="Статус"
						variant="outlined"
						size="small"
						fullWidth
						value={form.status}
						onChange={event => setInForm('status', event.target.value)}
					>
						<MenuItem value="">Все</MenuItem>
						{clinicService.getReceptionsStatus().map(item => (
							<MenuItem key={item.type} value={item.type}>
								{item.name}
							</MenuItem>
						))}
					</TextField>

					<Button
						textNormal
						type="reset"
						variant="outlined"
						className={classes.btnReset}
						fullWidth
						disabled={isLoading}
						onClick={handleOnResetFilter}
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
				<DataTable columns={columns} options={tableOptions} data={data.results} />
			)}

			{isShowModalReceive && !selectedCall?.receive && (
				<ModalReceive
					isOpen
					initialValues={{
						patient: selectedCall?.patient?.uuid,
						callType: selectedCall?.type,
						patientNumber: selectedCall?.client_phone
					}}
					onClose={handleOnCloseModalReceive}
				/>
			)}

			{isShowModalReserve && <ModalReserve isOpen onClose={() => setIsShowModalReserve(false)} />}

			{selectedCall?.receive && (
				<ModalAppointmentInfo
					isOpen
					onClose={() => setSelectedCall(null)}
					receptionUuid={selectedCall.receive.uuid}
				/>
			)}

			{selectedCallToListen && (
				<ModalCallsRecord
					isOpen
					onClose={() => setSelectedCallToListen(null)}
					callUuid={selectedCallToListen.uuid}
				/>
			)}
		</>
	);
}
