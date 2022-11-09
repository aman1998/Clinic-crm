import React, { useContext, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Paper } from '@material-ui/core';
import moment from 'moment';
import { Button, DatePickerField, TextField, Autocomplete, DataTable, ServerAutocomplete } from '../../../../bizKITUi';
import { OptionPatient } from '../../../../common/OptionPatient';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { useDebouncedFilterForm } from '../../../../hooks';
import { getFullName, getShortName } from '../../../../utils';
import { useSearchPatient } from '../../../../common/hooks/useSearchPatient';
import { useSearchClinicService } from '../../../../common/hooks/useSearchClinicService';
import { clinicService, employeesService, ENTITY, patientsService } from '../../../../services';
import { ModalInfoReserve } from '../ModalInfoReserve';
import { ContextMenu } from '../../pages/Reception';
import { ModalReceive } from '../../../../common/ModalReceive';
import { ModalReserve } from '../../../../common/ModalReserve';
import { TYPE_SERVICE_COMMON } from '../../../../services/clinic/constants';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: '200px 2fr 1fr 1fr 1fr',
		[theme.breakpoints.down(1279)]: {
			gridTemplateColumns: '200px 2fr 1fr 1fr'
		},
		[theme.breakpoints.down(767)]: {
			gridTemplateColumns: '1fr'
		}
	},
	btnReset: {
		display: 'flex',
		justifyContent: 'flex-end',
		marginLeft: 'auto',
		width: 115,
		[theme.breakpoints.down(1379)]: {
			margin: '0',
			justifyContent: 'flex-start'
		}
	},
	formContainer: {
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(4),
		padding: theme.spacing(2)
	}
}));

