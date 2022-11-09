import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { makeStyles, Paper } from '@material-ui/core';
import moment from 'moment';
import FuseLoading from '@fuse/core/FuseLoading';
import { useHistory } from 'react-router';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { Button, DataTable, DatePickerField, MenuItem, ServerAutocomplete, TextField } from '../../../../bizKITUi';
import { employeesService, ENTITY, treatmentService } from '../../../../services';
import { useDebouncedFilterForm } from '../../../../hooks';
import { getFullName, getTreatmentType } from '../../../../utils';
import { TYPE_SERVICE_HOSPITAL } from '../../../../services/clinic/constants';
import { BlockTreatmentStatus } from '../../../../common/BlockTreatmentStatus';

const defaultValues = {
	doctor_fio: null,
	created_at: new Date(),
	patient: '',
	status: '',
	offset: 0,
	limit: 10
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

export function ListTreatments() {
	const [data, setData] = useState([]);

	const history = useHistory();
	const classes = useStyles();
	const { form, debouncedForm, handleChange, setInForm, resetForm, setPage, getPage } = useDebouncedFilterForm(
		defaultValues
	);

	const { isLoading, isError, data: treatmentsData } = useQuery([ENTITY.HOSPITAL_RECEPTION, debouncedForm], () => {
		return treatmentService.getTreatments(debouncedForm);
	});

	useEffect(() => {
		if (treatmentsData) setData(treatmentsData);
	}, [treatmentsData]);

	const handleOnResetFilter = () => {
		resetForm();
	};

	const columns = [
		{
			name: 'date',
			label: 'Дата приема',
			options: {
				customBodyRenderLite: dataIndex => {
					const { created_at } = data[dataIndex];
					return moment(created_at).format('DD.MM.YYYY');
				}
			}
		},
		{
			name: 'patient_fio',
			label: 'Пациент',
			options: {
				customBodyRenderLite: dataIndex => {
					const { patient_info } = data[dataIndex];
					return getFullName(patient_info);
				}
			}
		},
		{
			name: 'doctor_fio',
			label: 'Врач',
			options: {
				customBodyRenderLite: dataIndex => {
					const { doctor_info } = data[dataIndex];
					return getFullName(doctor_info);
				}
			}
		},
		{
			name: 'treatment_type',
			label: 'Тип лечения',
			options: {
				customBodyRenderLite: dataIndex => {
					const { treatment_type } = data[dataIndex];
					return getTreatmentType(treatment_type);
				}
			}
		},
		{
			name: 'status',
			label: 'Статус',
			options: {
				customBodyRenderLite: dataIndex => {
					return <BlockTreatmentStatus status={data[dataIndex].status} />;
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
			const { uuid } = data[rowMeta.dataIndex];
			history.push(`treatment/${uuid}`);
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
						label="Поиск по Ф.И.О"
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
				<DataTable data={data} columns={columns} options={tableOptions} />
			)}
		</>
	);
}
