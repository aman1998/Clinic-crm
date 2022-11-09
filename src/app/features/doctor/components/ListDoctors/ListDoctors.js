import React from 'react';
import { Link as RouteLink } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Link, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, DataTable, Button, MenuItem } from '../../../../bizKITUi';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { useDebouncedFilterForm } from '../../../../hooks';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { employeesService, clinicService, ENTITY } from '../../../../services';
import { getFullName } from '../../../../utils';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: '430px 200px 1fr',
		[theme.breakpoints.down(867)]: {
			gridTemplateColumns: '2fr 1fr'
		},
		[theme.breakpoints.down(767)]: {
			gridTemplateColumns: '1fr'
		}
	},
	resetBtn: {
		display: 'flex',
		marginLeft: 'auto',
		[theme.breakpoints.down(867)]: {
			margin: '0'
		}
	}
}));

const initialForm = {
	search: '',
	direction: '',
	offset: 0,
	limit: 10
};

export function ListDoctors() {
	const classes = useStyles();

	const { form, debouncedForm, handleChange, setInForm, resetForm, setPage, getPage } = useDebouncedFilterForm(
		initialForm
	);

	const { isLoading, isError, data } = useQuery([ENTITY.DOCTOR, debouncedForm], () => {
		return employeesService.getDoctors(debouncedForm).then(res => res.data);
	});

	const listDirectionsParams = { limit: Number.MAX_SAFE_INTEGER };

	const { data: listDirections } = useQuery([ENTITY.DIRECTION, listDirectionsParams], () =>
		clinicService.getDirections(listDirectionsParams)
	);

	const handleOnResetFilter = () => {
		resetForm();
	};

	const columns = [
		{
			name: 'name',
			label: 'Ф.И.О. врача',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];

					return getFullName({ lastName: currentItem.last_name, firstName: currentItem.first_name });
				}
			}
		},
		{
			name: 'direction',
			label: 'Направление',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];
					const limitStr = 80;
					const str = currentItem.directions.map(item => item.name).join(', ');

					return str.substring(0, limitStr) + (str.length > limitStr ? '...' : '');
				}
			}
		},
		{
			name: 'main_phone',
			label: 'Телефон'
		},
		{
			name: 'email',
			label: 'Email'
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
							<Link component={RouteLink} to={`/doctors/${uuid}`}>
								Подробнее
							</Link>
							&nbsp;
							<Link component={RouteLink} to={`/doctors/${uuid}/edit`}>
								Изменить
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
			<Paper className="p-12 mb-32">
				<form className={`gap-10 ${classes.form}`}>
					<TextField
						label="Поиск по Ф.И.О, телефону, email"
						type="text"
						variant="outlined"
						size="small"
						name="search"
						fullWidth
						value={form.search}
						onChange={handleChange}
					/>

					<TextField
						select
						label="Направление"
						variant="outlined"
						size="small"
						fullWidth
						value={form.direction}
						onChange={event => setInForm('direction', event.target.value)}
					>
						<MenuItem value="">Все</MenuItem>
						{listDirections?.results.map(item => (
							<MenuItem key={item.uuid} value={item.uuid}>
								{item.name}
							</MenuItem>
						))}
					</TextField>

					<div className={classes.resetBtn}>
						<Button textNormal color="primary" variant="outlined" onClick={handleOnResetFilter}>
							Сбросить
						</Button>
					</div>
				</form>
			</Paper>

			{isError ? (
				<ErrorMessage />
			) : isLoading ? (
				<FuseLoading />
			) : (
				<DataTable data={data.results} columns={columns} options={tableOptions} />
			)}
		</>
	);
}