export function ListReserves() {
	const classes = useStyles();

	const { form, debouncedForm, getPage, setPage, resetForm, setInForm } = useDebouncedFilterForm({
		created_at: null,
		patient: null,
		service: null,
		doctor: null,
		offset: 0,
		limit: 10
	});

	const { isLoading, isError, data } = useQuery([ENTITY.RESERVE, debouncedForm], ({ queryKey }) =>
		clinicService.getReserves(queryKey[1]).then(res => res.data)
	);

	const { status: statusSearchPatient, actions: actionsSearchPatient, data: dataSearchPatient } = useSearchPatient();

	const {
		status: statusSearchClinicService,
		actions: actionsSearchClinicService,
		data: dataSearchClinicService
	} = useSearchClinicService();

	const [selectedReserve, setSelectedReserve] = useState(null);
	const [isShowModalInfoReserve, setIsShowModalInfoReserve] = useState(null);
	const handleOnCloseModalReserve = () => {
		setSelectedReserve(null);
		setIsShowModalInfoReserve(false);
	};

	const columns = [
		{
			name: 'type',
			label: 'Дата обращения',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];

					return moment(currentItem.created_at).format('DD.MM.YYYY HH:mm');
				}
			}
		},
		{
			name: 'patient',
			label: 'Пациент',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];

					return getFullName({
						lastName: currentItem.patient.last_name,
						firstName: currentItem.patient.first_name
					});
				}
			}
		},
		{
			name: 'phone',
			label: 'Телефон',
			options: {
				customBodyRenderLite: dataIndex => {
					const { patient } = data.results[dataIndex];

					return patientsService.getPatientMainPhone(patient);
				}
			}
		},
		{
			name: 'doctor',
			label: 'Врач',
			options: {
				customBodyRenderLite: dataIndex => {
					const { doctor } = data.results[dataIndex].service;

					return getShortName(doctor);
				}
			}
		},
		{
			name: 'service',
			label: 'Услуга',
			options: {
				customBodyRenderLite: dataIndex => {
					const { service } = data.results[dataIndex];

					return service.name;
				}
			}
		},
		{
			name: 'comment',
			label: 'Комментарий',
			options: {
				customBodyRenderLite: dataIndex => {
					const { comment } = data.results[dataIndex];

					return comment;
				}
			}
		},
		{
			name: 'priority',
			label: 'Приоритет',
			options: {
				customBodyRenderLite: dataIndex => {
					const { priority } = data.results[dataIndex];

					if (!priority) {
						return '';
					}

					return clinicService.getPriorityNameByType(priority);
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
			setSelectedReserve(data.results[rowMeta.dataIndex]);
		},
		onChangePage: page => setPage(page),
		onChangeRowsPerPage: limit => setInForm('limit', limit)
	};

	const [isShowModalReceive, setIsShowModalReceive] = useState(false);
	const [isShowModalReserve, setIsShowModalReserve] = useState(false);

	const setMenu = useContext(ContextMenu);

	useEffect(() => {
		setMenu(
			<div className="flex">
				<Button
					textNormal
					className="whitespace-no-wrap"
					variant="outlined"
					onClick={() => setIsShowModalReserve(true)}
				>
					Добавить резерв
				</Button>
				<Button textNormal className="whitespace-no-wrap ml-10" onClick={() => setIsShowModalReceive(true)}>
					Добавить новый приём
				</Button>
			</div>
		);
		return () => setMenu(null);
	}, [setMenu]);

	return (
		<>
			<Paper className={classes.formContainer}>
				<Box component="form" className={`gap-10 ${classes.form}`}>
					<DatePickerField
						label="Дата обращения"
						inputVariant="outlined"
						size="small"
						fullWidth
						className={classes.itemDate}
						onlyValid
						value={form.created_at}
						onChange={date => setInForm('created_at', date)}
					/>

					<Autocomplete
						className={classes.itemFilter}
						isLoading={statusSearchPatient.isLoading}
						findSelectedLabel={option => option.uuid === form.patient}
						options={dataSearchPatient.listPatient}
						getOptionLabel={option => option && getFullName(option)}
						filterOptions={options => options}
						getOptionSelected={(option, value) => option.uuid === value}
						onChange={(_, value) => setInForm('patient', value?.uuid ?? null)}
						onOpen={() => actionsSearchPatient.update(dataSearchPatient.keyword)}
						onInputChange={(_, newValue) => actionsSearchPatient.update(newValue)}
						fullWidth
						value={form.patient}
						renderOption={option => <OptionPatient patient={option} />}
						renderInput={params => (
							<TextField
								{...params}
								label="Поиск по ФИО, телефону, ИИН"
								size="small"
								variant="outlined"
							/>
						)}
					/>

					<ServerAutocomplete
						getOptionLabel={option => getFullName(option)}
						label="Врач"
						value={form.doctor}
						className={classes.itemFilter}
						InputProps={{ size: 'small' }}
						fullWidth
						onChange={value => setInForm('doctor', value?.uuid ?? null)}
						onFetchList={(search, limit) =>
							employeesService
								.getDoctors({
									search,
									limit,
									service_type: TYPE_SERVICE_COMMON
								})
								.then(res => res.data)
						}
						onFetchItem={uuid => employeesService.getDoctor(uuid).then(res => res.data)}
					/>

					<Autocomplete
						className={classes.itemFilter}
						isLoading={statusSearchClinicService.isLoading}
						findSelectedLabel={option => option.uuid === form.service}
						options={dataSearchClinicService.listServices}
						getOptionLabel={option => option?.name}
						filterOptions={options => options}
						getOptionSelected={(option, value) => option.uuid === value}
						onChange={(_, value) => setInForm('service', value?.uuid ?? null)}
						onOpen={() =>
							actionsSearchClinicService.update(dataSearchClinicService.keyword, {
								type: TYPE_SERVICE_COMMON
							})
						}
						onInputChange={(_, newValue) =>
							actionsSearchClinicService.update(newValue, { type: TYPE_SERVICE_COMMON })
						}
						value={form.service}
						fullWidth
						renderInput={params => <TextField {...params} label="Услуга" size="small" variant="outlined" />}
					/>

					<Button
						textNormal
						variant="outlined"
						className={classes.btnReset}
						fullWidth
						disabled={isLoading}
						onClick={() => resetForm()}
					>
						Сбросить
					</Button>
				</Box>
			</Paper>

			{isLoading ? (
				<FuseLoading />
			) : isError ? (
				<ErrorMessage />
			) : (
				<DataTable columns={columns} options={tableOptions} data={data.results} />
			)}

			{(selectedReserve || isShowModalInfoReserve) && (
				<ModalInfoReserve isOpen uuid={selectedReserve?.uuid} onClose={handleOnCloseModalReserve} />
			)}

			{isShowModalReserve && <ModalReserve isOpen onClose={() => setIsShowModalReserve(false)} />}

			{isShowModalReceive && <ModalReceive isOpen onClose={() => setIsShowModalReceive(false)} />}
		</>
	);
}
