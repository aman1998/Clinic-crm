import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Grid } from '@material-ui/core';
import { Controller, useFormContext } from 'react-hook-form';
import { getFullName } from '../../utils';
import { authService, operationService, patientsService, receptionsCommonService } from '../../services';
import { TextField, ServerAutocomplete, DateTimePickerField } from '../../bizKITUi';

export function FormTask({ readOnlyFields }) {
	const { setValue, control, errors, watch } = useFormContext();

	const patientUuid = watch('patient');

	return (
		<>
			<Grid container spacing={2}>
				<Grid item md={12} xs={12}>
					<Controller
						control={control}
						name="name"
						as={<TextField />}
						label="Наименование задачи"
						variant="outlined"
						fullWidth
						error={!!errors.name}
						helperText={errors.name?.message}
						InputProps={{
							readOnly: readOnlyFields.name
						}}
					/>
				</Grid>
				<Grid item md={12} xs={12}>
					<Controller
						control={control}
						name="text"
						as={<TextField />}
						multiline
						label="Описание"
						variant="outlined"
						rows={4}
						fullWidth
						error={!!errors.text}
						helperText={errors.text?.message}
						InputProps={{
							readOnly: readOnlyFields.text
						}}
					/>
				</Grid>
				<Grid item md={6} xs={12}>
					<Controller
						as={<DateTimePickerField />}
						control={control}
						fullWidth
						label="Дата завершения"
						name="plan_end_at"
						variant="inline"
						onlyValid
						readOnly={readOnlyFields.plan_end_at}
						error={!!errors.plan_end_at}
						helperText={errors.plan_end_at?.message}
					/>
				</Grid>

				<Grid item md={6} xs={12}>
					<Controller
						as={ServerAutocomplete}
						control={control}
						name="assignee"
						readOnly={readOnlyFields.assignee}
						label="Исполнитель"
						fullWidth
						InputProps={{
							error: !!errors.assignee,
							helperText: errors.assignee?.message
						}}
						getOptionLabel={option => getFullName(option)}
						onFetchList={(search, limit) => authService.getUsers({ search, limit })}
						onFetchItem={uuid => authService.getUser(uuid).then(({ data }) => data)}
					/>
				</Grid>
				<Grid item md={6} xs={12}>
					<Controller
						control={control}
						name="patient"
						render={({ onChange, ...props }) => (
							<ServerAutocomplete
								{...props}
								readOnly={readOnlyFields.patient}
								label="Пациент"
								fullWidth
								InputProps={{
									error: !!errors.patient,
									helperText: errors.patient?.message
								}}
								getOptionLabel={option => getFullName(option)}
								onFetchList={(search, limit) =>
									patientsService.getPatients({ search, limit }).then(({ data }) => data)
								}
								onFetchItem={uuid =>
									patientsService.getPatientByUuid(uuid).then(({ data: patientData }) => patientData)
								}
								onChange={value => {
									setValue('reception', null);
									onChange(value);
								}}
							/>
						)}
					/>
				</Grid>
				<Grid item md={6} xs={12}>
					{readOnlyFields.stage ? (
						<Controller
							as={ServerAutocomplete}
							control={control}
							name="stage"
							readOnly={readOnlyFields.stage}
							label="Операция"
							fullWidth
							InputProps={{
								error: !!errors.stage,
								helperText: errors.stage?.message
							}}
							getOptionLabel={option =>
								`${option.operation.service.name} — ${moment(option.date_time).format('DD.MM.YYYY')}`
							}
							renderOption={option =>
								`${option.operation.service.name} — ${moment(option.date_time).format('DD.MM.YYYY')}`
							}
							onFetchItem={uuid => operationService.getOperationCreatedStage(uuid)}
							onFetchList={() => {}}
						/>
					) : (
						<Controller
							as={ServerAutocomplete}
							control={control}
							name="reception"
							readOnly={readOnlyFields.reception}
							label="Прием"
							fullWidth
							InputProps={{
								error: !!errors.reception,
								helperText: errors.reception?.message
							}}
							getOptionLabel={option =>
								`${receptionsCommonService.getReceptionName({
									baseType: option.base_type,
									serviceName: option.service_name,
									doctor: option.doctor
								})} — ${moment(option.date_time).format('DD.MM.YYYY')}`
							}
							renderOption={option =>
								`${receptionsCommonService.getReceptionName({
									baseType: option.base_type,
									serviceName: option.service_name,
									doctor: option.doctor
								})} — ${moment(option.date_time).format('DD.MM.YYYY')}`
							}
							onFetchItem={uuid =>
								receptionsCommonService
									.getReceptionByUuid(uuid)
									.then(({ data: receptionData }) => receptionData)
							}
							onFetchList={service_name =>
								receptionsCommonService
									.getReceptions({
										limit: 10,
										patient_uuid: patientUuid.uuid,
										service_name
									})
									.then(({ data }) => data)
							}
						/>
					)}
				</Grid>
			</Grid>
		</>
	);
}

FormTask.defaultProps = {
	readOnlyFields: null
};
FormTask.propTypes = {
	readOnlyFields: PropTypes.shape({
		name: PropTypes.bool,
		text: PropTypes.bool,
		plan_end_at: PropTypes.bool,
		assignee: PropTypes.bool,
		patient: PropTypes.bool,
		reception: PropTypes.bool,
		stage: PropTypes.bool
	})
};
