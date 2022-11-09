import React from 'react';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from 'react-query';
import moment from 'moment';
import clsx from 'clsx';
import { useHistory } from 'react-router';
import { TextField, DataTable, Button, DatePickerField, Autocomplete, MenuItem } from '../../../../bizKITUi';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { useDebouncedFilterForm } from '../../../../hooks';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { BlockReceptionStatus } from '../../../../common/BlockReceptionStatus';
import { useSearchClinicService } from '../../../../common/hooks/useSearchClinicService';
import { ModalReceptionInfo } from '../../../../common/ModalReceptionInfo';
import { ModalHospitalReception } from '../../../../common/ModalHospitalReception';
import { ModalLaboratoryReception } from '../../../../common/ModalLaboratoryReception';
import { numberFormat, getFullName } from '../../../../utils';
import { employeesService, clinicService, ENTITY, operationService } from '../../../../services';
import { STATUS_RECEPTION_APPOINTED } from '../../../../services/clinic/constants';
import {
	OPERATION_STATUS_COMPLETED,
	OPERATION_STATUS_CANCELED,
	OPERATION_STATUS_IN_PROGRESS,
	OPERATION_STATUS_WAITING
} from '../../../../services/operation/constants';
import {
	EMPLOYEES_BASE_TYPE_STATIONARY_RECEPTION,
	EMPLOYEES_BASE_TYPE_LABORATORY_RECEPTION,
	EMPLOYEES_BASE_TYPE_RECEPTION,
	EMPLOYEES_BASE_TYPE_OPERATION
} from '../../../../services/employees/constants';
import { OptionPatient } from '../../../../common/OptionPatient';
import { useSearchPatient } from '../../../../common/hooks/useSearchPatient';
import { ModalCommonReception } from '../../../../common/ModalCommonReception';
import { modalPromise } from '../../../../common/ModalPromise';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
	},
	resetBtn: {
		display: 'flex',
		marginLeft: 'auto',
		[theme.breakpoints.down(1399)]: {
			margin: '0'
		}
	}
}));

const defaultValues = {
	date: new Date(),
	patient: null,
	service: null,
	status: '',
	offset: 0,
	limit: 10
};

