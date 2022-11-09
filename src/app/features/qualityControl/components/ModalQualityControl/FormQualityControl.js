import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTheme } from '@material-ui/core/styles';
import { Grid, useMediaQuery } from '@material-ui/core';
import PropTypes from 'prop-types';
import { TextField, ServerAutocomplete, DatePickerField, MenuItem } from '../../../../bizKITUi';
import {
	companiesService,
	qualityControlService,
	authService,
	patientsService,
	employeesService
} from '../../../../services';
import { getFullName } from '../../../../utils';
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

const statusQualityControlList = qualityControlService.getStatusQualityControlList();
const typesQualityControlList = qualityControlService.getTypesQualityControlList();

export function FormQualityControl({ isReadOnly }) {
	const theme = useTheme();
	const isMdBreakpoint = useMediaQuery(theme.breakpoints.up('md'));
	const { control, errors, setValue, watch } = useFormContext();

	const typeField = watch('type');
	const isPartnerState = [TYPE_REVIEW_PARTNER, TYPE_COMPLIENT_PARTNER, TYPE_PROPOSAL_PARTNER].includes(typeField);
	const isDoctorState = [TYPE_REVIEW_DOCTOR, TYPE_COMPLIENT_DOCTOR, TYPE_PROPOSAL_DOCTOR].includes(typeField);
	const isPatientState = [TYPE_REVIEW_PATIENT, TYPE_COMPLIENT_PATIENT, TYPE_PROPOSAL_PATIENT].includes(typeField);

	return (
		<>
			<Grid container spacing={isMdBreakpoint ? 4 : 2}>
				<Grid item md={12} xs={12}>
					<Controller
						as={<TextField />}
						control={control}
						variant="outlined"
						label="Наименование"
						name="name"
						fullWidth
						error={!!errors.name}
						helperText={errors.name?.message}
						InputProps={{
							readOnly: isReadOnly
						}}
					/>
				</Grid>
				<Grid item md={12} xs={12}>
					<Controller
						render={({ onChange, ...props }) => (
							<TextField
								{...props}
								select
								label="Тип"
								variant="outlined"
								fullWidth
								name="type"
								error={!!errors.type}
								helperText={errors.type?.message}
								InputProps={{
									readOnly: isReadOnly
								}}
								onChange={event => {
									onChange(event);
									setValue('sender', null);
								}}
							>
								<MenuItem value="">Все</MenuItem>
								{typesQualityControlList.map(item => (
									<MenuItem key={item.type} value={item.type}>
										{item.name}
									</MenuItem>
								))}
							</TextField>
						)}
						control={control}
						name="type"
					/>
				</Grid>
				<Grid item md={12} xs={12}>
					<Controller
						as={<TextField multiline rows={6} />}
						control={control}
						variant="outlined"
						label="Описание"
						name="description"
						fullWidth
						error={!!errors.description}
						helperText={errors.description?.message}
						InputProps={{
							readOnly: isReadOnly
						}}
					/>
				</Grid>
				{isPartnerState && (
					<Grid item md={6} xs={12}>
						<Controller
							render={({ onChange, ...props }) => (
								<ServerAutocomplete
									{...props}
									getOptionLabel={option => option.name}
									onChange={onChange}
									fullWidth
									label="Отправитель"
									onFetchList={(search, limit) =>
										companiesService.getPartnersCompanies({ search, limit }).then(res => res.data)
									}
									onFetchItem={fetchUuid =>
										companiesService.getPartnerCompany(fetchUuid).then(res => res.data)
									}
									InputProps={{
										error: !!errors.sender,
										helperText: errors.sender?.message
									}}
									readOnly={isReadOnly}
								/>
							)}
							control={control}
							name="sender"
						/>
					</Grid>
				)}
				{isDoctorState && (
					<Grid item md={6} xs={12}>
						<Controller
							render={({ onChange, ...props }) => (
								<ServerAutocomplete
									{...props}
									getOptionLabel={option => getFullName(option)}
									onChange={onChange}
									fullWidth
									label="Отправитель"
									onFetchList={(search, limit) =>
										employeesService.getDoctors({ search, limit }).then(res => res.data)
									}
									onFetchItem={fetchUuid =>
										employeesService.getDoctors(fetchUuid).then(res => res.data)
									}
									InputProps={{
										error: !!errors.sender,
										helperText: errors.sender?.message
									}}
									readOnly={isReadOnly}
								/>
							)}
							control={control}
							name="sender"
						/>
					</Grid>
				)}
				{isPatientState && (
					<Grid item md={6} xs={12}>
						<Controller
							render={({ onChange, ...props }) => (
								<ServerAutocomplete
									{...props}
									getOptionLabel={option => getFullName(option)}
									onChange={onChange}
									fullWidth
									label="Отправитель"
									onFetchList={(search, limit) =>
										patientsService.getPatients({ search, limit }).then(res => res.data)
									}
									onFetchItem={fetchUuid =>
										patientsService.getPatientByUuid(fetchUuid).then(res => res.data)
									}
									InputProps={{
										error: !!errors.sender,
										helperText: errors.sender?.message
									}}
									readOnly={isReadOnly}
								/>
							)}
							control={control}
							name="sender"
						/>
					</Grid>
				)}
				{!isDoctorState && !isPartnerState && !isPatientState && (
					<Grid item md={6} xs={12}>
						<Controller
							render={({ props }) => (
								<TextField
									{...props}
									label="Отправитель"
									type="text"
									variant="outlined"
									fullWidth
									error={!!errors.sender}
									helperText={errors.sender?.message}
									InputProps={{
										readOnly: true
									}}
								/>
							)}
							name="sender"
						/>
					</Grid>
				)}
				<Grid item md={6} xs={12}>
					<Controller
						as={<DatePickerField />}
						control={control}
						fullWidth
						label="Дата обращения"
						variant="outlined"
						name="date"
						error={!!errors.date}
						helperText={errors.date?.message}
						inputVariant="outlined"
						readOnly={isReadOnly}
					/>
				</Grid>
				<Grid item md={6} xs={12}>
					<Controller
						render={({ onChange, ...props }) => (
							<ServerAutocomplete
								{...props}
								getOptionLabel={option => getFullName(option)}
								onChange={onChange}
								fullWidth
								label="Ответственный"
								onFetchList={(search, limit) => authService.getUsers({ search, limit })}
								onFetchItem={fetchUuid => authService.getUser(fetchUuid).then(res => res.data)}
								InputProps={{
									error: !!errors.responsible,
									helperText: errors.responsible?.message
								}}
								readOnly={isReadOnly}
							/>
						)}
						control={control}
						name="responsible"
					/>
				</Grid>
				<Grid item md={6} xs={12}>
					<Controller
						render={({ onChange, ...props }) => (
							<TextField
								{...props}
								select
								label="Статус"
								variant="outlined"
								fullWidth
								name="status"
								onChange={onChange}
								InputProps={{
									readOnly: isReadOnly
								}}
							>
								<MenuItem value="">Все</MenuItem>
								{statusQualityControlList.map(item => (
									<MenuItem key={item.type} value={item.type}>
										{item.name}
									</MenuItem>
								))}
							</TextField>
						)}
						control={control}
						name="status"
					/>
				</Grid>
			</Grid>
		</>
	);
}

FormQualityControl.propTypes = {
	isReadOnly: PropTypes.bool.isRequired
};
