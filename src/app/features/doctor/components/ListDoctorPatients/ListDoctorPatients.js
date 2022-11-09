import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import PropTypes from 'prop-types';
import { TextField, DataTable, Button, DatePickerField, MenuItem } from '../../../../bizKITUi';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { useDebouncedFilterForm } from '../../../../hooks';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { ModalPatient } from '../../../../common/ModalPatient';
import { patientsService, ENTITY, ENTITY_DEPS } from '../../../../services';
import { getFullName } from '../../../../utils';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: '1fr 2fr 1fr 1fr',
		[theme.breakpoints.down(1000)]: {
			gridTemplateColumns: '1fr 2fr 1fr'
		},
		[theme.breakpoints.down(767)]: {
			gridTemplateColumns: '1fr'
		}
	},
	resetBtn: {
		display: 'flex',
		marginLeft: 'auto',
		[theme.breakpoints.down(1000)]: {
			margin: '0'
		}
	}
}));

export function ListDoctorPatients({ doctorUuid }) {
	const classes = useStyles();
	const queryClient = useQueryClient();
	const { form, debouncedForm, handleChange, setInForm, resetForm, setPage, getPage } = useDebouncedFilterForm({
		doctor: doctorUuid,
		birth_date: null,
		gender: '',
		search: '',
		offset: 0,
		limit: 10
	});

	const { isLoading, isError, data } = useQuery([ENTITY.PATIENT, debouncedForm], () => {
		return patientsService.getPatients(debouncedForm).then(res => res.data);
	});

	const patientGenderList = patientsService.getGenderList();

	const [selectedPatientUuid, setSelectedPatientUuid] = useState(null);

	const onUpdatePatientsList = () => {
		ENTITY_DEPS.PATIENT.forEach(dep => {
			queryClient.invalidateQueries(dep);
		});
	};

	const columns = [
		{
			name: 'medical_card',
			label: '№ карты'
		},
		{
			name: 'name',
			label: 'Ф.И.О. пациента ',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];
					return getFullName({ lastName: currentItem.last_name, firstName: currentItem.first_name });
				}
			}
		},
		{
			name: 'iin',
			label: 'ИИН'
		},
		{
			name: 'main_phone',
			label: 'Телефон'
		},
		{
			name: 'birth_date',
			label: 'Дата рождения',
			options: {
				customBodyRenderLite: dataIndex => {
					const { birth_date } = data.results[dataIndex];
					return birth_date ? moment(birth_date).format('DD.MM.YYYY') : '—';
				}
			}
		},
		{
			name: 'gender',
			label: 'Пол',
			options: {
				customBodyRenderLite: dataIndex => {
					const { gender } = data.results[dataIndex];

					return patientsService.getGenderByType(gender)?.name;
				}
			}
		},
		{
			name: 'actions',
			label: 'Действия',
			options: {
				setCellHeaderProps: () => ({ style: { textAlign: 'right' } }),
				customBodyRenderLite: dataIndex => {
					const { uuid } = data.results[dataIndex];

					return (
						<div className="flex justify-end">
							<Button
								textNormal
								variant="text"
								color="primary"
								onClick={() => setSelectedPatientUuid(uuid)}
							>
								Подробнее
							</Button>
						</div>
					);
				}
			}
		}
	];
	const tableOptions = {
		serverSide: true,
		rowsPerPage: form.limit,
		page: getPage(),
		count: data?.count ?? 0,
		onChangePage: page => setPage(page),
		onChangeRowsPerPage: limit => setInForm('limit', limit)
	};

	return (
		<>
			<Paper className="p-12 mb-32">
				<form className={`gap-10 ${classes.form}`}>
					<DatePickerField
						label="Дата рождения"
						inputVariant="outlined"
						size="small"
						onlyValid
						value={form.birth_date}
						onChange={date => setInForm('birth_date', date)}
					/>

					<TextField
						label="Поиск по Ф.И.О, карте, телефону, ИИН"
						type="text"
						variant="outlined"
						size="small"
						name="search"
						fullWidth
						value={form.search}
						onChange={handleChange}
					/>

					<TextField
						variant="outlined"
						label="Пол"
						size="small"
						select
						name="gender"
						value={form.gender}
						onChange={handleChange}
					>
						<MenuItem value="">Все</MenuItem>
						{patientGenderList.map(item => (
							<MenuItem key={item.type} value={item.type}>
								{item.name}
							</MenuItem>
						))}
					</TextField>

					<div className={classes.resetBtn}>
						<Button textNormal color="primary" variant="outlined" onClick={() => resetForm()}>
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

			{selectedPatientUuid && (
				<ModalPatient
					isOpen
					patientsUuid={selectedPatientUuid}
					onClose={() => setSelectedPatientUuid(null)}
					onUpdate={onUpdatePatientsList}
				/>
			)}
		</>
	);
}
ListDoctorPatients.propTypes = {
	doctorUuid: PropTypes.string.isRequired
};
