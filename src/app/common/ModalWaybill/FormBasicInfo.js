import React from 'react';
import { useSelector } from 'react-redux';
import { Controller, useFormContext } from 'react-hook-form';
import PropTypes from 'prop-types';
import { Grid, MenuItem, Typography } from '@material-ui/core';
import * as globalAuthSelectors from '../../auth/store/selectors/auth';
import { TextField, ServerAutocomplete } from '../../bizKITUi';
import { authService, companiesService, patientsService, waybillsService, warehousesService } from '../../services';

import {
	WAYBILL_TYPE_ACCEPTANCE,
	WAYBILL_TYPE_EXPENSE,
	WAYBILL_TYPE_MOVING,
	WAYBILL_TYPE_WRITE_OFF
} from '../../services/waybills/constants';
import { getFullName } from '../../utils';

export function FormBasicInfo({ isEdit, isNew, onAddWriteOffReason }) {
	const { control, errors, watch } = useFormContext();
	const watchFields = watch(['type']);

	const currentUser = useSelector(globalAuthSelectors.currentUser);

	const waybillsStatusList = waybillsService.getWaybillsStatusList();
	const waybillsTypeList = waybillsService.getWaybillsTypeList();

	const typeIsAcceptance = watchFields.type === WAYBILL_TYPE_ACCEPTANCE;
	const typeIsWriteOff = watchFields.type === WAYBILL_TYPE_WRITE_OFF;
	const typeIsExpense = watchFields.type === WAYBILL_TYPE_EXPENSE;
	const typeIsMoving = watchFields.type === WAYBILL_TYPE_MOVING;

	return (
		<>
			<div>
				<Typography color="secondary" className="text-base font-bold">
					Информация о накладной
				</Typography>
				<Grid container spacing={2}>
					<Grid item md={6} xs={12}>
						<Controller
							control={control}
							name="type"
							render={({ value, onChange, onBlur }) => (
								<TextField
									label="Тип накладной"
									variant="outlined"
									fullWidth
									className="mt-16"
									select
									value={value}
									onChange={onChange}
									onBlur={onBlur}
									error={!!errors.type}
									helperText={errors.type?.message}
									InputProps={{
										readOnly: !isNew
									}}
								>
									{waybillsTypeList.map(item => (
										<MenuItem key={item.type} value={item.type}>
											{item.name}
										</MenuItem>
									))}
								</TextField>
							)}
						/>
					</Grid>

					<Grid item md={6} xs={12}>
						<Controller
							control={control}
							name="status"
							render={({ value }) => (
								<TextField
									label="Статус"
									variant="outlined"
									fullWidth
									className="mt-16"
									select
									value={value}
									error={!!errors.status}
									helperText={errors.status?.message}
									InputProps={{
										readOnly: true
									}}
								>
									<MenuItem value="">Не выбрано</MenuItem>
									{waybillsStatusList.map(item => (
										<MenuItem key={item.type} value={item.type}>
											{item.name}
										</MenuItem>
									))}
								</TextField>
							)}
						/>
					</Grid>
				</Grid>
				<Grid container spacing={2}>
					<Grid item md={6} xs={12}>
						<Controller
							control={control}
							name="responsible"
							render={({ onChange, ...props }) => (
								<ServerAutocomplete
									{...props}
									margin="normal"
									className="mt-16"
									getOptionLabel={option =>
										getFullName({
											lastName: option.last_name,
											firstName: option.first_name
										})
									}
									label="Ответственный"
									readOnly={!isEdit}
									InputProps={{
										error: !!errors.responsible,
										helperText: errors.responsible?.message
									}}
									onFetchList={(search, limit) => authService.getUsers({ search, limit })}
									onFetchItem={fetchUuid =>
										authService
											.getUser(fetchUuid || currentUser?.data?.uuid)
											.then(({ data }) => data)
									}
									onChange={newValue => onChange(newValue?.uuid ?? null)}
								/>
							)}
						/>
					</Grid>

					<Grid item md={6} xs={12}>
						<Controller
							control={control}
							name="assignee"
							render={({ onChange, ...props }) => (
								<ServerAutocomplete
									{...props}
									margin="normal"
									className="mt-16"
									getOptionLabel={option =>
										getFullName({
											lastName: option.last_name,
											firstName: option.first_name
										})
									}
									defaultUuid={isNew ? currentUser.data.uuid : null}
									label="Исполнитель"
									readOnly={isNew || !isEdit}
									InputProps={{
										error: !!errors.assignee,
										helperText: errors.assignee?.message
									}}
									onFetchList={(search, limit) => authService.getUsers({ search, limit })}
									onFetchItem={fetchUuid => authService.getUser(fetchUuid).then(({ data }) => data)}
									onChange={newValue => onChange(newValue?.uuid ?? null)}
								/>
							)}
						/>
					</Grid>
				</Grid>

				<Grid container spacing={2}>
					<Grid item md={6} xs={12}>
						{typeIsAcceptance && (
							<Controller
								control={control}
								name="sender"
								render={({ onChange, ...props }) => (
									<ServerAutocomplete
										{...props}
										margin="normal"
										className="mt-16"
										getOptionLabel={option => option.name}
										label="Отправитель"
										readOnly={!isEdit}
										InputProps={{
											error: !!errors.sender,
											helperText: errors.sender?.message
										}}
										onFetchList={(name, limit) =>
											companiesService.getCompanyProviders({ name, limit })
										}
										onFetchItem={fetchUuid =>
											companiesService.getCompanyProvider(fetchUuid).then(({ data }) => data)
										}
										onChange={newValue => onChange(newValue?.uuid ?? null)}
									/>
								)}
							/>
						)}

						{!typeIsAcceptance && (
							<Controller
								control={control}
								name="sender"
								render={({ onChange, ...props }) => (
									<ServerAutocomplete
										{...props}
										margin="normal"
										className="mt-16"
										getOptionLabel={option => option.name}
										label="Отправитель"
										readOnly={!isEdit}
										InputProps={{
											error: !!errors.sender,
											helperText: errors.sender?.message
										}}
										onFetchList={(name, limit) => warehousesService.getWarehouses({ name, limit })}
										onFetchItem={fetchUuid => warehousesService.getWarehouse(fetchUuid)}
										onChange={newValue => onChange(newValue?.uuid ?? null)}
									/>
								)}
							/>
						)}
					</Grid>

					<Grid item md={6} xs={12}>
						{(typeIsAcceptance || typeIsMoving) && (
							<Controller
								control={control}
								name="recipient"
								render={({ onChange, ...props }) => (
									<ServerAutocomplete
										{...props}
										margin="normal"
										className="mt-16"
										getOptionLabel={option => option.name}
										label="Получатель"
										readOnly={!isEdit}
										InputProps={{
											error: !!errors.recipient,
											helperText: errors.recipient?.message
										}}
										onFetchList={(name, limit) => warehousesService.getWarehouses({ name, limit })}
										onFetchItem={fetchUuid => warehousesService.getWarehouse(fetchUuid)}
										onChange={newValue => onChange(newValue?.uuid ?? null)}
									/>
								)}
							/>
						)}
						{typeIsExpense && (
							<Controller
								control={control}
								name="recipient"
								render={({ onChange, ...props }) => (
									<ServerAutocomplete
										{...props}
										margin="normal"
										className="mt-16"
										getOptionLabel={option =>
											getFullName({
												lastName: option.last_name,
												firstName: option.first_name
											})
										}
										label="Получатель"
										readOnly={!isEdit}
										InputProps={{
											error: !!errors.recipient,
											helperText: errors.recipient?.message
										}}
										onFetchList={(search, limit) =>
											patientsService.getPatients({ search, limit }).then(({ data }) => data)
										}
										onFetchItem={fetchUuid =>
											patientsService.getPatientByUuid(fetchUuid).then(({ data }) => data)
										}
										onChange={newValue => onChange(newValue?.uuid ?? null)}
									/>
								)}
							/>
						)}

						{typeIsWriteOff && (
							<Controller
								control={control}
								name="reason"
								render={({ onChange, ...props }) => (
									<ServerAutocomplete
										{...props}
										margin="normal"
										className="mt-16"
										getOptionLabel={option => option.text}
										label="Причина списания"
										readOnly={!isEdit}
										onAdd={isEdit && onAddWriteOffReason}
										InputProps={{
											error: !!errors.reason,
											helperText: errors.reason?.message
										}}
										onFetchList={(text, limit) =>
											waybillsService.getWriteOffReasons({ text, limit }).then(({ data }) => data)
										}
										onFetchItem={fetchUuid => waybillsService.getWriteOffReason(fetchUuid)}
										onChange={newValue => onChange(newValue?.uuid ?? null)}
									/>
								)}
							/>
						)}
					</Grid>
				</Grid>
			</div>
		</>
	);
}
FormBasicInfo.propTypes = {
	isEdit: PropTypes.bool.isRequired,
	isNew: PropTypes.bool.isRequired,
	onAddWriteOffReason: PropTypes.func.isRequired
};
