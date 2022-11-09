import React, { useContext, useEffect, useMemo } from 'react';
import { Paper, makeStyles } from '@material-ui/core';
import { useQuery } from 'react-query';
import IconButton from '@material-ui/core/IconButton';
import { Edit } from '@material-ui/icons';
import moment from 'moment';
import { ContextMenu } from '../../pages/QualityControl';
import { Button, DataTable, DatePickerField, TextField, MenuItem, ServerAutocomplete } from '../../../../bizKITUi';
import { useDebouncedFilterForm } from '../../../../hooks';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { getFullName } from '../../../../utils';
import {
	ENTITY,
	authService,
	companiesService,
	employeesService,
	patientsService,
	qualityControlService
} from '../../../../services';
import {
	TYPE_COMPLIENT_DOCTOR,
	TYPE_COMPLIENT_PARTNER,
	TYPE_COMPLIENT_PATIENT,
	TYPE_PROPOSAL_DOCTOR,
	TYPE_PROPOSAL_PARTNER,
	TYPE_PROPOSAL_PATIENT,
	TYPE_REVIEW_DOCTOR,
	TYPE_REVIEW_PARTNER,
	TYPE_REVIEW_PATIENT
} from '../../../../services/qualityControl/constants';
import { ModalQualityControl } from '../ModalQualityControl';
import { PERMISSION } from '../../../../services/auth/constants';
import { GuardCheckPermission } from '../../../../common/GuardCheckPermission';
import { modalPromise } from '../../../../common/ModalPromise';

const statusQualityControlList = qualityControlService.getStatusQualityControlList();
const typesQualityControlList = qualityControlService.getTypesQualityControlList();

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
	}
}));

