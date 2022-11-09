import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import { TextField, DataTable, Button, DatePickerField, MenuItem, ServerAutocomplete } from '../../../../bizKITUi';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { useDebouncedFilterForm } from '../../../../hooks';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { BlockReceptionStatus } from '../../../../common/BlockReceptionStatus';
import { ModalLaboratoryReception } from '../../../../common/ModalLaboratoryReception';
import { employeesService, ENTITY, laboratoryService } from '../../../../services';
import { TYPE_SERVICE_LABORATORY } from '../../../../services/clinic/constants';
import { getFullName } from '../../../../utils';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
	},
	btnReset: {
		display: 'flex',
		justifyContent: 'flex-end',
		marginLeft: 'auto',
		[theme.breakpoints.down(878)]: {
			margin: '0',
			justifyContent: 'flex-start'
		}
	}
}));

export function ListPatientLaboratory({ patientsUuid }) {
	const classes = useStyles();

	const { form, debouncedForm, handleChange, setInForm, getPage, setPage, resetForm } = useDebouncedFilterForm({
		patient_uuid: patientsUuid,
		date: null,
		doctor: null,
		service: null,
		status: '',
		limit: 10,
		offset: 0
	});

	const { isLoading, isError, data } = useQuery([ENTITY.LABORATORY_RECEPTION, debouncedForm], ({ queryKey }) =>
		laboratoryService.getLaboratoryReceptions(queryKey[1]).then(res => res.data)
	);

	const statusLaboratoryReceptionsList = laboratoryService.getStatusLaboratoryReceptionsList();

	const [selectedLaboratoryReceptionUuid, setSelectedLaboratoryReceptionUuid] = useState(null);

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
			name: 'doctor',
			label: 'Врач',
			options: {
				customBodyRenderLite: dataIndex => {
					const { doctor } = data.results[dataIndex];

					return getFullName(doctor);
				}
			}
		},
		{
			name: 'service',
			label: 'Услуга',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];
					const limitStr = 80;
					const str = currentItem.services.map(item => item.service.name).join(', ');

					return str.substring(0, limitStr) + (str.length > limitStr ? '...' : '');
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
			const { uuid } = data.results[rowMeta.dataIndex];

			setSelectedLaboratoryReceptionUuid(uuid);
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
						value={form.date}
						onChange={date => setInForm('date', date)}
					/>

					<ServerAutocomplete
						getOptionLabel={option => getFullName(option)}
						label="Врач"
						value={form.doctor}
						InputProps={{ size: 'small' }}
						fullWidth
						onChange={value => setInForm('doctor', value?.uuid ?? null)}
						onFetchList={(search, limit) =>
							employeesService
								.getDoctors({
									search,
									limit,
									service_type: TYPE_SERVICE_LABORATORY
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
						fullWidth
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

					<div className={classes.btnReset}>
						<Button textNormal type="reset" color="primary" variant="outlined" onClick={() => resetForm()}>
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

			{selectedLaboratoryReceptionUuid && (
				<ModalLaboratoryReception
					isOpen
					onClose={() => setSelectedLaboratoryReceptionUuid(null)}
					laboratoryReceptionUuid={selectedLaboratoryReceptionUuid}
				/>
			)}
		</>
	);
}
ListPatientLaboratory.propTypes = {
	patientsUuid: PropTypes.string.isRequired
};
