import React from 'react';
import { Paper, makeStyles } from '@material-ui/core';
import { useQueries } from 'react-query';
import { Button, DatePickerField, TextField, MenuItem, ServerAutocomplete } from '../../../../bizKITUi';
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
import { StatisticsByTypeCard } from './StatisticsByTypeCard';
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
import { StatisticsByStatusCard } from './StatisticsByStatusCard';

const statusQualityControlList = qualityControlService.getStatusQualityControlList();
const typesQualityControlList = qualityControlService.getTypesQualityControlList();

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
		[theme.breakpoints.down(768)]: {
			gridTemplateColumns: 'repeat(2, 1fr)'
		},
		[theme.breakpoints.down(486)]: {
			gridTemplateColumns: '1fr'
		}
	}
}));

export function CardAnalytics() {
	const classes = useStyles();

	const { form, debouncedForm, handleChange, setInForm, resetForm } = useDebouncedFilterForm({
		start_date: null,
		end_date: null,
		type: '',
		status: '',
		name: '',
		sender: null,
		responsible: null
	});

	const [
		{ isLoading: isLoadingStatisticsByStatus, isError: isErrorStatisticsByStatus, data: statisticsByStatus },
		{ isLoading: isLoadingStatisticsByType, isError: isErrorStatisticsByType, data: statisticsByType }
	] = useQueries([
		{
			queryKey: [ENTITY.QUALITY_CONTROL_ANALYTICS_BY_STATUS, debouncedForm],
			queryFn: () => qualityControlService.getAnalyticsByStatus(debouncedForm)
		},
		{
			queryKey: [ENTITY.QUALITY_CONTROL_ANALYTICS_BY_TYPE, debouncedForm],
			queryFn: () => qualityControlService.getAnalyticsByType(debouncedForm)
		}
	]);

	const { type } = form;
	const isPartnerState = [TYPE_REVIEW_PARTNER, TYPE_COMPLIENT_PARTNER, TYPE_PROPOSAL_PARTNER].includes(type);
	const isDoctorState = [TYPE_REVIEW_DOCTOR, TYPE_COMPLIENT_DOCTOR, TYPE_PROPOSAL_DOCTOR].includes(type);
	const isPatientState = [TYPE_REVIEW_PATIENT, TYPE_COMPLIENT_PATIENT, TYPE_PROPOSAL_PATIENT].includes(type);

	const isLoading = isLoadingStatisticsByStatus || isLoadingStatisticsByType;
	const isError = isErrorStatisticsByStatus || isErrorStatisticsByType;

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
						className="col-span-1 lm1:col-span-2 sm3:col-span-3"
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
				<div className="mt-32">
					<div className="mb-32">
						<StatisticsByStatusCard
							statistics={statisticsByStatus}
							title="Статистика обращений по срокам и количеству"
						/>
					</div>
					<div className="mb-32">
						<StatisticsByTypeCard statistics={statisticsByType} title="Статистика обращений по типам" />
					</div>
				</div>
			)}
		</>
	);
}
