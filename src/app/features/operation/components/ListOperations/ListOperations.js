import React, { useMemo } from 'react';
import { useQuery } from 'react-query';
import Paper from '@material-ui/core/Paper';
import moment from 'moment';
import clsx from 'clsx';
import { Typography, makeStyles } from '@material-ui/core';
import { useHistory } from 'react-router';
import { GuardCheckPermission } from 'app/common/GuardCheckPermission';
import { PERMISSION } from 'app/services/auth/constants';
import { Button, DataTable, DateTimePickerField, ServerAutocomplete, TextField } from '../../../../bizKITUi';
import { ModalOperation } from '../../../../common/ModalOperation';
import { modalPromise } from '../../../../common/ModalPromise';
import { useDebouncedFilterForm } from '../../../../hooks';
import { employeesService, ENTITY, operationService } from '../../../../services';
import { getFullName } from '../../../../utils';
import { TYPE_SERVICE_OPERATION } from '../../../../services/clinic/constants';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import {
	OPERATION_STATUS_CANCELED,
	OPERATION_STATUS_COMPLETED,
	OPERATION_STATUS_IN_PROGRESS
} from '../../../../services/operation/constants';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: '430px 1fr 1fr 1fr 1fr 1fr',
		[theme.breakpoints.down(1700)]: {
			gridTemplateColumns: '2fr 1fr 1fr'
		},
		[theme.breakpoints.down(767)]: {
			gridTemplateColumns: '1fr'
		}
	},
	btnReset: {
		display: 'flex',
		justifyContent: 'flex-end',
		marginLeft: 'auto',
		[theme.breakpoints.down(1700)]: {
			margin: '0',
			justifyContent: 'flex-start'
		}
	}
}));

export function ListOperations() {
	const history = useHistory();
	const classes = useStyles();

	const { form, debouncedForm, setInForm, resetForm, setPage, getPage, handleChange } = useDebouncedFilterForm({
		name: '',
		date_from: null,
		date_to: null,
		doctor: null,
		stage: null,
		offset: 0,
		limit: 10
	});

	const { isLoading, isError, data: operations } = useQuery([ENTITY.OPERATION, debouncedForm], ({ queryKey }) =>
		operationService.getOperations(queryKey[1])
	);

	const handleOnResetFilter = () => {
		resetForm();
	};

	const columns = useMemo(
		() => [
			{
				name: 'date_time',
				label: 'Дата операции',
				options: {
					customBodyRender: value => {
						return value ? moment(value).format('DD.MM.YYYY') : '';
					}
				}
			},
			{
				name: 'service',
				label: 'Наименование операции',
				options: {
					customBodyRender: value => {
						return value.name;
					}
				}
			},
			{
				name: 'service',
				label: 'Врач',
				options: {
					customBodyRender: value => {
						return getFullName(value.doctor);
					}
				}
			},
			{
				name: 'patient',
				label: 'Пациент',
				options: {
					customBodyRender: value => {
						return getFullName(value);
					}
				}
			},
			{
				name: 'stage',
				label: 'Этап',
				options: {
					customBodyRender: value => {
						return value?.name;
					}
				}
			},
			{
				name: 'status',
				label: 'Статус',
				options: {
					customBodyRender: value => {
						return (
							<div
								className={clsx({
									'text-success': value === OPERATION_STATUS_COMPLETED,
									'text-error': value === OPERATION_STATUS_CANCELED,
									'text-primary': value === OPERATION_STATUS_IN_PROGRESS
								})}
							>
								{operationService.getOperationStatus(value)?.name}
							</div>
						);
					}
				}
			}
		],
		[]
	);

	const tableOptions = {
		serverSide: true,
		rowsPerPage: form.limit,
		page: getPage(),
		count: operations?.count ?? 0,
		onRowClick: (_, rowMeta) => history.push(`/operation/${operations.results[rowMeta.dataIndex].uuid}`),
		onChangePage: page => setPage(page),
		onChangeRowsPerPage: limit => setInForm('limit', limit)
	};

	return (
		<>
			<div className="flex justify-between">
				<Typography variant="h6">Список операций</Typography>
				<GuardCheckPermission permission={PERMISSION.OPERATIONS.ADD_OPERATION}>
					{() => (
						<Button
							textNormal
							onClick={() =>
								modalPromise.open(({ onClose }) => (
									<ModalOperation
										isOpen
										initialValues={{ dateTime: form.date_from }}
										onClose={onClose}
									/>
								))
							}
						>
							Создать операцию
						</Button>
					)}
				</GuardCheckPermission>
			</div>

			<Paper className="p-12 mb-32 mt-20">
				<form className={`gap-10 ${classes.form}`}>
					<TextField
						label="Поиск по операции и пацинету"
						size="small"
						name="name"
						variant="outlined"
						value={form.name}
						onChange={handleChange}
					/>

					<DateTimePickerField
						label="Дата начала"
						inputVariant="outlined"
						size="small"
						onlyValid
						value={form.date_from}
						onChange={date => setInForm('date_from', date)}
					/>

					<DateTimePickerField
						label="Дата окончания"
						inputVariant="outlined"
						size="small"
						onlyValid
						value={form.date_to}
						onChange={date => setInForm('date_to', date)}
					/>

					<ServerAutocomplete
						label="Этап"
						value={form.stage}
						InputProps={{
							size: 'small'
						}}
						getOptionLabel={option => option.name}
						onFetchList={(search, limit) =>
							operationService.getOperationStages({
								search,
								limit
							})
						}
						onFetchItem={fetchUuid => operationService.getOperationStage(fetchUuid)}
						onChange={value => setInForm('stage', value?.uuid ?? null)}
					/>

					<ServerAutocomplete
						label="Врач"
						value={form.doctor}
						InputProps={{
							size: 'small'
						}}
						getOptionLabel={option => getFullName(option)}
						onFetchList={(search, limit) =>
							employeesService
								.getDoctors({
									search,
									limit,
									service_type: TYPE_SERVICE_OPERATION
								})
								.then(({ data }) => data)
						}
						onFetchItem={fetchUuid => employeesService.getDoctor(fetchUuid).then(({ data }) => data)}
						onChange={value => setInForm('doctor', value?.uuid ?? null)}
					/>

					<div className={classes.btnReset}>
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
				<DataTable data={operations.results} columns={columns} options={tableOptions} />
			)}
		</>
	);
}
