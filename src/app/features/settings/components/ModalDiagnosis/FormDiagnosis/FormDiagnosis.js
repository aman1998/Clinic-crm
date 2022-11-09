import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles, Paper, Tab, Tabs, Typography, withStyles } from '@material-ui/core';
import { useMutation, useQueryClient } from 'react-query';
import { Controller, useForm } from 'react-hook-form';
import { ENTITY_DEPS, treatmentService } from 'app/services';
import { useAlert } from 'app/hooks';
import { TableServices } from './TableServices';
import { TableMedications } from './TableMedications';
import { Button, TextField } from '../../../../../bizKITUi';

const CLINIC = 'clinic';
const HOME = 'home';

const defaultValues = {
	name: '',
	start_date: ''
};
// test
const useStyles = makeStyles(theme => ({
	tabsPaper: {
		width: 'fit-content',
		marginBottom: 32,
		boxShadow: 'none'
	},
	button: {
		marginTop: 16,
		width: 200
	}
}));

export const StyledTab = withStyles({
	root: {
		fontSize: '14px',
		fontWeight: 'normal',
		textTransform: 'none'
	}
})(Tab);

export function FormDiagnosis({ readOnly, diagnosisUuid, initialValues }) {
	const [listServices, setListServices] = useState([]);
	const [listMedications, setListMedications] = useState([]);

	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	const [currentStatus, setCurrentStatus] = useState(CLINIC);
	const classes = useStyles();

	const { control, errors, clearErrors, getValues, setError } = useForm({
		mode: 'onBlur',
		defaultValues: { ...defaultValues, ...initialValues }
	});

	useEffect(() => {
		if (initialValues) {
			setListMedications(initialValues.medicaments);
			setListServices(initialValues.services);
		}
	}, [initialValues]);

	const createTreatmentTemplate = useMutation(data => treatmentService.createTreatmentTemplate(data));
	const handleOnCreateTreatmentTemplate = event => {
		event.preventDefault();
		clearErrors();
		const values = {
			name: getValues().name,
			services: listServices.map(item => {
				return {
					...item,
					service: item.service.uuid
				};
			}),
			medicaments: listMedications,
			organisation: '683adc27-8780-4d25-9a14-84dff40a6e09'
		};

		createTreatmentTemplate
			.mutateAsync(values)
			.then(() => {
				ENTITY_DEPS.TREATMENTS_TEMPLATE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Новый диагноз успешно создан');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать диагноз');
			});
	};

	const editTreatmentTemplate = useMutation(({ data, uuid }) => treatmentService.editTreatmentTemplate(data, uuid));
	const handleOnEditTreatmentTemplate = event => {
		event.preventDefault();
		clearErrors();
		const values = {
			name: getValues().name,
			services: listServices.map(item => {
				return {
					...item,
					service: item.service.uuid
				};
			}),
			medicaments: listMedications,
			organisation: '683adc27-8780-4d25-9a14-84dff40a6e09'
		};

		editTreatmentTemplate
			.mutateAsync({ data: values, uuid: diagnosisUuid })
			.then(() => {
				ENTITY_DEPS.TREATMENTS_TEMPLATE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Диагноз успешно изменен');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось изменить диагноз');
			});
	};

	return (
		<div>
			<form>
				<Controller
					as={<TextField />}
					control={control}
					fullWidth
					label="Наименование"
					variant="outlined"
					name="name"
					className="mb-32"
					error={!!errors.name}
					helperText={errors.name?.message}
				/>
				<div className="flex justify-between">
					<Typography color="secondary" variant="subtitle1" className="font-bold">
						Назначение лечение
					</Typography>
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
						<TableServices
							readOnly={readOnly}
							initialList={listServices}
							isEdit={false}
							onChange={setListServices}
						/>
					) : (
						<TableMedications
							readOnly={readOnly}
							initialList={listMedications}
							isEdit={false}
							onChange={setListMedications}
						/>
					)}
				</div>
				{!diagnosisUuid ? (
					<Button
						textNormal
						className={classes.button}
						disabled={createTreatmentTemplate.isLoading}
						onClick={handleOnCreateTreatmentTemplate}
					>
						Сохранить
					</Button>
				) : (
					<Button
						textNormal
						className={classes.button}
						disabled={editTreatmentTemplate.isLoading}
						onClick={handleOnEditTreatmentTemplate}
					>
						Изменить
					</Button>
				)}
			</form>
		</div>
	);
}

FormDiagnosis.defaultProps = {
	readOnly: false,
	diagnosisUuid: null,
	initialValues: null
};

FormDiagnosis.propTypes = {
	readOnly: PropTypes.bool,
	diagnosisUuid: PropTypes.string,
	initialValues: PropTypes.shape({
		name: PropTypes.string,
		medicaments: PropTypes.arrayOf,
		services: PropTypes.arrayOf
	})
};
