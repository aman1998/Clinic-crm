import React, { useState, useContext, useEffect } from 'react';
import moment from 'moment';
import { Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from 'react-query';
import { ContextMenu } from '../../pages/Laboratory';
import { Button, DataTable, DatePickerField, TextField, MenuItem, ServerAutocomplete } from '../../../../bizKITUi';
import { ModalLaboratoryReception } from '../../../../common/ModalLaboratoryReception';
import { useDebouncedFilterForm } from '../../../../hooks';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { getFullName, getShortName } from '../../../../utils';
import { BlockReceptionStatus } from '../../../../common/BlockReceptionStatus';
import { laboratoryService, ENTITY, employeesService, patientsService } from '../../../../services';
import {
	STATUS_LABORATORY_RECEPTION_CASH,
	STATUS_LABORATORY_RECEPTION_PAID,
	STATUS_LABORATORY_RECEPTION_CONFIRMED,
	STATUS_LABORATORY_RECEPTION_WAITING
} from '../../../../services/laboratory/constants';
import { TYPE_SERVICE_LABORATORY } from '../../../../services/clinic/constants';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: '170px 2fr 1fr 1fr 1fr',
		[theme.breakpoints.down(1279)]: {
			gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))'
		}
	}
}));

export function ListLaboratoryReceptions() {
	const classes = useStyles();

	const { form, debouncedForm, handleChange, setInForm, resetForm, setPage, getPage } = useDebouncedFilterForm({
		doctor: null,
		created_at: new Date(),
		patient: '',
		status: '',
		offset: 0,
		limit: 10
	});

	const { isLoading, isError, data } = useQuery([ENTITY.LABORATORY_RECEPTION, debouncedForm], ({ queryKey }) => {
		return laboratoryService.getLaboratoryReceptions(queryKey[1]).then(res => res.data);
	});

	const statusLaboratoryReceptionsList = laboratoryService.getStatusLaboratoryReceptionsList();

	const [isShowModalLaboratoryReception, setIsShowModalLaboratoryReception] = useState(false);
	const [selectedUuidLaboratoryReception, setSelectedUuidLaboratoryReception] = useState(null);
	const handleOnEditLaboratoryReception = uuid => {
		setSelectedUuidLaboratoryReception(uuid);
		setIsShowModalLaboratoryReception(true);
	};
	const handleOnCloseModalLaboratoryReception = () => {
		setSelectedUuidLaboratoryReception(null);
		setIsShowModalLaboratoryReception(false);
	};

	const setMenu = useContext(ContextMenu);
	useEffect(() => {
		setMenu(
			<Button
				textNormal
				className="whitespace-no-wrap ml-10"
				onClick={() => setIsShowModalLaboratoryReception(true)}
			>
				Добавить прием
			</Button>
		);

		return () => setMenu(null);
	}, [setMenu]);

	const columns = [
		{
			name: 'date',
			label: 'Дата',
			options: {
				customBodyRenderLite: dataIndex => {
					const { created_at } = data.results[dataIndex];
					return moment(created_at).format('DD.MM.YYYY');
				}
			}
		},
		{
			name: 'date',
			label: 'Время',
			options: {
				customBodyRenderLite: dataIndex => {
					const { created_at } = data.results[dataIndex];
					return moment(created_at).format('HH:mm');
				}
			}
		},
		{
			name: 'patient',
			label: 'Пациент',
			options: {
				customBodyRenderLite: dataIndex => {
					const { patient } = data.results[dataIndex];
					return getFullName({ lastName: patient.last_name, firstName: patient.first_name });
				}
			}
		},
		{
			name: 'phone',
			label: 'Телефон',
			options: {
				customBodyRenderLite: dataIndex => {
					const { patient } = data.results[dataIndex];
					return patientsService.getPatientMainPhone(patient) ?? '—';
				}
			}
		},
		{
			name: 'iin',
			label: 'ИИН',
			options: {
				customBodyRenderLite: dataIndex => {
					const { patient } = data.results[dataIndex];
					return patient.iin ?? '—';
				}
			}
		},
		{
			name: 'doctor',
			label: 'Врач',
			options: {
				customBodyRenderLite: dataIndex => {
					const { doctor } = data.results[dataIndex];
					return doctor ? getShortName(doctor) : '—';
				}
			}
		},
		{
			name: 'status',
			label: 'Статус',
			options: {
				customBodyRenderLite: dataIndex => {
					const { status } = data.results[dataIndex];
					const map = {
						[STATUS_LABORATORY_RECEPTION_CASH]: 'CASH',
						[STATUS_LABORATORY_RECEPTION_PAID]: 'PAID',
						[STATUS_LABORATORY_RECEPTION_CONFIRMED]: 'CONFIRMED',
						[STATUS_LABORATORY_RECEPTION_WAITING]: 'WAITING'
					};

					return <BlockReceptionStatus status={map[status]} />;
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
			const { uuid } = data.results[rowMeta.dataIndex];

			handleOnEditLaboratoryReception(uuid);
		},
		onChangePage: page => setPage(page),
		onChangeRowsPerPage: limit => setInForm('limit', limit)
	};

	return (
		<>
			<Paper className="p-12 mb-32">
				<form className={`gap-10 ${classes.form}`}>
					<DatePickerField
						label="Дата приема"
						inputVariant="outlined"
						size="small"
						onlyValid
						value={form.created_at}
						onChange={date => setInForm('created_at', date)}
					/>

					<TextField
						label="Поиск по Ф.И.О, карте, телефону, ИИН"
						type="text"
						variant="outlined"
						size="small"
						name="patient"
						className={classes.searchItemFilter}
						fullWidth
						value={form.patient}
						onChange={handleChange}
					/>

					<ServerAutocomplete
						value={form.doctor}
						getOptionLabel={option => getFullName(option)}
						onChange={value => {
							setInForm('doctor', value?.uuid ?? null);
						}}
						label="Врач"
						onFetchList={(search, limit) =>
							employeesService
								.getDoctors({ search, limit, service_type: TYPE_SERVICE_LABORATORY })
								.then(res => res.data)
						}
						onFetchItem={fetchUuid => employeesService.getDoctor(fetchUuid).then(res => res.data)}
						InputProps={{
							size: 'small'
						}}
					/>

					<TextField
						select
						label="Статус"
						variant="outlined"
						size="small"
						name="status"
						value={form.status}
						onChange={handleChange}
					>
						<MenuItem value="">Все</MenuItem>
						{statusLaboratoryReceptionsList.map(item => (
							<MenuItem key={item.type} value={item.type}>
								{item.name}
							</MenuItem>
						))}
					</TextField>

					<div className="flex lg:justify-end">
						<Button
							textNormal
							type="reset"
							color="primary"
							variant="outlined"
							className="lg:ml-16"
							onClick={() => resetForm()}
						>
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

			{isShowModalLaboratoryReception && (
				<ModalLaboratoryReception
					isOpen
					laboratoryReceptionUuid={selectedUuidLaboratoryReception}
					onClose={handleOnCloseModalLaboratoryReception}
				/>
			)}
		</>
	);
}
