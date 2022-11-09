import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import moment from 'moment';
import { Paper, Tabs, Tab } from '@material-ui/core';
import clsx from 'clsx';
import {
	Button,
	DataTable,
	DatePickerField,
	DialogSimpleTemplate,
	ServerAutocomplete,
	TextField
} from '../../../../bizKITUi';
import { useDebouncedFilterForm } from '../../../../hooks';
import { TASK_END_FAILURE, TASK_STATUS_DONE, TASK_STATUS_PLAN } from '../../../../services/tasks/constants';
import { authService, ENTITY, receptionsCommonService, tasksService } from '../../../../services';
import { getFullName } from '../../../../utils';
import { modalPromise } from '../../../../common/ModalPromise';
import { ModalTask } from '../../../../common/ModalTask';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';

function ColorStatus({ history, children }) {
	const isError = history.some(({ type }) => type === TASK_END_FAILURE);

	return <div className={clsx({ 'text-error': isError })}>{children}</div>;
}
ColorStatus.propTypes = {
	history: PropTypes.arrayOf(
		PropTypes.shape({
			type: PropTypes.string
		}).isRequired
	).isRequired,
	children: PropTypes.node.isRequired
};

export function ModalPatientTasks({ isOpen, patientUuid, onClose }) {
	const [status, setStatus] = useState(TASK_STATUS_PLAN);
	const { form, debouncedForm, handleChange, getPage, setPage, resetForm, setInForm } = useDebouncedFilterForm({
		search: '',
		created_at_after: null,
		assignee: null,
		patient: patientUuid,
		reception: null,
		limit: 10,
		offset: 0
	});

	const { isLoading, isError, data: tasksData } = useQuery(
		[ENTITY.TASK, { ...debouncedForm, status }],
		({ queryKey }) => tasksService.getTasks(queryKey[1])
	);

	const columns = [
		{
			name: 'name',
			label: 'Наименование',
			options: {
				customBodyRenderLite: dataIndex => {
					const { name, history } = tasksData.results[dataIndex];

					return <ColorStatus history={history}>{name}</ColorStatus>;
				}
			}
		},
		{
			name: 'plan_end_at',
			label: 'Дата завершения',
			options: {
				customBodyRenderLite: dataIndex => {
					const { plan_end_at, history } = tasksData.results[dataIndex];

					return (
						<ColorStatus history={history}>
							{plan_end_at ? moment(plan_end_at).format('DD.MM.YYYY HH:mm') : '—'}
						</ColorStatus>
					);
				}
			}
		},
		{
			name: 'assignee',
			label: 'Исполнитель',
			options: {
				customBodyRenderLite: dataIndex => {
					const { assignee, history } = tasksData.results[dataIndex];

					return <ColorStatus history={history}>{getFullName(assignee)}</ColorStatus>;
				}
			}
		},
		{
			name: 'reception',
			label: 'Прием',
			options: {
				customBodyRenderLite: dataIndex => {
					const { reception, history } = tasksData.results[dataIndex];
					const receptionName = receptionsCommonService.getReceptionName({
						baseType: reception?.base_type,
						serviceName: reception?.service_name,
						doctor: reception?.doctor
					});

					return <ColorStatus history={history}>{receptionName || '—'}</ColorStatus>;
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
			modalPromise.open(({ onClose: onCloseModal }) => (
				<ModalTask isOpen onClose={onCloseModal} taskUuid={tasksData.results[rowMeta.dataIndex].uuid} />
			));
		},
		onChangePage: page => setPage(page),
		onChangeRowsPerPage: limit => setInForm('limit', limit)
	};

	return (
		<DialogSimpleTemplate
			isOpen={isOpen}
			header={<>Задачи пациента</>}
			fullScreen={false}
			maxWidth="lg"
			fullWidth
			onClose={onClose}
		>
			<>
				<Tabs
					value={status}
					textColor="primary"
					indicatorColor="primary"
					className="mb-20"
					onChange={(_, newStatus) => setStatus(newStatus)}
				>
					<Tab label="Текущие задачи" value={TASK_STATUS_PLAN} />
					<Tab label="Завершенные задачи" value={TASK_STATUS_DONE} />
				</Tabs>

				<Paper className="p-12 mb-32">
					<form className="grid grid-cols-5 gap-16">
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
							label="Дата завершения"
							inputVariant="outlined"
							size="small"
							onlyValid
							value={form.created_at_after}
							onChange={date => setInForm('created_at_after', date)}
						/>
						<ServerAutocomplete
							value={form.assignee}
							label="Исполнитель"
							name="assignee"
							fullWidth
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
							fullWidth
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
							onFetchItem={uuid =>
								receptionsCommonService.getReceptionByUuid(uuid).then(({ data }) => data)
							}
							onFetchList={service_name =>
								receptionsCommonService
									.getReceptions({ limit: 10, patient_uuid: patientUuid, service_name })
									.then(({ data }) => data)
							}
							onChange={value => {
								setInForm('reception', value?.uuid ?? null);
							}}
						/>

						<div className="ml-auto">
							<Button
								textNormal
								type="reset"
								color="primary"
								variant="outlined"
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
					<DataTable data={tasksData.results} columns={columns} options={tableOptions} />
				)}
			</>
		</DialogSimpleTemplate>
	);
}
ModalPatientTasks.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	patientUuid: PropTypes.string.isRequired,
	onClose: PropTypes.func.isRequired
};