export function ListQualityControl() {
	const classes = useStyles();

	const { form, debouncedForm, handleChange, setInForm, resetForm, setPage, getPage } = useDebouncedFilterForm({
		start_date: null,
		end_date: null,
		type: '',
		status: '',
		name: '',
		sender: null,
		responsible: null,
		offset: 0,
		limit: 10
	});

	const { isLoading, isError, data } = useQuery([ENTITY.QUALITY_CONTROL, debouncedForm], ({ queryKey }) =>
		qualityControlService.getQualityControls(queryKey[1])
	);

	const setMenu = useContext(ContextMenu);
	useEffect(() => {
		setMenu(
			<GuardCheckPermission permission={PERMISSION.QUALITY_CONTROL.ADD_QUALITY_CONTROL}>
				{() => (
					<Button
						textNormal
						onClick={() =>
							modalPromise.open(({ onClose }) => <ModalQualityControl isOpen onClose={onClose} />)
						}
						className="whitespace-no-wrap ml-10"
					>
						Добавить обращение
					</Button>
				)}
			</GuardCheckPermission>
		);
		return () => setMenu(null);
	}, [setMenu]);

	const columns = useMemo(
		() => [
			{
				name: '#',
				label: '№',
				options: {
					customBodyRenderLite: dataIndex => {
						return <span>{debouncedForm.offset + dataIndex + 1}</span>;
					}
				}
			},
			{
				name: 'name',
				label: 'Наименование обращения'
			},
			{
				name: 'type',
				label: 'Тип',
				options: {
					customBodyRenderLite: dataIndex => {
						const { type } = data.results[dataIndex];
						const { name } = qualityControlService.getTypeQualityControl(type);
						return name ?? type;
					}
				}
			},
			{
				name: 'date',
				label: 'Дата',
				options: {
					customBodyRenderLite: dataIndex => {
						const { date } = data.results[dataIndex];
						if (!date) {
							return null;
						}
						return moment(date).format('DD.MM.YYYY');
					}
				}
			},
			{
				name: 'responsible',
				label: 'Ответственный',
				options: {
					customBodyRenderLite: dataIndex => {
						const { responsible } = data.results[dataIndex];
						return getFullName(responsible);
					}
				}
			},
			{
				name: 'sender',
				label: 'Отправитель',
				options: {
					customBodyRenderLite: dataIndex => {
						const { type, sender } = data.results[dataIndex];
						const map = [
							TYPE_REVIEW_PATIENT,
							TYPE_REVIEW_DOCTOR,
							TYPE_COMPLIENT_PATIENT,
							TYPE_COMPLIENT_DOCTOR,
							TYPE_PROPOSAL_PATIENT,
							TYPE_PROPOSAL_DOCTOR
						];
						if (map.includes(type)) {
							return getFullName(sender);
						}
						return <span>{sender?.name}</span>;
					}
				}
			},
			{
				name: 'status',
				label: 'Статус',
				options: {
					customBodyRenderLite: dataIndex => {
						const { status } = data.results[dataIndex];
						const { name } = qualityControlService.getStatusQualityControl(status);
						return name ?? status;
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
							<GuardCheckPermission permission={PERMISSION.QUALITY_CONTROL.CHANGE_QUALITY_CONTROL}>
								{() => (
									<div className="flex justify-end">
										<IconButton>
											<Edit />
										</IconButton>
									</div>
								)}
							</GuardCheckPermission>
						);
					}
				}
			}
		],
		[data, debouncedForm.offset]
	);
	const tableOptions = useMemo(
		() => ({
			serverSide: true,
			rowsPerPage: form.limit,
			page: getPage(),
			count: data?.count ?? 0,
			onRowClick: (_, rowMeta) => {
				modalPromise.open(({ onClose }) => (
					<ModalQualityControl
						isOpen
						qualityControlUuid={data.results[rowMeta.dataIndex].uuid}
						onClose={onClose}
					/>
				));
			},
			onChangePage: page => setPage(page),
			onChangeRowsPerPage: limit => setInForm('limit', limit)
		}),
		[data, form.limit, getPage, setInForm, setPage]
	);

	const { type } = form;
	const isPartnerState = [TYPE_REVIEW_PARTNER, TYPE_COMPLIENT_PARTNER, TYPE_PROPOSAL_PARTNER].includes(type);
	const isDoctorState = [TYPE_REVIEW_DOCTOR, TYPE_COMPLIENT_DOCTOR, TYPE_PROPOSAL_DOCTOR].includes(type);
	const isPatientState = [TYPE_REVIEW_PATIENT, TYPE_COMPLIENT_PATIENT, TYPE_PROPOSAL_PATIENT].includes(type);

	return (
		<>
			<Paper className="p-12 mb-32">
				<form className={`gap-10 ${classes.form}`}>
					<TextField
						label="Наименование"
						type="text"
						variant="outlined"
						size="small"
						name="name"
						className="md:col-span-3"
						fullWidth
						value={form.name}
						onChange={handleChange}
					/>
					<TextField
						select
						label="Тип"
						variant="outlined"
						size="small"
						fullWidth
						name="type"
						value={form.type}
						onChange={event => {
							handleChange(event);
							setInForm('sender', null);
						}}
					>
						<MenuItem value="">Все</MenuItem>
						{typesQualityControlList.map(item => (
							<MenuItem key={item.type} value={item.type}>
								{item.name}
							</MenuItem>
						))}
					</TextField>
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
						{statusQualityControlList.map(item => (
							<MenuItem key={item.type} value={item.type}>
								{item.name}
							</MenuItem>
						))}
					</TextField>
					<ServerAutocomplete
						value={form.responsible}
						getOptionLabel={option => getFullName(option)}
						onChange={value => {
							setInForm('responsible', value?.uuid ?? null);
						}}
						fullWidth
						label="Ответственный"
						onFetchList={(search, limit) => authService.getUsers({ search, limit })}
						onFetchItem={fetchUuid => authService.getUser(fetchUuid).then(res => res.data)}
						InputProps={{
							size: 'small'
						}}
					/>
					{isPatientState && (
						<ServerAutocomplete
							value={form.sender}
							getOptionLabel={option => getFullName(option)}
							onChange={value => {
								setInForm('sender', value?.uuid ?? null);
							}}
							fullWidth
							label="Отправитель"
							onFetchList={(search, limit) =>
								patientsService.getPatients({ search, limit }).then(res => res.data)
							}
							onFetchItem={fetchUuid => patientsService.getPatientByUuid(fetchUuid).then(res => res.data)}
							InputProps={{
								size: 'small'
							}}
						/>
					)}
					{isPartnerState && (
						<ServerAutocomplete
							value={form.sender}
							getOptionLabel={option => option.name}
							onChange={value => {
								setInForm('sender', value?.uuid ?? null);
							}}
							fullWidth
							label="Отправитель"
							onFetchList={(search, limit) =>
								companiesService.getPartnersCompanies({ search, limit }).then(res => res.data)
							}
							onFetchItem={fetchUuid =>
								companiesService.getPartnerCompany(fetchUuid).then(res => res.data)
							}
							InputProps={{
								size: 'small'
							}}
						/>
					)}
					{isDoctorState && (
						<ServerAutocomplete
							value={form.sender}
							getOptionLabel={option => getFullName(option)}
							onChange={value => {
								setInForm('sender', value?.uuid ?? null);
							}}
							fullWidth
							label="Отправитель"
							onFetchList={(search, limit) =>
								employeesService.getDoctors({ search, limit }).then(res => res.data)
							}
							onFetchItem={fetchUuid => employeesService.getDoctors(fetchUuid).then(res => res.data)}
							InputProps={{
								size: 'small'
							}}
						/>
					)}
					{!isDoctorState && !isPartnerState && !isPatientState && (
						<TextField
							label="Отправитель"
							type="text"
							variant="outlined"
							size="small"
							name="sender"
							fullWidth
							InputProps={{
								readOnly: true
							}}
						/>
					)}
					<DatePickerField
						label="Дата начало"
						inputVariant="outlined"
						size="small"
						fullWidth
						onlyValid
						value={form.start_date}
						onChange={date => setInForm('start_date', date)}
					/>
					<DatePickerField
						label="Дата завершения"
						inputVariant="outlined"
						size="small"
						fullWidth
						onlyValid
						value={form.end_date}
						onChange={date => setInForm('end_date', date)}
					/>
					<div>
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
		</>
	);
}
