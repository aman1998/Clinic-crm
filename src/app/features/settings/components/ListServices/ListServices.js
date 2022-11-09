import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { IconButton, Paper } from '@material-ui/core';
import { Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { ContextMenu } from '../../pages/Settings';
import { Button, TextField, MenuItem, DataTable, ServerAutocomplete } from '../../../../bizKITUi';
import { useConfirm, useToolbarTitle, useAlert, useDebouncedFilterForm } from '../../../../hooks';
import { clinicService, companiesService, employeesService, ENTITY, ENTITY_DEPS } from '../../../../services';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { getShortName, numberFormat, getFullName } from '../../../../utils';
import { ModalClinicDirection } from '../../../../common/ModalClinicDirection';
import { ModalClinicService } from '../../../../common/ModalClinicService';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
	},
	resetBtn: {
		display: 'flex',
		marginLeft: 'auto',
		[theme.breakpoints.down(1128)]: {
			margin: '0'
		}
	}
}));
const defaultValues = {
	name: '',
	direction: '',
	doctor: null,
	partner: '',
	limit: 10,
	offset: 0
};

export function ListServices() {
	const classes = useStyles();
	const { alertSuccess, alertError } = useAlert();
	const [openModalConfirm] = useConfirm();
	const queryClient = useQueryClient();

	useToolbarTitle('Услуги');

	const [isShowModalDirections, setIsShowModalDirections] = useState(false);
	const [isShowModalService, setIsShowModalService] = useState(false);

	const setMenu = useContext(ContextMenu);
	useEffect(() => {
		setMenu(
			<div className="flex">
				<Button
					textNormal
					className="whitespace-no-wrap"
					variant="outlined"
					onClick={() => setIsShowModalDirections(true)}
				>
					Добавить направление
				</Button>
				<Button textNormal className="whitespace-no-wrap ml-10" onClick={() => setIsShowModalService(true)}>
					Добавить услугу
				</Button>
			</div>
		);
	}, [setMenu]);

	const { form, debouncedForm, handleChange, setInForm, resetForm, getPage, setPage } = useDebouncedFilterForm(
		defaultValues
	);
	const { isLoading: isLoadingServices, isError: isErrorServices, data: listServices } = useQuery(
		[ENTITY.SERVICE_NESTED, debouncedForm],
		({ queryKey }) => clinicService.getServicesNested(queryKey[1])
	);

	const { isLoading: isLoadingDirections, isError: isErrorDirections, data: listDirections } = useQuery(
		[ENTITY.DIRECTION, { limit: Number.MAX_SAFE_INTEGER }],
		({ queryKey }) => clinicService.getDirections(queryKey[1])
	);

	const { isLoading: isLoadingPartners, isError: isErrorPartners, data: listPartners } = useQuery(
		[ENTITY.PARTNER, { limit: Number.MAX_SAFE_INTEGER }],
		({ queryKey }) => companiesService.getPartnersCompanies(queryKey[1]).then(({ data }) => data)
	);

	const handleOnResetFilter = () => {
		resetForm();
	};

	const deleteService = useMutation(uuid => clinicService.removeServiceById(uuid));
	const handleOnDeleteItem = index => {
		const { uuid } = listServices.results[index];
		deleteService
			.mutateAsync(uuid)
			.then(() => {
				ENTITY_DEPS.SERVICE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Услуга успешно удалена');
			})
			.catch(() => {
				alertError('Не удалось удалить услугу');
			});
	};

	const columns = [
		{
			name: 'name',
			label: 'Наименование'
		},
		{
			name: 'direction',
			label: 'Направление',
			options: {
				customBodyRenderLite: dataIndex => {
					const { direction } = listServices.results[dataIndex];
					return direction?.name;
				}
			}
		},
		{
			name: 'doctor',
			label: 'Врач',
			options: {
				customBodyRenderLite: dataIndex => {
					const { doctor } = listServices.results[dataIndex];
					return getShortName(doctor);
				}
			}
		},
		{
			name: 'cost',
			label: 'Стоимость',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = listServices.results[dataIndex];
					return `${numberFormat.currency(currentItem?.cost)} ₸`;
				}
			}
		},
		{
			name: 'partner',
			label: 'Партнёр',
			options: {
				customBodyRenderLite: dataIndex => {
					const { partner } = listServices.results[dataIndex];
					return partner?.name ?? '—';
				}
			}
		},
		{
			name: 'duration',
			label: 'Длительность',
			options: {
				customBodyRenderLite: dataIndex => {
					const { duration } = listServices.results[dataIndex];
					return `${duration ?? '—'} минут`;
				}
			}
		},
		{
			name: 'actions',
			label: 'Действия',
			options: {
				setCellHeaderProps: () => ({ style: { textAlign: 'right' } }),
				customBodyRenderLite: dataIndex => {
					const { uuid } = listServices.results[dataIndex];
					return (
						<div className="flex justify-end">
							<IconButton
								aria-label="Редактировать услугу"
								component={Link}
								to={`/settings/service/${uuid}/edit`}
							>
								<EditIcon />
							</IconButton>
							<IconButton
								aria-label="Удалить услугу"
								onClick={() =>
									openModalConfirm({
										title: 'Удалить услугу?',
										onSuccess: () => handleOnDeleteItem(dataIndex)
									})
								}
							>
								<DeleteIcon />
							</IconButton>
						</div>
					);
				}
			}
		}
	];
	const tableOptions = {
		serverSide: true,
		rowsPerPage: form.limit,
		page: getPage(),
		count: listServices?.count ?? 0,
		onChangePage: page => setPage(page),
		onChangeRowsPerPage: limit => setInForm('limit', limit)
	};

	if (isLoadingPartners || isLoadingDirections) {
		return <FuseLoading />;
	}
	if (isErrorPartners || isErrorDirections) {
		return <ErrorMessage />;
	}
	return (
		<>
			<Paper className="p-12 mb-32">
				<form className={`gap-10 ${classes.form}`}>
					<TextField
						label="Наименование"
						size="small"
						variant="outlined"
						name="name"
						value={form.name}
						onChange={handleChange}
					/>

					<TextField
						label="Направление"
						size="small"
						variant="outlined"
						select
						name="direction"
						value={form.direction}
						onChange={handleChange}
					>
						<MenuItem value="">Все</MenuItem>
						{listDirections.results.map(item => (
							<MenuItem key={item.uuid} value={item.uuid}>
								{item.name}
							</MenuItem>
						))}
					</TextField>

					<ServerAutocomplete
						name="doctor"
						getOptionLabel={option => getFullName(option)}
						label="Врач"
						onChange={value => setInForm('doctor', value?.uuid ?? null)}
						value={form.doctor}
						InputProps={{
							className: classes.itemFilter,
							size: 'small'
						}}
						onFetchList={(search, limit) =>
							employeesService.getDoctors({ search, limit }).then(res => res.data)
						}
						onFetchItem={fetchUuid => employeesService.getDoctor(fetchUuid).then(res => res.data)}
					/>

					<TextField
						label="Партнёр"
						size="small"
						variant="outlined"
						select
						name="partner"
						value={form.partner}
						onChange={handleChange}
					>
						<MenuItem value="">Все</MenuItem>
						{listPartners.results.map(item => (
							<MenuItem key={item.uuid} value={item.uuid}>
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

			{isLoadingServices ? (
				<FuseLoading />
			) : isErrorServices ? (
				<ErrorMessage />
			) : (
				<DataTable data={listServices.results} columns={columns} options={tableOptions} />
			)}

			{isShowModalDirections && <ModalClinicDirection isOpen onClose={() => setIsShowModalDirections(false)} />}
			{isShowModalService && <ModalClinicService isOpen onClose={() => setIsShowModalService(false)} />}
		</>
	);
}
