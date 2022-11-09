import React, { useContext, useEffect, useMemo } from 'react';
import { Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import { useHistory } from 'react-router';
import { Button, DatePickerField, TimePickerField, ServerAutocomplete } from '../../../../bizKITUi';
import { ModalAppointmentInfo } from '../../../../common/ModalAppointmentInfo';
import { ModalReceive } from '../../../../common/ModalReceive';
import { useDebouncedFilterForm } from '../../../../hooks';
import { ContextMenu } from '../../pages/Reception';
import { getFullName } from '../../../../utils';
import { TYPE_SERVICE_COMMON } from '../../../../services/clinic/constants';
import { clinicService, employeesService } from '../../../../services';
import { ChartDoctorsSchedule } from '../../../../common/ChartDoctorsSchedule';
import { modalPromise } from '../../../../common/ModalPromise';

const useStyles = makeStyles(theme => ({
	formContainer: {
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(4),
		padding: theme.spacing(2)
	},
	form: {
		display: 'grid',
		gridTemplateColumns: 'repeat(6, 1fr)',
		[theme.breakpoints.down(1500)]: {
			gridTemplateColumns: 'repeat(5, 1fr)'
		},
		[theme.breakpoints.down(1279)]: {
			gridTemplateColumns: 'repeat(4, 1fr)'
		},
		[theme.breakpoints.down(767)]: {
			gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))'
		}
	},
	resetBtn: {
		display: 'flex',
		marginLeft: 'auto',
		[theme.breakpoints.down(1500)]: {
			margin: '0'
		}
	}
}));

export function ListDoctorsSchedule() {
	const classes = useStyles();
	const history = useHistory();

	const { form, debouncedForm, resetForm, setInForm } = useDebouncedFilterForm({
		timeStart: null,
		timeEnd: null,
		dateReceipt: moment().toDate(),
		direction: null,
		doctor: null
	});

	const handleOnResetFilter = event => {
		event.preventDefault();
		resetForm();
	};

	const isPastDate = useMemo(() => {
		return !moment(form.dateReceipt).isSameOrAfter(new Date(), 'day');
	}, [form.dateReceipt]);

	const setMenu = useContext(ContextMenu);

	useEffect(() => {
		setMenu(
			<Button
				textNormal
				className="whitespace-no-wrap"
				disabled={isPastDate}
				onClick={() =>
					modalPromise.open(({ onClose }) => (
						<ModalReceive isOpen initialValues={{ dateTime: form.dateReceipt }} onClose={onClose} />
					))
				}
			>
				Добавить новый приём
			</Button>
		);
		return () => setMenu('');
	}, [form.dateReceipt, setMenu, isPastDate]);

	const handleOnSelectDateTime = value => {
		if (isPastDate) return;

		const modalReceiveInitialValues = {
			dateTime: value.dateTime,
			doctor: value.id
		};

		modalPromise.open(({ onClose }) => (
			<ModalReceive isOpen initialValues={modalReceiveInitialValues} onClose={onClose} />
		));
	};

	const handleOnClickReception = reception => {
		modalPromise.open(({ onClose }) => (
			<ModalAppointmentInfo isOpen receptionUuid={reception.uuid} onClose={onClose} />
		));
	};

	return (
		<>
			<Paper className={classes.formContainer}>
				<form className={`gap-10 ${classes.form}`}>
					<TimePickerField
						label="Время от"
						inputVariant="outlined"
						size="small"
						onlyValid
						value={form.timeStart}
						onChange={date => setInForm('timeStart', date)}
					/>

					<TimePickerField
						label="Время до"
						inputVariant="outlined"
						size="small"
						onlyValid
						value={form.timeEnd}
						onChange={date => setInForm('timeEnd', date)}
					/>

					<DatePickerField
						label="Дата приема"
						size="small"
						fullWidth
						onlyValid
						value={form.dateReceipt}
						onChange={date => setInForm('dateReceipt', date)}
					/>

					<ServerAutocomplete
						label="Направление"
						value={form.direction}
						InputProps={{
							size: 'small'
						}}
						getOptionLabel={option => option.name}
						onFetchList={(search, limit) =>
							clinicService.getDirections({
								search,
								limit,
								service_type: TYPE_SERVICE_COMMON,
								doctor: form.doctor
							})
						}
						onFetchItem={fetchUuid => clinicService.getDirectionById(fetchUuid)}
						onChange={value => setInForm('direction', value?.uuid ?? null)}
					/>

					<ServerAutocomplete
						label="Врач"
						value={form.doctor}
						InputProps={{
							size: 'small'
						}}
						getOptionLabel={option => getFullName(option)}
						onFetchList={(search, limit) =>
							employeesService
								.getDoctors({
									search,
									limit,
									direction: form.direction,
									service_type: TYPE_SERVICE_COMMON
								})
								.then(({ data }) => data)
						}
						onFetchItem={fetchUuid => employeesService.getDoctor(fetchUuid).then(({ data }) => data)}
						onChange={value => setInForm('doctor', value?.uuid ?? null)}
					/>

					<div className={classes.resetBtn}>
						<Button textNormal type="reset" variant="outlined" onClick={handleOnResetFilter}>
							Сбросить
						</Button>
					</div>
				</form>
			</Paper>

			<ChartDoctorsSchedule
				initialValues={debouncedForm}
				onChange={handleOnSelectDateTime}
				onClickReception={handleOnClickReception}
				onClickOperation={operation => history.push(`/operation/${operation.uuid}`)}
			/>
		</>
	);
}
