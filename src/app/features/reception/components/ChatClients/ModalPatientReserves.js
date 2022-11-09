import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from 'react-query';
import moment from 'moment';
import { Box, Paper } from '@material-ui/core';
import { Button, DataTable, DatePickerField, DialogSimpleTemplate, ServerAutocomplete } from '../../../../bizKITUi';
import { useDebouncedFilterForm } from '../../../../hooks';
import { clinicService, employeesService, ENTITY } from '../../../../services';
import { getFullName, getShortName } from '../../../../utils';
import { TYPE_SERVICE_COMMON } from '../../../../services/clinic/constants';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { ModalInfoReserve } from '../ModalInfoReserve';
import { modalPromise } from '../../../../common/ModalPromise';

const useStyles = makeStyles(theme => ({
	itemFilter: {
		flex: 1,
		marginLeft: theme.spacing(2)
	},
	itemDate: {
		maxWidth: 200,
		minWidth: 200
	},
	button: {
		width: 115,
		minWidth: 115,
		marginLeft: theme.spacing(2)
	},
	formContainer: {
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(4),
		padding: theme.spacing(2)
	}
}));

export function ModalPatientReserves({ isOpen, patientUuid, onClose }) {
	const classes = useStyles();

	const { form, debouncedForm, getPage, setPage, resetForm, setInForm } = useDebouncedFilterForm({
		created_at: null,
		service: null,
		doctor: null,
		patient: patientUuid,
		offset: 0,
		limit: 10
	});

	const { isLoading, isError, data } = useQuery([ENTITY.RESERVE, debouncedForm], ({ queryKey }) =>
		clinicService.getReserves(queryKey[1]).then(res => res.data)
	);

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

					return priority ? clinicService.getPriorityNameByType(priority) : '';
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
			modalPromise.open(({ onClose: onCloseModal }) => (
				<ModalInfoReserve isOpen uuid={data.results[rowMeta.dataIndex].uuid} onClose={onCloseModal} />
			));
		},
		onChangePage: page => setPage(page),
		onChangeRowsPerPage: limit => setInForm('limit', limit)
	};

	return (
		<DialogSimpleTemplate
			isOpen={isOpen}
			header={<>Резервы пациента</>}
			fullScreen={false}
			maxWidth="lg"
			fullWidth
			onClose={onClose}
		>
			<>
				<Paper className={classes.formContainer}>
					<Box component="form" display="flex">
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

						<ServerAutocomplete
							getOptionLabel={option => getFullName(option)}
							label="Врач"
							value={form.doctor}
							className={classes.itemFilter}
							InputProps={{ size: 'small' }}
							fullWidth
							onFetchList={search =>
								employeesService
									.getDoctors({
										search,
										limit: 10,
										service_type: TYPE_SERVICE_COMMON,
										service: form.service
									})
									.then(res => res.data.results)
							}
							onFetchItem={uuid => employeesService.getDoctor(uuid).then(res => res.data)}
							onChange={value => setInForm('doctor', value?.uuid ?? null)}
						/>

						<ServerAutocomplete
							value={form.service}
							name="service"
							label="Услуга"
							className={classes.itemFilter}
							InputProps={{
								size: 'small'
							}}
							getOptionLabel={option => option.name}
							onFetchList={name =>
								clinicService
									.getServicesNested({
										name,
										type: TYPE_SERVICE_COMMON,
										doctor: form.doctor,
										limit: 10
									})
									.then(({ results }) => results)
							}
							onFetchItem={fetchUuid => clinicService.getServiceById(fetchUuid)}
							onChange={value => setInForm('service', value?.uuid ?? null)}
						/>

						<Button
							textNormal
							variant="outlined"
							className={classes.button}
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
			</>
		</DialogSimpleTemplate>
	);
}
ModalPatientReserves.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	patientUuid: PropTypes.string.isRequired,
	onClose: PropTypes.func.isRequired
};
