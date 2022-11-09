import React, { useState, useContext, useEffect } from 'react';
import { useQuery } from 'react-query';
import moment from 'moment';
import { Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ContextMenu } from '../../pages/Hospital';
import { Button, DataTable, DatePickerField, TextField, MenuItem, ServerAutocomplete } from '../../../../bizKITUi';
import { ModalHospitalReception } from '../../../../common/ModalHospitalReception';
import { useDebouncedFilterForm } from '../../../../hooks';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { getFullName, getShortName } from '../../../../utils';
import { BlockReceptionStatus } from '../../../../common/BlockReceptionStatus';
import { hospitalService, ENTITY, patientsService, employeesService } from '../../../../services';
import {
	STATUS_RECEPTION_CASH,
	STATUS_RECEPTION_CONFIRMED,
	STATUS_RECEPTION_PAID,
	TYPE_SERVICE_HOSPITAL,
	STATUS_RECEPTION_WAITING
} from '../../../../services/clinic/constants';
import {
	STATUS_HOSPITAL_RECEPTION_CASH,
	STATUS_HOSPITAL_RECEPTION_CONFIRMED,
	STATUS_HOSPITAL_RECEPTION_PAID,
	STATUS_HOSPITAL_RECEPTION_WAITING
} from '../../../../services/hospital/constants';

const statusMap = {
	[STATUS_HOSPITAL_RECEPTION_CASH]: STATUS_RECEPTION_CASH,
	[STATUS_HOSPITAL_RECEPTION_PAID]: STATUS_RECEPTION_PAID,
	[STATUS_HOSPITAL_RECEPTION_CONFIRMED]: STATUS_RECEPTION_CONFIRMED,
	[STATUS_HOSPITAL_RECEPTION_WAITING]: STATUS_RECEPTION_WAITING
};

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: '170px 430px 1fr 1fr 1fr',
		[theme.breakpoints.down(1379)]: {
			gridTemplateColumns: '170px 2fr 1fr 1fr'
		},
		[theme.breakpoints.down(767)]: {
			gridTemplateColumns: '1fr'
		}
	},
	btnReset: {
		display: 'flex',
		justifyContent: 'flex-end',
		marginLeft: 'auto',
		[theme.breakpoints.down(1379)]: {
			margin: '0',
			justifyContent: 'flex-start'
		}
	}
}));

const defaultValues = {
	doctor: null,
	created_at: new Date(),
	patient: '',
	status: '',
	offset: 0,
	limit: 10
};

export function ListHospitalReceptions() {
	const classes = useStyles();

	const { form, debouncedForm, handleChange, setInForm, resetForm, setPage, getPage } = useDebouncedFilterForm(
		defaultValues
	);
	const { isLoading, isError, data } = useQuery([ENTITY.HOSPITAL_RECEPTION, debouncedForm], () => {
		return hospitalService.getHospitalReceptions(debouncedForm);
	});

	const statusHospitalReceptionsList = hospitalService.getStatusHospitalReceptionsList();

	const [isShowModalHospitalReception, setIsShowModalHospitalReception] = useState(false);
	const [selectedUuidHospitalReception, setSelectedUuidHospitalReception] = useState(null);
	const handleOnEditHospitalReception = uuid => {
		setSelectedUuidHospitalReception(uuid);
		setIsShowModalHospitalReception(true);
	};
	const handleOnCloseModalHospitalReception = () => {
		setSelectedUuidHospitalReception(null);
		setIsShowModalHospitalReception(false);
	};

	const handleOnResetFilter = () => {
		resetForm();
	};

	const setMenu = useContext(ContextMenu);
	useEffect(() => {
		setMenu(
			<Button
				textNormal
				className="whitespace-no-wrap ml-10"
				onClick={() => setIsShowModalHospitalReception(true)}
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
					const { patient } = data.results[dataIndex];
					return patient.iin;
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
			name: 'status',
			label: 'Статус',
			options: {
				customBodyRenderLite: dataIndex => {
					const { status } = data.results[dataIndex];
					return <BlockReceptionStatus status={statusMap[status]} />;
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
			handleOnEditHospitalReception(uuid);
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
						fullWidth
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
						value={form.patient}
						onChange={handleChange}
					/>

					<ServerAutocomplete
						getOptionLabel={option => getFullName(option)}
						label="Врач"
						value={form.doctor}
						InputProps={{ size: 'small' }}
						onChange={value => setInForm('doctor', value?.uuid ?? null)}
						onFetchList={(search, limit) =>
							employeesService
								.getDoctors({
									search,
									limit,
									service_type: TYPE_SERVICE_HOSPITAL
								})
								.then(res => res.data)
						}
						onFetchItem={uuid => employeesService.getDoctor(uuid).then(res => res.data)}
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
						{statusHospitalReceptionsList.map(item => (
							<MenuItem key={item.type} value={item.type}>
								{item.name}
							</MenuItem>
						))}
					</TextField>

					<div className={classes.btnReset}>
						<Button textNormal color="primary" variant="outlined" onClick={handleOnResetFilter}>
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

			{isShowModalHospitalReception && (
				<ModalHospitalReception
					isOpen
					hospitalReceptionUuid={selectedUuidHospitalReception}
					onClose={handleOnCloseModalHospitalReception}
				/>
			)}
		</>
	);
}
