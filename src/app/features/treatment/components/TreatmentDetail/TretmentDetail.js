import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { makeStyles, Paper, Tabs, Typography } from '@material-ui/core';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Controller, useForm } from 'react-hook-form';
import { employeesService, ENTITY_DEPS, patientsService, treatmentService } from 'app/services';
import { OptionPatient } from 'app/common/OptionPatient';
import { TableServices } from '../TableServices';
import { TableMedications } from '../TableMedications';
import { DatePickerField, TextField, BoxTemplate, Button, ServerAutocomplete } from '../../../../bizKITUi';
import { defaults, getFullName } from '../../../../utils';
import { Comments } from '../../../../common/Comments';
import { useAlert } from '../../../../hooks';
import { StyledTab } from '../Tabs';

const CLINIC = 'clinic';
const HOME = 'home';

const defaultValues = {
	name: '',
	start_date: null,
	finish_date: null,
	patient: null,
	doctor: null
};

const useStyles = makeStyles(theme => ({
	tabsPaper: {
		width: 'fit-content',
		marginBottom: 32,
		boxShadow: 'none'
	},
	button: {
		width: 200
	}
}));

export function TretmentDetail() {
	const [listServices, setListServices] = useState([]);
	const [listMedications, setListMedications] = useState([]);

	const queryClient = useQueryClient();

	const { treatmentUuid } = useParams();
	const { alertSuccess, alertError } = useAlert();

	const [currentStatus, setCurrentStatus] = useState(CLINIC);
	const classes = useStyles();

	const { control, errors, reset, clearErrors, getValues } = useForm({
		mode: 'onBlur',
		defaultValues
	});

	const updateTreatment = useMutation(({ uuid, payload }) => treatmentService.updateTreatment(uuid, payload));
	const handleOnUpdateTreatment = () => {
		clearErrors();

		const values = {
			name: getValues().name
		};

		updateTreatment
			.mutateAsync({ uuid: treatmentUuid, payload: values })
			.then(() => {
				alertSuccess('Лечение успешно изменено');
				ENTITY_DEPS.TREATMENTS.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
			})
			.catch(() => {
				alertError('Лечение не обновлено');
			});
	};

	const updateTreatmentAdditional = useMutation(({ uuid, payload }) =>
		treatmentService.updateTreatmentAdditional(uuid, payload)
	);
	const handleOnUpdateTreatmentAdditional = () => {
		clearErrors();

		const newListServices = listServices.map(item => {
			const newItem = { days: item.days, service: item.service.uuid, count: item.count };
			return newItem;
		});

		const newListMedicaments = listMedications.map(item => {
			const newItem = { days: item.days, medicament: item.medicament, instruction: item.instruction };
			return newItem;
		});

		const values = {
			medicaments: newListMedicaments,
			services: newListServices
		};

		updateTreatmentAdditional
			.mutateAsync({ uuid: treatmentUuid, payload: values })
			.then(() => {
				alertSuccess('Лечение успешно изменено');
				ENTITY_DEPS.TREATMENTS.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
			})
			.catch(() => {
				alertError('Лечение не обновлено');
			});
	};

	const { data: treatment } = useQuery([ENTITY_DEPS.TREATMENTS, treatmentUuid], () =>
		treatmentService.getTreatmentByUuid(treatmentUuid).then(({ data }) => {
			setListServices(data?.services);
			setListMedications(data?.medicaments);
			return data;
		})
	);

	useEffect(() => {
		if (!treatment) {
			return;
		}
		reset(
			defaults(
				{
					...treatment,
					patient: treatment?.patient_info,
					doctor: treatment?.doctor_info
				},
				defaultValues
			)
		);
	}, [reset, treatment]);

	return (
		<BoxTemplate
			height="730px"
			header={
				<Typography color="secondary" className="flex items-center text-xl font-bold mr-20 whitespace-no-wrap">
					Информация о лечении
				</Typography>
			}
			leftContent={
				<div>
					<form>
						<Controller
							control={control}
							name="name"
							label="Диагноз"
							variant="outlined"
							className="mb-16"
							fullWidth
							as={<TextField />}
							error={!!errors.name}
							helperText={errors.name?.message}
						/>
						<Controller
							control={control}
							name="doctor"
							render={({ onChange, ...props }) => (
								<ServerAutocomplete
									{...props}
									getOptionLabel={option => getFullName(option)}
									label="Врач"
									className="mb-16"
									readOnly
									InputProps={{
										error: !!errors.doctor,
										helperText: errors.doctor?.message
									}}
									onChange={value => onChange(value?.uuid ?? null)}
									onFetchList={search =>
										employeesService
											.getDoctors({
												search,
												limit: 10
											})
											.then(res => res.data.results)
									}
									onFetchItem={fetchUuid =>
										employeesService.getDoctor(fetchUuid).then(res => res.data)
									}
								/>
							)}
						/>
						<Controller
							control={control}
							name="patient"
							render={({ onChange, ...props }) => (
								<ServerAutocomplete
									{...props}
									getOptionLabel={option => getFullName(option)}
									renderOption={option => <OptionPatient patient={option} />}
									label="Пациент"
									className="mb-16"
									fullWidth
									readOnly
									InputProps={{
										error: !!errors.patient,
										helperText: errors.patient?.message
									}}
									onFetchList={search =>
										patientsService
											.getPatients({
												search,
												limit: 10
											})
											.then(({ data: response }) => response.results)
									}
									onFetchItem={uuid => patientsService.getPatientByUuid(uuid).then(res => res.data)}
									onChange={value => onChange(value?.uuid ?? null)}
								/>
							)}
						/>
						<div className="flex gap-10">
							<Controller
								control={control}
								name="start_date"
								className="mb-16"
								as={
									<DatePickerField
										label="Дата начала"
										fullWidth
										margin="none"
										variant="outlined"
										readOnly
										error={!!errors.start_date}
										helperText={errors.start_date?.message}
									/>
								}
							/>
							<Controller
								control={control}
								name="finish_date"
								as={
									<DatePickerField
										label="Дата окончания"
										fullWidth
										margin="none"
										variant="outlined"
										readOnly
										error={!!errors.start_date}
										helperText={errors.start_date?.message}
									/>
								}
							/>
						</div>
						<div className="flex justify-between mt-32">
							<Typography color="secondary" variant="subtitle1" className="font-bold">
								Назначение лечение
							</Typography>
							<Button
								textNormal
								variant="text"
								onClick={handleOnUpdateTreatmentAdditional}
								disabled={updateTreatmentAdditional.isLoading}
							>
								Сохранить
							</Button>
						</div>
						<Paper className={classes.tabsPaper}>
							<Tabs
								value={currentStatus}
								onChange={(_, value) => setCurrentStatus(value)}
								indicatorColor="primary"
								textColor="primary"
							>
								<StyledTab label="Стационарное" value={CLINIC} />
								<StyledTab label="На дому" value={HOME} />
							</Tabs>
						</Paper>
						<div className="mt-20">
							{currentStatus === CLINIC ? (
								<TableServices initialList={listServices} onChange={setListServices} />
							) : (
								<TableMedications
									initialList={listMedications}
									isEdit={false}
									onChange={setListMedications}
								/>
							)}
						</div>
					</form>
				</div>
			}
			rightContent={<Comments />}
			footer={
				<div className="flex justify-end w-full cursor-pointer">
					<Button color="primary" disabled={updateTreatment.isLoading} onClick={handleOnUpdateTreatment}>
						Изменить лечение
					</Button>
				</div>
			}
		/>
	);
}
