import React, { useContext, useEffect, useMemo } from 'react';
import { Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import { Button, DatePickerField, TimePickerField, ServerAutocomplete } from '../../../../bizKITUi';
import { ModalReceive } from '../../../../common/ModalReceive';
import { useDebouncedFilterForm } from '../../../../hooks';
import { ContextMenu } from '../../pages/Reception';
import { equipmentsService } from '../../../../services';
import { ChartEquipmentsReception } from '../ChartEquipmentsReception';
import { modalPromise } from '../../../../common/ModalPromise';
import { ModalAppointmentInfo } from '../../../../common/ModalAppointmentInfo';

const useStyles = makeStyles(theme => ({
	formContainer: {
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(4),
		padding: theme.spacing(2)
	},
	form: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))'
	}
}));

export function ListEquipments() {
	const classes = useStyles();

	const { form, debouncedForm, resetForm, setInForm } = useDebouncedFilterForm({
		timeStart: null,
		timeEnd: null,
		dateReceipt: moment().toDate(),
		equipment: null
	});

	const isPastDate = useMemo(() => {
		return !moment(form.dateReceipt).isSameOrAfter(new Date(), 'day');
	}, [form.dateReceipt]);

	const handleOnResetFilter = event => {
		event.preventDefault();
		resetForm();
	};

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

	const handleOnClickReception = reception => {
		if (isPastDate) return;

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
						onlyValid
						value={form.dateReceipt}
						onChange={date => setInForm('dateReceipt', date)}
					/>

					<ServerAutocomplete
						label="Оборудование"
						value={form.equipment}
						InputProps={{
							size: 'small'
						}}
						getOptionLabel={option => option.name}
						onFetchList={search =>
							equipmentsService.getEquipments({ search }).then(({ results }) => results)
						}
						onFetchItem={fetchUuid => equipmentsService.getEquipmentByUuid(fetchUuid)}
						onChange={value => setInForm('equipment', value?.uuid ?? null)}
					/>

					<div className="flex md:justify-end">
						<Button textNormal type="reset" variant="outlined" onClick={handleOnResetFilter}>
							Сбросить
						</Button>
					</div>
				</form>
			</Paper>

			<ChartEquipmentsReception initialValues={debouncedForm} onClickReception={handleOnClickReception} />
		</>
	);
}
