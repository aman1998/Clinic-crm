import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import { useQuery } from 'react-query';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import {
	TextField,
	DataTable,
	Button,
	DatePickerField,
	Autocomplete,
	MenuItem,
	ServerAutocomplete
} from '../../../../bizKITUi';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { useDebouncedFilterForm } from '../../../../hooks';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { BlockReceptionStatus } from '../../../../common/BlockReceptionStatus';
import { useSearchClinicService } from '../../../../common/hooks/useSearchClinicService';
import { clinicService, employeesService, ENTITY } from '../../../../services';
import { STATUS_RECEPTION_APPOINTED, TYPE_SERVICE_COMMON } from '../../../../services/clinic/constants';
import { ModalReceptionInfo } from '../../../../common/ModalReceptionInfo';
import { ModalCommonReception } from '../../../../common/ModalCommonReception';
import { getFullName } from '../../../../utils';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
	},
	btnReset: {
		display: 'flex',
		justifyContent: 'flex-end',
		marginLeft: 'auto',
		[theme.breakpoints.down(1128)]: {
			margin: '0',
			justifyContent: 'flex-start'
		}
	}
}));

export function ListPatientReceptions({ patientsUuid }) {
	const classes = useStyles();

	const {
		status: statusSearchClinicService,
		actions: actionsSearchClinicService,
		data: dataSearchClinicService
	} = useSearchClinicService();

	const { form, debouncedForm, handleChange, setInForm, resetForm, setPage, getPage } = useDebouncedFilterForm({
		patient_uuid: patientsUuid,
		date: null,
		doctor: null,
		service: null,
		status: '',
		offset: 0,
		limit: 10
	});

	const { isLoading, isError, data } = useQuery(
		[
			ENTITY.CLINIC_RECEPTION,
			{
				...debouncedForm,
				doctor: debouncedForm.doctor,
				service: debouncedForm.service?.uuid
			}
		],
		({ queryKey }) => {
			return clinicService.getReceptions(queryKey[1]);
		}
	);

	const receptionsStatus = clinicService.getReceptionsStatus();

	const handleOnResetFilter = () => {
		resetForm();
	};

	const [selectedReception, setSelectedReception] = useState(null);
	const [isShowModalReceptionInfo, setIsShowModalReceptionInfo] = useState(false);
	const [isShowModalCommonReception, setIsShowModalCommonReception] = useState(false);
	useEffect(() => {
		if (!selectedReception) {
			return;
		}

		if (STATUS_RECEPTION_APPOINTED === selectedReception.status) {
			setIsShowModalReceptionInfo(true);

			return;
		}

		setIsShowModalCommonReception(true);
	}, [selectedReception]);
	const handleOnCloseModals = () => {
		setIsShowModalReceptionInfo(false);
		setIsShowModalCommonReception(false);
		setSelectedReception(null);
	};

	const columns = [
		{
			name: 'reception_type',
			label: 'Тип приема',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];
					const isPastDateTime = moment(currentItem.date_time).valueOf() < moment(new Date()).valueOf();

					return isPastDateTime ? 'Прошедший' : 'Предстоящий';
				}
			}
		},
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

					return moment(currentItem.date_time).format('HH:mm');
				}
			}
		},
		{
			name: 'doctor',
			label: 'Врач',
			options: {
				customBodyRenderLite: dataIndex => {
					const {
						service: { doctor }
					} = data.results[dataIndex];

					return getFullName(doctor);
				}
			}
		},
		{
			name: 'service',
			label: 'Услуга',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];

					return currentItem.service.name;
				}
			}
		},
		{
			name: 'status',
			label: 'Статус',
			options: {
				customBodyRenderLite: dataIndex => {
					return <BlockReceptionStatus status={data.results[dataIndex].status} />;
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
			setSelectedReception(data.results[rowMeta.dataIndex]);
		},
		onChangePage: page => setPage(page),
		onChangeRowsPerPage: limit => setInForm('limit', limit)
	};

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

					<ServerAutocomplete
						getOptionLabel={option => getFullName(option)}
						label="Врач"
						value={form.doctor}
						InputProps={{ size: 'small' }}
						fullWidth
						onChange={value => setInForm('doctor', value?.uuid ?? null)}
						onFetchList={(search, limit) =>
							employeesService
								.getDoctors({
									search,
									limit,
									services: form.service?.uuid,
									service_type: TYPE_SERVICE_COMMON
								})
								.then(res => res.data)
						}
						onFetchItem={uuid => employeesService.getDoctor(uuid).then(res => res.data)}
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
								doctor: form.doctor,
								service_type: TYPE_SERVICE_COMMON
							})
						}
						onInputChange={(_, newValue) =>
							actionsSearchClinicService.update(newValue, {
								doctor: form.doctor,
								service_type: TYPE_SERVICE_COMMON
							})
						}
						value={form.service}
						fullWidth
						renderInput={params => <TextField {...params} label="Услуга" size="small" variant="outlined" />}
					/>

					<TextField
						select
						label="Статус"
						variant="outlined"
						size="small"
						fullWidth
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

					<div className={classes.btnReset}>
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

			{isShowModalReceptionInfo && (
				<ModalReceptionInfo isOpen receptionUuid={selectedReception.uuid} onClose={handleOnCloseModals} />
			)}

			{isShowModalCommonReception && (
				<ModalCommonReception
					isOpen
					commonReceptionUuid={selectedReception.uuid}
					onClose={handleOnCloseModals}
				/>
			)}
		</>
	);
}
ListPatientReceptions.propTypes = {
	patientsUuid: PropTypes.string.isRequired
};
