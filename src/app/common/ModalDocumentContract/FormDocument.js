import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Grid, InputAdornment, Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import { TextField, ServerAutocomplete, Button, DatePickerField, PhoneField } from '../../bizKITUi';
import { patientsService } from '../../services';
import { getFullName } from '../../utils';
import { OptionPatient } from '../OptionPatient';
import { modalPromise } from '../ModalPromise';
import { ModalPatient } from '../ModalPatient';
import { CallButton } from '../CallButton';

export function FormDocument({ isReadOnly }) {
	const { control, errors, watch, setValue } = useFormContext();

	const patientField = watch('patient');

	const handleUpdatePatient = async patientUuid => {
		const { data } = await patientsService.getPatientByUuid(patientUuid);
		setValue('patient', data);
	};

	const getPatientRelativeContactList = relativeContacts => {
		return relativeContacts.map(item => `${item.name}: ${item.number}`).join(', ');
	};

	return (
		<>
			<div className=" flex justify-between mt-28">
				<Typography color="secondary" className="text-lg font-bold">
					Информация о пациенте
				</Typography>

				<Button
					onClick={() =>
						modalPromise.open(({ onClose }) => (
							<ModalPatient
								isOpen
								patientsUuid={patientField?.uuid ?? null}
								onClose={onClose}
								onUpdate={handleUpdatePatient}
							/>
						))
					}
					size="small"
					variant="text"
					className="mb-6"
					textNormal
					disabled={isReadOnly}
				>
					{patientField ? 'Редактировать пациента' : 'Создать пациента'}
				</Button>
			</div>
			<Grid container spacing={2}>
				<Grid item md={6} xs={12}>
					<Controller
						control={control}
						name="patient"
						render={({ onChange, ...props }) => (
							<ServerAutocomplete
								{...props}
								getOptionLabel={option => getFullName(option)}
								onChange={onChange}
								fullWidth
								label="Поиск по ФИО, телефону, ИИН"
								readOnly
								InputProps={{
									readOnly: true,
									error: !!errors.patient,
									helperText: errors.patient?.message
								}}
								renderOption={option => <OptionPatient patient={option} />}
								onFetchList={(search, limit) =>
									patientsService.getPatients({ search, limit }).then(res => res.data)
								}
								onFetchItem={fetchUuid =>
									patientsService.getPatientByUuid(fetchUuid).then(res => res.data)
								}
							/>
						)}
					/>
				</Grid>

				<Grid item md={6} xs={12}>
					<TextField
						label="Ф.И.О пациента"
						variant="outlined"
						fullWidth
						value={patientField ? getFullName(patientField) : ''}
						InputProps={{
							readOnly: true
						}}
					/>
				</Grid>

				<Grid item md={6} xs={12}>
					<PhoneField
						label="Номер телефона"
						variant="outlined"
						fullWidth
						value={patientsService.getPatientMainPhone(patientField)}
						InputProps={{
							readOnly: true,
							endAdornment: (
								<InputAdornment position="end">
									<CallButton phoneNumber={patientsService.getPatientMainPhone(patientField)} />
								</InputAdornment>
							)
						}}
					/>
				</Grid>

				<Grid item md={6} xs={12}>
					<TextField
						label="ИИН"
						variant="outlined"
						fullWidth
						value={patientField?.iin ?? ''}
						InputProps={{
							readOnly: true
						}}
					/>
				</Grid>

				<Grid item md={6} xs={12}>
					<DatePickerField
						label="Дата рождения"
						inputVariant="outlined"
						onlyValid
						fullWidth
						readOnly
						value={patientField?.birth_date}
					/>
				</Grid>

				<Grid item md={3} xs={12}>
					<TextField
						label="№ удостоверения"
						variant="outlined"
						fullWidth
						value={patientField?.licence_number ?? ''}
						InputProps={{
							readOnly: true
						}}
					/>
				</Grid>

				<Grid item md={3} xs={12}>
					<DatePickerField
						label="Дата выдачи"
						inputVariant="outlined"
						onlyValid
						readOnly
						fullWidth
						value={patientField?.licence_issuance_date}
					/>
				</Grid>

				<Grid item md={6} xs={12}>
					<TextField
						label="Адрес"
						variant="outlined"
						fullWidth
						value={patientField?.address ? patientsService.getPatientAddress(patientField.address) : ''}
						InputProps={{
							readOnly: true
						}}
					/>
				</Grid>

				<Grid item md={6} xs={12}>
					<TextField
						label="Контакт ближайшего родственника"
						variant="outlined"
						fullWidth
						value={
							patientField?.relative_contacts
								? getPatientRelativeContactList(patientField.relative_contacts)
								: ''
						}
						InputProps={{
							readOnly: true
						}}
					/>
				</Grid>
			</Grid>

			<Typography color="secondary" className="text-lg font-bold mt-28 mb-8">
				Информация о клинике
			</Typography>
			<Grid container spacing={2}>
				<Grid item md={6} xs={12}>
					<Controller
						as={<TextField />}
						control={control}
						name="clinic_name"
						variant="outlined"
						label="Юридическое наименование"
						fullWidth
						InputProps={{
							readOnly: true
						}}
					/>
				</Grid>
				<Grid item md={6} xs={12}>
					<Controller
						as={<TextField />}
						control={control}
						name="clinic_address"
						variant="outlined"
						label="Юридический адрес"
						fullWidth
						InputProps={{
							readOnly: true
						}}
					/>
				</Grid>
				<Grid item md={6} xs={12}>
					<Controller
						as={<TextField />}
						control={control}
						name="bin"
						variant="outlined"
						label="БИН"
						fullWidth
						InputProps={{
							readOnly: true
						}}
					/>
				</Grid>
				<Grid item md={6} xs={12}>
					<Controller
						as={<TextField />}
						control={control}
						name="bank"
						variant="outlined"
						label="Банк"
						fullWidth
						InputProps={{
							readOnly: true
						}}
					/>
				</Grid>
				<Grid item md={6} xs={12}>
					<Controller
						as={<TextField />}
						control={control}
						name="bic"
						variant="outlined"
						label="БИК"
						fullWidth
						InputProps={{
							readOnly: true
						}}
					/>
				</Grid>
				<Grid item md={6} xs={12}>
					<Controller
						as={<TextField />}
						control={control}
						name="iic"
						variant="outlined"
						label="ИИК"
						fullWidth
						InputProps={{
							readOnly: true
						}}
					/>
				</Grid>
				<Grid item md={6} xs={12}>
					<Controller
						as={<TextField />}
						control={control}
						name="head_full_name"
						variant="outlined"
						label="ФИО руководителя"
						fullWidth
						InputProps={{
							readOnly: true
						}}
					/>
				</Grid>
				<Grid item md={6} xs={12}>
					<Controller
						as={<TextField />}
						control={control}
						name="head_position"
						variant="outlined"
						label="Должность руководителя"
						fullWidth
						InputProps={{
							readOnly: true
						}}
					/>
				</Grid>
			</Grid>
		</>
	);
}

FormDocument.propTypes = {
	isReadOnly: PropTypes.bool.isRequired
};
