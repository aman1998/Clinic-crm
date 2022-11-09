import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { useQuery } from 'react-query';
import moment from 'moment';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import { Visibility as VisibilityIcon } from '@material-ui/icons';
import { IconButton } from '@material-ui/core';
import { DataTable, Button, DatePickerField, ServerAutocomplete, Amount } from '../../../../bizKITUi';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { useDebouncedFilterForm } from '../../../../hooks';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { ENTITY, employeesService } from '../../../../services';
import { getFullName } from '../../../../utils';
import { ModalDoctorDailyReport } from '../ModalDoctorDailyReport';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: '200px 400px 1fr',
		[theme.breakpoints.down(1000)]: {
			gridTemplateColumns: '1fr 2fr'
		},
		[theme.breakpoints.down(767)]: {
			gridTemplateColumns: '1fr'
		}
	},
	resetBtn: {
		display: 'flex',
		marginLeft: 'auto',
		[theme.breakpoints.down(1000)]: {
			margin: 0
		}
	},
	isWrong: {
		color: theme.palette.error.main
	},
	isGood: {
		color: theme.palette.success.main
	}
}));

export function ListDoctorDailyReports({ doctorUuid }) {
	const classes = useStyles();

	const { form, debouncedForm, setInForm, resetForm, setPage, getPage } = useDebouncedFilterForm({
		doctor: doctorUuid,
		date: null,
		offset: 0,
		limit: 10
	});
	const { isLoading, isError, data } = useQuery([ENTITY.DOCTOR_WORK_SHIFTS, debouncedForm], () =>
		employeesService.getDoctorWorkShifts(debouncedForm)
	);

	const [selectedReport, setSelectedReport] = useState(null);

	const columns = [
		{
			name: 'date',
			label: 'Дата',
			options: {
				customBodyRender: value => {
					return moment(value).format('DD.MM.YYYY');
				}
			}
		},
		{
			name: 'doctor',
			label: 'Врач',
			options: {
				customBodyRender: value => {
					return getFullName(value ?? {}) || '—';
				}
			}
		},
		{
			name: 'service_count',
			label: 'Кол-во услуг'
		},
		{
			name: 'total_cost',
			label: 'Общая стоимость',
			options: {
				customBodyRender: value => {
					return <Amount value={value} />;
				}
			}
		},
		{
			name: 'plan_expense',
			label: 'План расходов',
			options: {
				customBodyRender: value => {
					return <Amount value={value} />;
				}
			}
		},
		{
			name: 'fact_expense',
			label: 'Факт расходов',
			options: {
				customBodyRender: value => {
					return <Amount value={value} />;
				}
			}
		},
		{
			name: 'diff_expense',
			label: 'Отклонение',
			options: {
				customBodyRenderLite: dataIndex => {
					const current = data.results[dataIndex];
					const diff = current.plan_expense - current.fact_expense;
					return (
						<Amount
							value={diff}
							showPositiveSign
							className={clsx({ [classes.isWrong]: diff < 0, [classes.isGood]: diff > 0 })}
						/>
					);
				}
			}
		},
		{
			name: 'status',
			label: 'Статус',
			options: {
				customBodyRender: value => {
					return employeesService.getDoctorWorkShiftStatusByType(value).name;
				}
			}
		},
		{
			name: 'actions',
			label: 'Действия',
			options: {
				setCellHeaderProps: () => ({ style: { textAlign: 'right' } }),
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];

					return (
						<div className="flex justify-end">
							<IconButton
								aria-label="Открыть информацию"
								variant="text"
								onClick={() => setSelectedReport(currentItem)}
							>
								<VisibilityIcon fontSize="inherit" />
							</IconButton>
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
						label="Дата"
						inputVariant="outlined"
						size="small"
						onlyValid
						value={form.date}
						onChange={date => setInForm('date', date)}
					/>

					<ServerAutocomplete
						name="doctor"
						label="Врач"
						InputProps={{
							size: 'small'
						}}
						readOnly={!!doctorUuid}
						value={form.doctor}
						onChange={value => setInForm('doctor', value?.uuid ?? null)}
						getOptionLabel={option => getFullName(option)}
						onFetchList={(search, limit) =>
							employeesService.getDoctors({ search, limit }).then(res => res.data)
						}
						onFetchItem={fetchUuid => employeesService.getDoctor(fetchUuid).then(res => res.data)}
					/>

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

			{selectedReport && (
				<ModalDoctorDailyReport
					isOpen
					reportUuid={selectedReport.uuid}
					onClose={() => setSelectedReport(null)}
				/>
			)}
		</>
	);
}

ListDoctorDailyReports.defaultProps = {
	doctorUuid: null
};
ListDoctorDailyReports.propTypes = {
	doctorUuid: PropTypes.string
};
