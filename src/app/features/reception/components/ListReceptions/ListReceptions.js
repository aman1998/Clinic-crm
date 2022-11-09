import React, { useContext, useEffect, useState } from 'react';
import { Box, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import { useQuery } from 'react-query';
import { Button, DatePickerField, TextField, DataTable, MenuItem, ServerAutocomplete } from '../../../../bizKITUi';
import { useDebouncedFilterForm } from '../../../../hooks';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { BlockReceptionStatus } from '../../../../common/BlockReceptionStatus';
import { ModalAppointmentInfo } from '../../../../common/ModalAppointmentInfo';
import { OptionPatient } from '../../../../common/OptionPatient';
import { getFullName, getShortName } from '../../../../utils';
import { ContextMenu } from '../../pages/Reception';
import { ModalReceive } from '../../../../common/ModalReceive';
import { ModalReserve } from '../../../../common/ModalReserve';
import { clinicService, employeesService, ENTITY, patientsService } from '../../../../services';
import { TYPE_SERVICE_COMMON } from '../../../../services/clinic/constants';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: '160px 430px 1fr 1fr 1fr',
		[theme.breakpoints.down(1279)]: {
			gridTemplateColumns: '160px 2fr 1fr 1fr'
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
		[theme.breakpoints.down(1379)]: {
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

const receptionsStatus = clinicService.getReceptionsStatus();

export function ListReceptions() {
	const classes = useStyles();

	const { form, debouncedForm, handleChange, setInForm, resetForm, setPage, getPage } = useDebouncedFilterForm({
		date: new Date(),
		status: '',
		patient_uuid: null,
		doctor: null,
		offset: 0,
		limit: 10
	});

	const { isLoading, isError, data } = useQuery([ENTITY.CLINIC_RECEPTION, debouncedForm], ({ queryKey }) => {
		return clinicService.getReceptions(queryKey[1]);
	});

	const [selectedReceive, setSelectedReceive] = useState(null);

	const handleOnResetFilter = () => {
		resetForm();
	};

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

	const columns = [
		{
			name: 'type',
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
			name: 'patient',
			label: 'Пациент',
			options: {
				customBodyRenderLite: dataIndex => {
					const { patient } = data.results[dataIndex];

					return getFullName(patient);
				}
			}
		},
		{
			name: 'phone',
			label: 'Телефон',
			options: {
				customBodyRenderLite: dataIndex => {
					const { patient } = data.results[dataIndex];

					return patientsService.getPatientMainPhone(patient);
				}
			}
		},
		{
			name: 'iin',
			label: 'ИИН',
			options: {
				customBodyRenderLite: dataIndex => {
					return data.results[dataIndex].patient.iin ?? '—';
				}
			}
		},
		{
			name: 'doctor',
			label: 'Врач',
			options: {
				customBodyRenderLite: dataIndex => {
					const { doctor } = data.results[dataIndex].service;

					return getShortName(doctor);
				}
			}
		},
		{
			name: 'service',
			label: 'Услуга',
			options: {
				customBodyRenderLite: dataIndex => {
					const { name } = data.results[dataIndex].service;

					return name;
				}
			}
		},
		{
			name: 'status',
			label: 'Статус',
			options: {
				customBodyRenderLite: dataIndex => {
					return <BlockReceptionStatus status={data.results[dataIndex].status} />;
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
			setSelectedReceive(data.results[rowMeta.dataIndex]);
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
						onlyValid
						value={form.date}
						onChange={date => setInForm('date', date)}
					/>

					<ServerAutocomplete
						value={form.patient_uuid}
						label="Поиск по ФИО, телефону, ИИН"
						name="patient_uuid"
						fullWidth
						InputProps={{ size: 'small' }}
						getOptionLabel={option => getFullName(option)}
						renderOption={option => <OptionPatient patient={option} />}
						onFetchList={(search, limit) =>
							patientsService
								.getPatients({
									search,
									limit
								})
								.then(({ data: response }) => response)
						}
						onFetchItem={uuid =>
							patientsService.getPatientByUuid(uuid).then(({ data: response }) => response)
						}
						onChange={value => setInForm('patient_uuid', value?.uuid ?? null)}
					/>

					<ServerAutocomplete
						value={form.doctor}
						label="Врач"
						name="doctor"
						fullWidth
						InputProps={{ size: 'small' }}
						getOptionLabel={option => getFullName(option)}
						onFetchList={(search, limit) =>
							employeesService
								.getDoctors({
									search,
									service_type: TYPE_SERVICE_COMMON,
									limit
								})
								.then(({ data: response }) => response)
						}
						onFetchItem={uuid => employeesService.getDoctor(uuid).then(({ data: response }) => response)}
						onChange={value => setInForm('doctor', value?.uuid ?? null)}
					/>

					<TextField
						select
						label="Статус"
						variant="outlined"
						size="small"
						fullWidth
						name="status"
						value={form.status}
						onChange={handleChange}
					>
						<MenuItem value="">Все</MenuItem>
						{receptionsStatus.map(item => (
							<MenuItem key={item.type} value={item.type}>
								{item.name}
							</MenuItem>
						))}
					</TextField>

					<Button
						className={classes.btnReset}
						textNormal
						variant="outlined"
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

			{isShowModalReceive && <ModalReceive isOpen onClose={() => setIsShowModalReceive(false)} />}

			{isShowModalReserve && <ModalReserve isOpen onClose={() => setIsShowModalReserve(false)} />}

			{selectedReceive && (
				<ModalAppointmentInfo
					isOpen
					onClose={() => setSelectedReceive(null)}
					receptionUuid={selectedReceive.uuid}
				/>
			)}
		</>
	);
}
