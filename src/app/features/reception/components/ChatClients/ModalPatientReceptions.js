import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from 'react-query';
import moment from 'moment';
import { Box, Paper } from '@material-ui/core';
import {
	Button,
	DataTable,
	DatePickerField,
	DialogSimpleTemplate,
	MenuItem,
	ServerAutocomplete,
	TextField
} from '../../../../bizKITUi';
import { useDebouncedFilterForm } from '../../../../hooks';
import { clinicService, employeesService, ENTITY } from '../../../../services';
import { getFullName, getShortName } from '../../../../utils';
import { TYPE_SERVICE_COMMON } from '../../../../services/clinic/constants';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { modalPromise } from '../../../../common/ModalPromise';
import { BlockReceptionStatus } from '../../../../common/BlockReceptionStatus';
import { ModalAppointmentInfo } from '../../../../common/ModalAppointmentInfo';

const useStyles = makeStyles(theme => ({
	itemFilter: {
		flex: 1,
		marginLeft: theme.spacing(2)
	},
	itemDate: {
		maxWidth: 200,
		minWidth: 200
	},
	button: {
		width: 115,
		minWidth: 115,
		marginLeft: theme.spacing(2)
	},
	formContainer: {
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(4),
		padding: theme.spacing(2)
	}
}));

const receptionsStatus = clinicService.getReceptionsStatus();

export function ModalPatientReceptions({ isOpen, patientUuid, onClose }) {
	const classes = useStyles();

	const { form, debouncedForm, handleChange, setInForm, resetForm, setPage, getPage } = useDebouncedFilterForm({
		date: null,
		status: '',
		patient_uuid: patientUuid,
		service: null,
		doctor: null,
		offset: 0,
		limit: 10
	});

	const { isLoading, isError, data } = useQuery([ENTITY.CLINIC_RECEPTION, debouncedForm], ({ queryKey }) =>
		clinicService.getReceptions(queryKey[1])
	);

	const columns = [
		{
			name: 'typeReception',
			label: 'Тип приема',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];

					return moment(currentItem.date_time).diff(moment()) > 0 ? 'Предстоящий' : 'Прошедший';
				}
			}
		},
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
			modalPromise.open(({ onClose: onCloseModal }) => (
				<ModalAppointmentInfo
					isOpen
					receptionUuid={data.results[rowMeta.dataIndex].uuid}
					onClose={onCloseModal}
				/>
			));
		},
		onChangePage: page => setPage(page),
		onChangeRowsPerPage: limit => setInForm('limit', limit)
	};

	return (
		<DialogSimpleTemplate
			isOpen={isOpen}
			header={<>Приемы пациента</>}
			fullScreen={false}
			maxWidth="lg"
			fullWidth
			onClose={onClose}
		>
			<>
				<Paper className={classes.formContainer}>
					<Box component="form" display="flex">
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

						<ServerAutocomplete
							value={form.doctor}
							label="Врач"
							name="doctor"
							fullWidth
							className={classes.itemFilter}
							InputProps={{ size: 'small' }}
							getOptionLabel={option => getFullName(option)}
							onFetchList={(search, limit) =>
								employeesService
									.getDoctors({
										search,
										limit,
										service_type: TYPE_SERVICE_COMMON,
										service: form.service
									})
									.then(({ data: response }) => response)
							}
							onFetchItem={uuid =>
								employeesService.getDoctor(uuid).then(({ data: response }) => response)
							}
							onChange={value => setInForm('doctor', value?.uuid ?? null)}
						/>

						<ServerAutocomplete
							value={form.service}
							name="service"
							label="Услуга"
							className={classes.itemFilter}
							InputProps={{
								size: 'small'
							}}
							getOptionLabel={option => option.name}
							onFetchList={(name, limit) =>
								clinicService.getServicesNested({
									name,
									limit,
									type: TYPE_SERVICE_COMMON,
									doctor: form.doctor
								})
							}
							onFetchItem={fetchUuid => clinicService.getServiceById(fetchUuid)}
							onChange={value => setInForm('service', value?.uuid ?? null)}
						/>

						<TextField
							select
							label="Статус"
							variant="outlined"
							size="small"
							fullWidth
							className={classes.itemFilter}
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
							textNormal
							variant="outlined"
							className={classes.button}
							fullWidth
							disabled={isLoading}
							onClick={resetForm}
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
			</>
		</DialogSimpleTemplate>
	);
}
ModalPatientReceptions.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	patientUuid: PropTypes.string.isRequired,
	onClose: PropTypes.func.isRequired
};
