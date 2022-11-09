import React, { useEffect, useState } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Controller, useForm } from 'react-hook-form';
import { QueryClient, useMutation, useQuery } from 'react-query';
import Typography from '@material-ui/core/Typography';
import { ENTITY_DEPS, treatmentService } from 'app/services';
import { defaults } from 'app/utils';
import { Button, DatePickerField } from 'app/bizKITUi';
import { TextField, MenuItem } from '@material-ui/core';
import { useAlert } from '../../../../hooks';
import { CLINIC, CANCELED, TREATMENT_REFUSE } from './constants';

const defaultValues = {
	start_date: '',
	start_date_stationary: null,
	start_date_home: null,
	date: new Date(),
	comment: '',
	refuse_type: ''
};

export function OtherInformation({ treatmentUuid, currentStatus }) {
	const { alertError, alertSuccess } = useAlert();
	const [disabledButtons, setDisabledButtons] = useState({
		stationary: false,
		home: false
	});

	const { control, errors, getValues, reset } = useForm({
		mode: 'onBlur',
		defaultValues
	});

	const downloadReportTreatment = useMutation(({ treatment_uuid, params }) =>
		treatmentService.downloadTreatment(treatment_uuid, params)
	);
	const handleDownloadTreatment = () => {
		const params = { additional_type: currentStatus === CLINIC ? 'services' : 'medicaments' };

		downloadReportTreatment
			.mutateAsync({
				treatment_uuid: treatmentUuid,
				params
			})
			.catch(() => alertError('Не удалось скачать документ'));
	};

	const updateTreatment = useMutation(({ uuid, payload }) => treatmentService.updateTreatment(uuid, payload));
	const handleUpdateTreatmentRequest = values => {
		updateTreatment
			.mutateAsync({ uuid: treatmentUuid, payload: values })
			.then(() => {
				alertSuccess('Дата успешно обновлена!');
				// reset(defaultValues);
			})
			.catch(() => {
				alertError('Дата не обновлена');
			});
	};

	const createTreatmentRefuse = useMutation(({ uuid, payload }) =>
		treatmentService.createTreatmentRefuse(uuid, payload)
	);
	const handleTreatmenRefuse = values => {
		createTreatmentRefuse
			.mutateAsync({ uuid: treatmentUuid, payload: values })
			.then(() => {
				ENTITY_DEPS.TREATMENTS_REFUSE.forEach(dep => {
					QueryClient.invalidateQueries(dep);
				});
				alertSuccess('Лечение успешно отменено!');
				reset(defaultValues);
			})
			.catch(() => {
				alertError('Не удалось отменить лечение');
			});
	};

	const handleSaveRefuse = () => {
		const values = {
			date: moment(getValues().date).format('YYYY-MM-DD'),
			comment: getValues().comment,
			refuse_type: getValues().refuse_type
		};

		handleTreatmenRefuse(values);
	};

	const handleStartDate = () => {
		const valuesStationary = {
			start_date_stationary: moment(getValues().start_date_stationary).format('YYYY-MM-DD')
		};

		const valuesHome = {
			start_date_home: moment(getValues().start_date_home).format('YYYY-MM-DD')
		};

		handleUpdateTreatmentRequest(currentStatus === CLINIC ? valuesStationary : valuesHome);

		if (getValues().start_date_stationary) {
			setDisabledButtons({ ...disabledButtons, stationary: true });
		}
		if (getValues().start_date_home) {
			setDisabledButtons({ ...disabledButtons, home: true });
		}
	};

	const { data: treatment, isLoading } = useQuery(
		[ENTITY_DEPS.TREATMENTS, ENTITY_DEPS.TREATMENTS_REFUSE, treatmentUuid],
		() => treatmentService.getTreatmentByUuid(treatmentUuid).then(({ data }) => data)
	);

	useEffect(() => {
		if (!treatment) {
			return;
		}
		reset(
			defaults(
				{
					...treatment
				},
				defaultValues
			)
		);
	}, [reset, treatment]);

	return (
		<div className="grid sm:flex justify-between w-full">
			<div className="w-full">
				<Typography variant="subtitle1" color="secondary" className="mb-16">
					Дополнительная информация
				</Typography>
				{currentStatus === CLINIC ? (
					<>
						<Typography variant="subtitle2" color="secondary" className="mb-6">
							Назначить дату начала лечения в стационере
						</Typography>
						<div className="grid sm:flex">
							<Controller
								control={control}
								className="max-w-192 mr-6 mb-6 sm:mb-0"
								name="start_date_stationary"
								as={
									<DatePickerField
										fullWidth
										margin="none"
										variant="outlined"
										name="start_date_stationary"
										readOnly={!!treatment?.start_date_stationary || isLoading}
										error={!!errors.start_date_stationary}
										helperText={errors.start_date_stationary?.message}
									/>
								}
							/>
							<Button
								className="mr-10"
								disabled={
									updateTreatment.isLoading ||
									!!treatment?.start_date_stationary ||
									isLoading ||
									disabledButtons.stationary
								}
								textNormal
								onClick={handleStartDate}
							>
								Сохранить
							</Button>
						</div>
						<Typography variant="subtitle2" color="secondary" className="mb-6 mt-16">
							Отменить лечение
						</Typography>
						<div className="grid w-auto md:flex md:w-512">
							<Controller
								as={<TextField />}
								control={control}
								className="w-full md:w-3/5 mr-6 px-0 mb-6"
								fullWidth
								label="Выберите причину"
								variant="outlined"
								name="refuse_type"
								select
							>
								{TREATMENT_REFUSE.map(refuse => (
									<MenuItem key={refuse.type} value={refuse.type}>
										{refuse.text}
									</MenuItem>
								))}
							</Controller>
							<Controller
								control={control}
								name="date"
								className="w-full md:w-2/5 mb-6"
								as={
									<DatePickerField
										fullWidth
										margin="none"
										variant="outlined"
										name="date"
										error={!!errors.date}
										helperText={errors.date?.message}
									/>
								}
							/>
						</div>
						<div className="grid w-auto md:flex md:w-512">
							<Controller
								as={<TextField />}
								control={control}
								label="Комментарии"
								variant="outlined"
								className="w-full md:w-4/5 mr-16 mb-6"
								name="comment"
								error={!!errors.comment}
								helperText={errors.comment?.message}
							/>

							<Button
								className="w-2/5 md:w-1/5 self-end mb-6"
								disabled={treatment?.status_stationary === CANCELED}
								textNormal
								onClick={handleSaveRefuse}
							>
								Сохранить
							</Button>
						</div>
					</>
				) : (
					<>
						<Typography variant="subtitle2" color="secondary" className="mb-6">
							Назначить дату начала лечения на дому
						</Typography>
						<div className="flex gap-10">
							<Controller
								className="max-w-192 mr-6"
								control={control}
								name="start_date_home"
								as={
									<DatePickerField
										fullWidth
										margin="none"
										variant="outlined"
										name="start_date_home"
										readOnly={!!treatment?.start_date_home || isLoading}
										error={!!errors.start_date_home}
										helperText={errors.start_date_home?.message}
									/>
								}
							/>
							<Button
								className="mr-10"
								disabled={
									updateTreatment.isLoading ||
									!!treatment?.start_date_home ||
									isLoading ||
									disabledButtons.home
								}
								textNormal
								onClick={handleStartDate}
							>
								Сохранить
							</Button>
						</div>
					</>
				)}
			</div>
			<div className="flex">
				<Button
					customColor="primary"
					onClick={handleDownloadTreatment}
					textNormal
					className="float-right self-end"
				>
					Скачать
				</Button>
			</div>
		</div>
	);
}

OtherInformation.propTypes = {
	treatmentUuid: PropTypes.string.isRequired,
	currentStatus: PropTypes.string.isRequired
};
