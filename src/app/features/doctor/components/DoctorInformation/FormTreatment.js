import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { makeStyles, Paper, Tabs, Typography } from '@material-ui/core';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Controller, useForm } from 'react-hook-form';
import { ENTITY, ENTITY_DEPS, treatmentService } from 'app/services';
import { TableServices } from 'app/features/treatment/components/TableServices';
import { TableMedications } from 'app/features/treatment/components/TableMedications';
import { useAlert } from '../../../../hooks';
import { Button, DatePickerField, ServerAutocomplete } from '../../../../bizKITUi';
import { StyledTab } from './Tabs';

const CLINIC = 'clinic';
const HOME = 'home';

const defaultValues = {
	name: null,
	start_date: null,
	manual_name: null
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

export function FormTreatment({ readOnly, commonReceptionUuid, patient, doctor }) {
	const [listServices, setListServices] = useState([]);
	const [listMedications, setListMedications] = useState([]);
	const [treatmentName, setTreatmentName] = useState(null);
	const [diagnosisUuid, setDiagnosisUuid] = useState(null);

	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	const [currentStatus, setCurrentStatus] = useState(CLINIC);
	const classes = useStyles();

	const { control, errors, getValues, setError } = useForm({
		mode: 'onBlur',
		defaultValues
	});

	const createTreatment = useMutation(data => treatmentService.createTreatment(data));
	const handleOnCreateTreatment = () => {
		const newListServices = listServices.map(item => {
			const newItem = { days: item.days, service: item.service, count: item.count };
			return newItem;
		});

		const newListMedicaments = listMedications.map(item => {
			const newItem = { days: item.days, medicament: item.medicament, instruction: item.instruction };
			return newItem;
		});

		const values = {
			start_date_stationary: getValues().start_date && moment(getValues().start_date).format('YYYY-MM-DD'),
			name: treatmentName || getValues().manual_name,
			services: newListServices.map(item => {
				return {
					...item,
					service: item.service.uuid
				};
			}),
			medicaments: newListMedicaments,
			clinic_reception: commonReceptionUuid,
			doctor_info: doctor,
			patient_info: patient,
			doctor: doctor?.uuid,
			patient: patient?.uuid
		};

		createTreatment
			.mutateAsync(values)
			.then(() => {
				ENTITY_DEPS.TREATMENTS.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Новое лечение успешно создано');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать лечение');
			});
	};

	const { refetch } = useQuery([ENTITY.TREATMENTS_TEMPLATE], () => {
		if (diagnosisUuid) {
			return treatmentService.getTreatmentTemplateByUuid(diagnosisUuid).then(({ data }) => {
				setListServices(data?.services);
				setListMedications(data?.medicaments);
			});
		}
		return Promise.resolve();
	});

	return (
		<div>
			<form>
				<Typography color="secondary" variant="subtitle1" className="font-bold mb-10 text-dark-blue">
					Назначение лечение
				</Typography>
				<div className="md:flex">
					<Controller
						control={control}
						name="name"
						render={({ onChange, ...props }) => (
							<ServerAutocomplete
								{...props}
								fullWidth
								label="Введите название диагноза или выберите из списка"
								variant="outlined"
								margin="normal"
								freeSolo
								className="mt-4 w-full md:w-2/3"
								getOptionLabel={option => option.name}
								disabled={readOnly}
								InputProps={{
									error: !!errors.name,
									helperText: errors.name?.message
								}}
								onFetchList={(search, limit) => {
									setTreatmentName(search);
									return treatmentService.getTreatmentsTemplate({
										search,
										limit
									});
								}}
								onFetchItem={uuid =>
									treatmentService.getTreatmentTemplateByUuid(uuid).then(res => res.data)
								}
								onChange={newValue => {
									onChange(newValue?.uuid ?? null);
									setTreatmentName(newValue?.name || newValue);
									setDiagnosisUuid(newValue?.uuid);
								}}
							/>
						)}
					/>
					<div className="mt-20 md:mt-0 md:w-1/3">
						<Button
							disabled={!treatmentName}
							onClick={() => refetch()}
							textNormal
							className="w-full h-full md:ml-20"
						>
							Автозаполнить
						</Button>
					</div>
				</div>
				<Controller
					control={control}
					name="start_date"
					disabled={readOnly}
					className=" mt-20 w-full md:w-1/3"
					as={
						<DatePickerField
							label="Дата начала стационарного лечения"
							fullWidth
							margin="none"
							variant="outlined"
							error={!!errors.start_date}
							helperText={errors.start_date?.message}
						/>
					}
				/>

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
						<TableServices readOnly={readOnly} initialList={listServices} onChange={setListServices} />
					) : (
						<TableMedications
							readOnly={readOnly}
							initialList={listMedications}
							isEdit={false}
							onChange={setListMedications}
						/>
					)}
				</div>
				{(listMedications.length || listServices.length) && (
					<Button
						className="mt-16"
						textNormal
						disabled={readOnly || createTreatment.isLoading}
						onClick={handleOnCreateTreatment}
					>
						Сохранить лечение
					</Button>
				)}
			</form>
		</div>
	);
}

FormTreatment.defaultProps = {
	readOnly: false,
	diagnosisUuid: null,
	commonReceptionUuid: null,
	doctor: null,
	patient: null,
	isDiagnosis: true
};

FormTreatment.propTypes = {
	readOnly: PropTypes.bool,
	diagnosisUuid: PropTypes.string,
	doctor: PropTypes.objectOf(PropTypes.object),
	patient: PropTypes.objectOf(PropTypes.object),
	commonReceptionUuid: PropTypes.string,
	isDiagnosis: PropTypes.bool
};
