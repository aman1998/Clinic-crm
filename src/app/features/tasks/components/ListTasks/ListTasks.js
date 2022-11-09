import React, { useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { Paper, makeStyles } from '@material-ui/core';
import moment from 'moment';
import { useDebouncedFilterForm } from '../../../../hooks';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { TextField, DataTable, Button, DatePickerField, ServerAutocomplete } from '../../../../bizKITUi';
import { ENTITY, authService, tasksService, patientsService, receptionsCommonService } from '../../../../services';
import { TASK_STATUS_PLAN, TASK_STATUS_DONE } from '../../../../services/tasks/constants';
import { getFullName } from '../../../../utils';
import { ContextMenu } from '../../pages/Tasks';
import { ModalTask } from '../../../../common/ModalTask';
import { modalPromise } from '../../../../common/ModalPromise';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
		[theme.breakpoints.down(767)]: {
			gridTemplateColumns: '1fr'
		}
	},
	addBtn: {
		height: 40,
		width: 160,
		marginLeft: 16
	}
}));

export function ListTasks({ onlyCompletedTasks }) {
	const classes = useStyles();

	const { form, debouncedForm, handleChange, getPage, setPage, resetForm, setInForm } = useDebouncedFilterForm({
		search: '',
		created_at_before: null,
		created_at_after: null,
		assignee: null,
		patient: null,
		reception: null,
		status: onlyCompletedTasks ? TASK_STATUS_DONE : TASK_STATUS_PLAN,
		limit: 10,
		offset: 0
	});

	const { isLoading, isError, data: tasksData } = useQuery([ENTITY.TASK, debouncedForm], ({ queryKey }) =>
		tasksService.getTasks(queryKey[1])
	);

	const setMenu = useContext(ContextMenu);
	useEffect(() => {
		setMenu(
			<Button
				className={classes.addBtn}
				textNormal
				onClick={() => {
					modalPromise.open(({ onClose }) => <ModalTask isOpen onClose={onClose} />);
				}}
			>
				Добавить задачу
			</Button>
		);
		return () => setMenu(null);
	}, [setMenu, classes.addBtn]);

	const columns = [
		{
			name: 'name',
			label: 'Наименование'
		},
		{
			name: 'created_at',
			label: 'Дата создания',
			options: {
				customBodyRenderLite: dataIndex => {
					const { created_at } = tasksData.results[dataIndex];

					return moment(created_at).format('DD.MM.YYYY HH:mm');
				}
			}
		},
		{
			name: 'plan_end_at',
			label: 'Дата завершения',
			options: {
				customBodyRenderLite: dataIndex => {
					const { plan_end_at } = tasksData.results[dataIndex];

					return plan_end_at ? moment(plan_end_at).format('DD.MM.YYYY HH:mm') : '—';
				}
			}
		},
		{
			name: 'assignee',
			label: 'Исполнитель',
			options: {
				customBodyRenderLite: dataIndex => {
					const { assignee } = tasksData.results[dataIndex];

					return getFullName(assignee);
				}
			}
		},
		{
			name: 'patient',
			label: 'Пациент',
			options: {
				customBodyRenderLite: dataIndex => {
					const { patient } = tasksData.results[dataIndex];

					return patient ? getFullName(patient) : '';
				}
			}
		},
		{
			name: 'reception',
			label: 'Прием',
			options: {
				customBodyRenderLite: dataIndex => {
					const { reception } = tasksData.results[dataIndex];

					return receptionsCommonService.getReceptionName({
						baseType: reception?.base_type,
						serviceName: reception?.service_name,
						doctor: reception?.doctor
					});
				}
			}
		},
		{
			name: 'actions',
			label: 'Действия',
			options: {
				setCellHeaderProps: () => ({ style: { textAlign: 'right' } }),
				customBodyRenderLite: () => {
					return (
						<div className="flex justify-end">
							<Button textNormal variant="text" color="primary">
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
		count: tasksData?.count ?? 0,
		onRowClick: (_, rowMeta) => {
			modalPromise.open(({ onClose }) => (
				<ModalTask isOpen onClose={onClose} taskUuid={tasksData.results[rowMeta.dataIndex].uuid} />
			));
		},
		onChangePage: page => setPage(page),
		onChangeRowsPerPage: limit => setInForm('limit', limit)
	};

	return (
		<>
			<Paper className="p-12 mb-32">
				<form className={`gap-10 ${classes.form}`}>
					<TextField
						label="Поиск по наименованию"
						type="text"
						variant="outlined"
						size="small"
						name="search"
						fullWidth
						value={form.search}
						onChange={handleChange}
					/>
					<DatePickerField
						label="Период от"
						inputVariant="outlined"
						size="small"
						onlyValid
						value={form.created_at_after}
						onChange={date => setInForm('created_at_after', date)}
					/>
					<DatePickerField
						label="Период до"
						inputVariant="outlined"
						size="small"
						onlyValid
						value={form.created_at_before}
						onChange={date => setInForm('created_at_before', date)}
					/>
					<ServerAutocomplete
						value={form.assignee}
						label="Исполнитель"
						name="assignee"
						fullWidth
						InputProps={{ size: 'small' }}
						getOptionLabel={option => getFullName(option)}
						onFetchList={search =>
							authService.getUsers({ limit: 10, search }).then(({ results }) => results)
						}
						onFetchItem={uuid => authService.getUser(uuid).then(({ data }) => data)}
						onChange={value => setInForm('assignee', value?.uuid ?? null)}
					/>

					<ServerAutocomplete
						value={form.patient}
						label="Пациент"
						name="patient"
						fullWidth
						InputProps={{ size: 'small' }}
						getOptionLabel={option => getFullName(option)}
						onFetchList={search =>
							patientsService.getPatients({ limit: 10, search }).then(({ data }) => data.results)
						}
						onFetchItem={uuid => patientsService.getPatientByUuid(uuid).then(({ data }) => data)}
						onChange={value => {
							setInForm('patient', value?.uuid ?? null);
							setInForm('reception', null);
						}}
					/>
					<ServerAutocomplete
						value={form.reception}
						label="Прием"
						name="reception"
						fullWidth
						readOnly={!form.patient}
						getOptionLabel={option =>
							receptionsCommonService.getReceptionName({
								baseType: option.base_type,
								serviceName: option.service_name,
								doctor: option.doctor
							})
						}
						InputProps={{ size: 'small' }}
						renderOption={option =>
							`${receptionsCommonService.getReceptionName({
								baseType: option.base_type,
								serviceName: option.service_name,
								doctor: option.doctor
							})}	 - ${moment(option.date_time).format('DD.MM.YYYY')}`
						}
						onFetchItem={uuid => receptionsCommonService.getReceptionByUuid(uuid).then(({ data }) => data)}
						onFetchList={service_name =>
							receptionsCommonService
								.getReceptions({ limit: 10, patient_uuid: form.patient, service_name })
								.then(({ data }) => data)
						}
						onChange={value => {
							setInForm('reception', value?.uuid ?? null);
						}}
					/>

					<div className="flex justify-start">
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
				<DataTable data={tasksData.results} columns={columns} options={tableOptions} />
			)}
		</>
	);
}

ListTasks.defaultProps = {
	onlyCompletedTasks: false
};

ListTasks.propTypes = {
	onlyCompletedTasks: PropTypes.bool
};