export function ListDoctorReceptions({ doctorUuid }) {
	const classes = useStyles();
	const history = useHistory();

	const { form, debouncedForm, handleChange, setInForm, resetForm, setPage, getPage } = useDebouncedFilterForm(
		defaultValues
	);

	const { isLoading, isError, data } = useQuery([ENTITY.DOCTOR_RECEPTIONS, doctorUuid, debouncedForm], () => {
		return employeesService
			.getDoctorReceptions(doctorUuid, {
				...debouncedForm,
				service: debouncedForm.service?.uuid,
				patient: debouncedForm.patient?.uuid
			})
			.then(res => res.data);
	});

	const {
		status: statusSearchClinicService,
		actions: actionsSearchClinicService,
		data: dataSearchClinicService
	} = useSearchClinicService();

	const { status: statusSearchPatient, actions: actionsSearchPatient, data: dataSearchPatient } = useSearchPatient();

	const receptionsStatus = clinicService.getReceptionsStatus();

	const handleOnResetFilter = () => {
		resetForm();
	};

	const columns = [
		{
			name: 'type',
			label: 'Дата',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];

					return moment(currentItem.date_time).format('DD.MM.YYYY');
				}
			}
		},
		{
			name: 'time',
			label: 'Время',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];

					return currentItem.base_type === EMPLOYEES_BASE_TYPE_RECEPTION ||
						currentItem.base_type === EMPLOYEES_BASE_TYPE_OPERATION
						? moment(currentItem.date_time).format('HH:mm')
						: '—';
				}
			}
		},
		{
			name: 'patient',
			label: 'Пациент',
			options: {
				customBodyRenderLite: dataIndex => {
					const { patient } = data.results[dataIndex];

					return getFullName(patient);
				}
			}
		},
		{
			name: 'service',
			label: 'Услуга',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];

					return {
						[EMPLOYEES_BASE_TYPE_RECEPTION]: currentItem.service?.name ?? '',
						[EMPLOYEES_BASE_TYPE_OPERATION]: currentItem.service?.name ?? '',
						[EMPLOYEES_BASE_TYPE_STATIONARY_RECEPTION]: 'Прием стационара',
						[EMPLOYEES_BASE_TYPE_LABORATORY_RECEPTION]: 'Прием лаборатории',
						[undefined]: currentItem.service?.name ?? ''
					}[currentItem.base_type];
				}
			}
		},
		{
			name: 'cost',
			label: 'Стоимость ₸',
			options: {
				customBodyRenderLite: dataIndex => {
					const { cost } = data.results[dataIndex];

					return numberFormat.currency(cost);
				}
			}
		},
		{
			name: 'status',
			label: 'Статус',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];

					switch (currentItem.base_type) {
						case EMPLOYEES_BASE_TYPE_OPERATION:
							return (
								<div
									className={clsx({
										'text-success': currentItem.status === OPERATION_STATUS_COMPLETED,
										'text-error': currentItem.status === OPERATION_STATUS_CANCELED,
										'text-primary': currentItem.status === OPERATION_STATUS_IN_PROGRESS,
										'text-black': currentItem.status === OPERATION_STATUS_WAITING
									})}
								>
									{operationService.getOperationStatus(currentItem.status)?.name}
								</div>
							);
						default:
							return <BlockReceptionStatus status={currentItem.status} />;
					}
				}
			}
		}
	];
	const tableOptions = {
		serverSide: true,
		rowsPerPage: form.limit,
		page: getPage(),
		count: data?.count ?? 0,
		onRowClick: (_, rowMeta) => {
			const currentItem = data.results[rowMeta.dataIndex];

			switch (true) {
				case currentItem.base_type === EMPLOYEES_BASE_TYPE_STATIONARY_RECEPTION:
					modalPromise.open(({ onClose }) => (
						<ModalHospitalReception isOpen hospitalReceptionUuid={currentItem.uuid} onClose={onClose} />
					));
					break;
				case currentItem.base_type === EMPLOYEES_BASE_TYPE_LABORATORY_RECEPTION:
					modalPromise.open(({ onClose }) => (
						<ModalLaboratoryReception isOpen laboratoryReceptionUuid={currentItem.uuid} onClose={onClose} />
					));
					break;
				case currentItem.base_type === EMPLOYEES_BASE_TYPE_OPERATION:
					modalPromise.open(({ onClose }) => (
						<ModalCommonReception isOpen operationUuid={currentItem.uuid} onClose={onClose} />
					));
					break;
				case currentItem.base_type === EMPLOYEES_BASE_TYPE_RECEPTION &&
					currentItem.status === STATUS_RECEPTION_APPOINTED:
					modalPromise.open(({ onClose }) => (
						<ModalReceptionInfo isOpen receptionUuid={currentItem.uuid} onClose={onClose} />
					));
					break;
				case currentItem.base_type === EMPLOYEES_BASE_TYPE_RECEPTION:
					// doctorUuid might be useless
					history.push(`${doctorUuid}/reception/${currentItem.uuid}`);
					break;
				default:
					modalPromise.open(({ onClose }) => (
						<ModalCommonReception isOpen commonReceptionUuid={currentItem.uuid} onClose={onClose} />
					));
			}
		},
		onChangePage: page => setPage(page),
		onChangeRowsPerPage: limit => setInForm('limit', limit)
	};

	data?.results.sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime());

	return (
		<>
			<Paper className="p-12 mb-32">
				<form className={`gap-10 ${classes.form}`}>
					<DatePickerField
						label="Дата приема"
						inputVariant="outlined"
						size="small"
						onlyValid
						value={form.date}
						onChange={date => setInForm('date', date)}
					/>

					<Autocomplete
						className={classes.itemFilter}
						isLoading={statusSearchPatient.isLoading}
						options={dataSearchPatient.listPatient}
						getOptionLabel={option => option && getFullName(option)}
						filterOptions={options => options}
						getOptionSelected={(option, value) => option.uuid === value.uuid}
						onChange={(_, value) => setInForm('patient', value)}
						onOpen={() => actionsSearchPatient.update(dataSearchPatient.keyword)}
						onInputChange={(_, newValue) => actionsSearchPatient.update(newValue)}
						fullWidth
						value={form.patient}
						renderOption={option => <OptionPatient patient={option} />}
						renderInput={params => (
							<TextField {...params} label="Пациент" size="small" variant="outlined" />
						)}
					/>

					<Autocomplete
						isLoading={statusSearchClinicService.isLoading}
						options={dataSearchClinicService.listServices}
						getOptionLabel={option => option?.name}
						filterOptions={options => options}
						getOptionSelected={(option, value) => option.uuid === value?.uuid}
						onChange={(_, value) => setInForm('service', value)}
						onOpen={() =>
							actionsSearchClinicService.update(dataSearchClinicService.keyword, {
								doctor: form.doctor
							})
						}
						onInputChange={(_, newValue) =>
							actionsSearchClinicService.update(newValue, {
								doctor: form.doctor
							})
						}
						value={form.service}
						fullWidth
						className={classes.itemFilter}
						renderInput={params => <TextField {...params} label="Услуга" size="small" variant="outlined" />}
					/>

					<TextField
						select
						label="Статус"
						variant="outlined"
						size="small"
						fullWidth
						className={classes.itemFilter}
						name="status"
						value={form.status}
						onChange={handleChange}
					>
						<MenuItem value="">Все</MenuItem>
						{receptionsStatus.map(item => (
							<MenuItem key={item.type} value={item.type}>
								{item.name}
							</MenuItem>
						))}
					</TextField>

					<div className={classes.resetBtn}>
						<Button textNormal color="primary" variant="outlined" onClick={handleOnResetFilter}>
							Сбросить
						</Button>
					</div>
				</form>
			</Paper>

			{isError ? (
				<ErrorMessage />
			) : isLoading ? (
				<FuseLoading />
			) : (
				<DataTable data={data.results} columns={columns} options={tableOptions} />
			)}
		</>
	);
}
ListDoctorReceptions.propTypes = {
	doctorUuid: PropTypes.string.isRequired
};
