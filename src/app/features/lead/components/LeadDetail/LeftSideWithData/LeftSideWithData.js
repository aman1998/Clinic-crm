import React, { useEffect } from 'react';
import { makeStyles, IconButton, InputAdornment } from '@material-ui/core';
import { Controller, useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { useQuery } from 'react-query';
import PropTypes from 'prop-types';
import { TextField, MenuItem, PhoneField, Button, ServerAutocomplete } from 'app/bizKITUi';
import { Delete as DeleteIcon } from '@material-ui/icons';
import { CallButton } from 'app/common/CallButton';
import { leadsServices } from 'app/services/leads';
import { authService, ENTITY, sourceHandbooksService } from 'app/services';
import { getFullName } from 'app/utils';
import { Todo } from '../../Todo';
import { STATUS } from '../../constants';

const useStyles = makeStyles(() => ({
	dayCircle: {
		backgroundColor: '#F7716E',
		borderRadius: '50%',
		marginRight: 6,
		height: 10,
		width: 10,
		display: 'inline-block'
	}
}));

const initialValues = {
	deadline: 'oneDay',
	date: 'everytime',
	source: null,
	responsible_user: null,
	contacts: [],
	status: '',
	phone_number: ''
};

export function LeftSideWithData({ setIsShowModalPatient, setModalInitialValues, isReadOnly, patientUuid }) {
	const buttonContent = patientUuid ? 'Редактировать пациента' : '+ Создать пациента';
	const classes = useStyles();
	const { stageUuid, leadUuid } = useParams();

	const { isLoading, data } = useQuery([ENTITY.LEADS_TABLE], () => leadsServices.getLeadsTable());

	// CHANGE TO GET LEAD BY ID (NOT EXIST YET)
	const currentLead = data?.find(stage => stage.uuid === stageUuid).leads?.find(lead => lead.uuid === leadUuid);
	const fullName = currentLead && getFullName(currentLead);

	const { isLoading: isLoadingData, data: sourceData } = useQuery(
		[ENTITY.SOURCE_HANDBOOK, currentLead?.source],
		() => sourceHandbooksService.getSource(currentLead?.source),
		{ enabled: !!currentLead?.source }
	);

	const { control, getValues, watch, reset, errors } = useForm({
		mode: 'onBlur',
		defaultValues: initialValues
	});
	const watchFields = watch(['contacts']);

	const addPatient = () => {
		const { first_name, last_name, middle_name, phone_number } = currentLead;
		setModalInitialValues({ first_name, last_name, middle_name, main_phone: phone_number });
		setIsShowModalPatient(true);
	};

	const handleOnDeletePhoneField = index => {
		const values = getValues();
		const contacts = watchFields.contacts.slice();
		contacts.splice(index, 1);

		reset(
			{
				...values,
				contacts
			},

			{ errors: true }
		);
	};

	const handleOnAddPhoneField = () => {
		const values = getValues();
		const contacts = values.contacts ?? [];

		reset(
			{
				...values,
				contacts: [...contacts, { number: '' }]
			},
			{ errors: true }
		);
	};

	const isAddButtonDisabed = isLoading || isLoadingData;

	useEffect(() => {
		if (currentLead || sourceData) {
			const values = getValues();
			const contacts = values.contacts ?? [];

			reset({
				...values,
				contacts: [...contacts, { number: '' }],
				responsible_user: currentLead.responsible_user,
				source: sourceData,
				status: currentLead.status
			});
		}
	}, [currentLead, sourceData, getValues, reset]);

	return (
		<div className="px-20 pt-28 sm:w-1/3 mb-24">
			<div className="text-grey-A400 mb-6">{fullName}</div>
			<form>
				<Controller
					as={<TextField className="p-0" size="small" />}
					control={control}
					className="mb-10 w-1/2"
					variant="outlined"
					name="deadline"
					fullWidth
					select
					error={!!errors?.deadline}
					helperText={errors?.deadline?.message}
				>
					<MenuItem value="oneDay">
						<span className={classes.dayCircle} /> 1 день
					</MenuItem>
				</Controller>

				{currentLead?.tasks.length > 0 && (
					<div className="sm:hidden">
						<Todo />
					</div>
				)}

				<Controller
					control={control}
					name="phone_number"
					className="mb-10"
					render={props => (
						<PhoneField
							{...props}
							label="Номер телефона"
							fullWidth
							className="mt-16"
							error={!!errors?.phone_number}
							helperText={errors?.phone_number?.message}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<CallButton phoneNumber={props.value} />
									</InputAdornment>
								)
							}}
						/>
					)}
				/>

				{watchFields.contacts.map((item, index) => (
					<div key={index} className="flex items-center mt-16">
						<Controller
							key={index}
							control={control}
							className="mb-8"
							fullWidth
							name={`contacts[${index}].number`}
							render={props => (
								<PhoneField
									{...props}
									label="Номер телефона"
									fullWidth
									error={!!errors?.contacts?.[index]?.number}
									helperText={errors?.contacts?.[index]?.number?.message}
								/>
							)}
						/>

						<IconButton
							aria-label="Удалить поле с номером телефона"
							className="ml-10"
							onClick={() => handleOnDeletePhoneField(index)}
						>
							<DeleteIcon />
						</IconButton>
					</div>
				))}

				<Button variant="text" textNormal className="mt-12" onClick={handleOnAddPhoneField}>
					+ Добавить контакт
				</Button>
				<Controller
					control={control}
					name="source"
					render={({ onChange, ...props }) => (
						<ServerAutocomplete
							{...props}
							getOptionLabel={option => option.name}
							label="Источник лида"
							className="mb-10"
							fullWidth
							readOnly={isReadOnly}
							InputProps={{
								error: !!errors.source,
								helperText: errors.source?.message
							}}
							onFetchList={name =>
								leadsServices.getSourceHandbook({
									name,
									limit: 10
								})
							}
							onChange={value => onChange(value?.uuid ?? null)}
						/>
					)}
				/>
				<Controller
					control={control}
					name="responsible_user"
					render={({ onChange, ...props }) => (
						<ServerAutocomplete
							{...props}
							getOptionLabel={option => getFullName(option)}
							readOnly={isReadOnly}
							label="Ответственный"
							className="mb-10"
							fullWidth
							InputProps={{
								error: !!errors.responsible_user,
								helperText: errors.responsible_user?.message
							}}
							onFetchList={authService.getUsers}
							// onFetchItem={uuid => leadsServices.getSourceHandbook(uuid)}
							onChange={value => onChange(value?.uuid ?? null)}
						/>
					)}
				/>
				<Controller
					as={<TextField inputProps={{ readOnly: isReadOnly }} />}
					control={control}
					label="Статус"
					variant="outlined"
					className="mb-10"
					name="status"
					fullWidth
					select
					error={!!errors?.status}
					helperText={errors?.status?.message}
				>
					{Object.entries(STATUS).map(status => (
						<MenuItem key={status[0]} value={status[0]}>
							{status[1]}
						</MenuItem>
					))}
				</Controller>

				<Button
					variant="contained"
					color="primary"
					className="py-12 px-32 mt-12 hidden sm:block"
					textNormal
					fullWidth
					disabled={isAddButtonDisabed}
					onClick={addPatient}
				>
					{buttonContent}
				</Button>
			</form>
		</div>
	);
}

LeftSideWithData.propTypes = {
	setIsShowModalPatient: PropTypes.func,
	setModalInitialValues: PropTypes.func,
	isReadOnly: PropTypes.bool,
	patientUuid: PropTypes.string
};

LeftSideWithData.defaultProps = {
	setIsShowModalPatient: () => {},
	setModalInitialValues: () => {},
	isReadOnly: false,
	patientUuid: ''
};
