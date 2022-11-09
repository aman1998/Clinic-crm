import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { makeStyles, Paper, Tab, Tabs } from '@material-ui/core';
import moment from 'moment';
import { useDebouncedFilterForm } from '../../../../hooks';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { TextField, DataTable, Button, DatePickerField, ServerAutocomplete } from '../../../../bizKITUi';
import { ENTITY, authService, tasksService, receptionsCommonService } from '../../../../services';
import { TASK_STATUS_PLAN, TASK_STATUS_DONE } from '../../../../services/tasks/constants';
import { getFullName } from '../../../../utils';
import { ModalTask } from '../../../../common/ModalTask';
import { modalPromise } from '../../../../common/ModalPromise';
import { ContextMenu } from '../../pages/Patient';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
		[theme.breakpoints.down(767)]: {
			gridTemplateColumns: '1fr'
		}
	},
	btnReset: {
		display: 'flex',
		justifyContent: 'flex-end',
		marginLeft: 'auto',
		[theme.breakpoints.down(1279)]: {
			margin: '0',
			justifyContent: 'flex-start'
		}
	},
	tabsPaper: {
		width: 'fit-content',
		marginBottom: 32
	}
}));

export function ListPatientTasks({ patientUuid }) {
	const classes = useStyles();

	const [currentStatus, setCurrentStatus] = useState(TASK_STATUS_PLAN);

	const { form, debouncedForm, handleChange, getPage, setPage, resetForm, setInForm } = useDebouncedFilterForm({
		search: '',
		created_at_before: null,
		created_at_after: null,
		assignee: null,
		patient: patientUuid,
		reception: null,
		limit: 10,
		offset: 0
	});

	const { isLoading, isError, data: tasksData } = useQuery(
		[ENTITY.TASK, { ...debouncedForm, status: currentStatus }],
		({ queryKey }) => tasksService.getTasks(queryKey[1])
	);

	const setMenu = useContext(ContextMenu);
	useEffect(() => {
		setMenu(
			<Button
				textNormal
				className="whitespace-no-wrap ml-10"
				onClick={() =>
					modalPromise.open(({ onClose }) => (
						<ModalTask isOpen initialValues={{ patient: patientUuid }} onClose={onClose} />
					))
				}
			>
				Добавить задачу
			</Button>
		);

		return () => setMenu(null);
	}, [patientUuid, setMenu]);

	const columns = [
		{
			name: 'name',
			label: 'Наименование'
		},
		{
			name: 'plan_end_at',
			label: 'Дата завершения',
			options: {
				customBodyRenderLite: dataIndex => {
					const { plan_end_at } = tasksData.results[dataIndex];

					return plan_end_at ? moment(plan_end_at).format('DD.MM.YYYY HH:mm') : '';
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
			<Paper className={classes.tabsPaper}>
				<Tabs
					value={currentStatus}
					onChange={(_, value) => setCurrentStatus(value)}
					indicatorColor="primary"
					textColor="primary"
				>
					<Tab label="Текущие задачи" value={TASK_STATUS_PLAN} />
					<Tab label="Завершенные задачи" value={TASK_STATUS_DONE} />
				</Tabs>
			</Paper>
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
						InputProps={{ size: 'small' }}
						getOptionLabel={option => getFullName(option)}
						onFetchList={(search, limit) => authService.getUsers({ search, limit })}
						onFetchItem={uuid => authService.getUser(uuid).then(({ data }) => data)}
						onChange={value => setInForm('assignee', value?.uuid ?? null)}
					/>

					<ServerAutocomplete
						value={form.reception}
						label="Прием"
						name="reception"
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
				<DataTable data={tasksData.results} columns={columns} options={tableOptions} />
			)}
		</>
	);
}

ListPatientTasks.propTypes = {
	patientUuid: PropTypes.string.isRequired
};
