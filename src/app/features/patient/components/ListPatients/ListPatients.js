import React, { useState } from 'react';
import { Link as RouteLink } from 'react-router-dom';
import { useQuery } from 'react-query';
import moment from 'moment';
import { Paper, Link } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { TextField, DataTable, Button, DatePickerField, MenuItem } from '../../../../bizKITUi';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { useToolbarTitle, useDebouncedFilterForm } from '../../../../hooks';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { ENTITY, patientsService } from '../../../../services';
import { ModalPatient } from '../../../../common/ModalPatient';
import { getFullName } from '../../../../utils';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: '200px 430px 200px 1fr',
		[theme.breakpoints.down(1100)]: {
			gridTemplateColumns: '1fr 2fr 1fr'
		},
		[theme.breakpoints.down(767)]: {
			gridTemplateColumns: '1fr'
		}
	},
	resetBtn: {
		display: 'flex',
		marginLeft: 'auto',
		[theme.breakpoints.down(1100)]: {
			margin: '0'
		}
	}
}));

export function ListPatients() {
	const classes = useStyles();
	const theme = useTheme();
	const matches = useMediaQuery(theme.breakpoints.down(768));

	const { form, debouncedForm, handleChange, getPage, setPage, resetForm, setInForm } = useDebouncedFilterForm({
		birth_date: null,
		gender: '',
		search: '',
		limit: 10,
		offset: 0
	});

	const { isLoading, isError, data, refetch } = useQuery([ENTITY.PATIENT, debouncedForm], ({ queryKey }) =>
		patientsService.getPatients(queryKey[1]).then(res => res.data)
	);

	const patientGenderList = patientsService.getGenderList();

	const [isShowModalPatient, setIsShowModalPatient] = useState(false);

	useToolbarTitle({
		name: 'Пациенты',
		content: (
			<>
				{!matches && (
					<Button textNormal onClick={() => setIsShowModalPatient(true)}>
						Добавить пациента
					</Button>
				)}
			</>
		)
	});

	const columns = [
		{
			name: 'medical_card',
			label: '№ карты',
			options: {
				customBodyRender: value => value ?? '—'
			}
		},
		{
			name: 'name',
			label: 'Ф.И.О. пациента ',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];
					return getFullName(currentItem);
				}
			}
		},
		{
			name: 'iin',
			label: 'ИИН',
			options: {
				customBodyRender: value => value ?? '—'
			}
		},
		{
			name: 'main_phone',
			label: 'Телефон',
			options: {
				customBodyRender: value => value ?? '—'
			}
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

					return patientsService.getGenderByType(gender)?.name ?? '—';
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
							<Link component={RouteLink} to={`/patients/${uuid}`}>
								Подробнее
							</Link>
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
			{matches && (
				<Button textNormal onClick={() => setIsShowModalPatient(true)} className="mb-16">
					Добавить пациента
				</Button>
			)}
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

			{isShowModalPatient && (
				<ModalPatient isOpen onClose={() => setIsShowModalPatient(false)} onUpdate={() => refetch()} />
			)}
		</>
	);
}
