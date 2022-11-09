import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Paper from '@material-ui/core/Paper';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { IconButton, MenuItem } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, DataTable, Button } from '../../../../bizKITUi';
import { warehousesService, authService, ENTITY, ENTITY_DEPS } from '../../../../services';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { useConfirm, useAlert, useDebouncedFilterForm } from '../../../../hooks';
import { ContextMenu } from '../../pages/Warehouse';
import { ModalWarehouse } from '../ModalWarehouse';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { getShortName, getFullName } from '../../../../utils';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: '430px 1fr 1fr',
		[theme.breakpoints.down(1279)]: {
			gridTemplateColumns: '2fr 1fr'
		},
		[theme.breakpoints.down(767)]: {
			gridTemplateColumns: '1fr'
		}
	},
	btnReset: {
		display: 'flex',
		justifyContent: 'flex-end',
		marginLeft: 'auto',
		[theme.breakpoints.down(1279)]: {
			margin: '0',
			justifyContent: 'flex-start'
		}
	}
}));

const initialValues = {
	name: '',
	responsible: '',
	limit: 10,
	offset: 0
};

export function ListWarehouses() {
	const queryClient = useQueryClient();
	const classes = useStyles();
	const { alertSuccess, alertError } = useAlert();
	const [openModalConfirm] = useConfirm();

	const { form, debouncedForm, handleChange, setPage, getPage, setInForm, resetForm } = useDebouncedFilterForm(
		initialValues
	);

	const { isLoading: isLoadingWarehouses, isError: isErrorWarehouses, data: listWarehouses } = useQuery(
		[ENTITY.WAREHOUSE, debouncedForm],
		({ queryKey }) => warehousesService.getWarehouses(queryKey[1])
	);

	const { data: listUsers } = useQuery([ENTITY.USER, { limit: Number.MAX_SAFE_INTEGER }], () =>
		authService.getUsers({ limit: Number.MAX_SAFE_INTEGER })
	);

	const handleOnResetFilter = () => {
		resetForm();
	};

	const setMenu = useContext(ContextMenu);
	useEffect(() => {
		setMenu(
			<Button textNormal className="whitespace-no-wrap ml-10" onClick={() => setIsShowModalWarehouse(true)}>
				Добавить склад
			</Button>
		);

		return () => setMenu(null);
	}, [setMenu]);

	const [isShowModalWarehouse, setIsShowModalWarehouse] = useState(false);
	const [selectedWarehouseUuid, setSelectedWarehouseUuid] = useState(null);
	const handleOnCloseModalWarehouse = () => {
		setIsShowModalWarehouse(false);
		setSelectedWarehouseUuid(null);
	};
	const handleOnUpdateWarehouse = uuid => {
		setSelectedWarehouseUuid(uuid);
		setIsShowModalWarehouse(uuid);
	};

	const deleteWarehouse = useMutation(uuid => warehousesService.deleteWarehouse(uuid));
	const handleOnDeleteWarehouse = useCallback(
		uuid => {
			deleteWarehouse
				.mutateAsync(uuid)
				.then(() => {
					ENTITY_DEPS.WAREHOUSE.forEach(dep => {
						queryClient.invalidateQueries(dep);
					});
					alertSuccess('Склад успешно удалён');
				})
				.catch(() => {
					alertError('Не удалось удалить склад');
				});
		},
		[alertError, alertSuccess, deleteWarehouse, queryClient]
	);

	const columns = useMemo(
		() => [
			{
				name: 'name',
				label: 'Наименование'
			},
			{
				name: 'responsible',
				label: 'Ответственный',
				options: {
					customBodyRenderLite: dataIndex => {
						const { responsible } = listWarehouses.results[dataIndex];

						return getShortName(responsible);
					}
				}
			},
			{
				name: 'actions',
				label: 'Действия',
				options: {
					setCellHeaderProps: () => ({ style: { textAlign: 'right' } }),
					customBodyRenderLite: dataIndex => {
						const { uuid } = listWarehouses.results[dataIndex];

						return (
							<div className="flex justify-end">
								<IconButton
									aria-label="Редактировать склад"
									disabled={deleteWarehouse.isLoading}
									onClick={() => handleOnUpdateWarehouse(uuid)}
								>
									<EditIcon />
								</IconButton>
								<IconButton
									aria-label="Удалить склад"
									disabled={deleteWarehouse.isLoading}
									onClick={() =>
										openModalConfirm({
											title: 'Удалить склад?',
											onSuccess: () => handleOnDeleteWarehouse(uuid)
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
		],
		[deleteWarehouse.isLoading, handleOnDeleteWarehouse, listWarehouses, openModalConfirm]
	);

	const tableOptions = useMemo(
		() => ({
			serverSide: true,
			rowsPerPage: form.limit,
			page: getPage(),
			count: listWarehouses?.count ?? 0,
			onChangePage: page => setPage(page),
			onChangeRowsPerPage: limit => setInForm('limit', limit)
		}),
		[form.limit, getPage, listWarehouses, setInForm, setPage]
	);

	return (
		<>
			<Paper className="p-12 mb-32">
				<form className={`gap-10 ${classes.form}`}>
					<TextField
						label="Наименование"
						type="text"
						variant="outlined"
						size="small"
						name="name"
						value={form.name}
						onChange={handleChange}
					/>

					<TextField
						size="small"
						label="Ответственный"
						variant="outlined"
						fullWidth
						select
						name="responsible"
						value={form.responsible}
						onChange={handleChange}
					>
						<MenuItem value="">Все</MenuItem>
						{listUsers?.results.map(user => (
							<MenuItem key={user.uuid} value={user.uuid}>
								{getFullName({ lastName: user.last_name, firstName: user.first_name })}
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

			{isLoadingWarehouses ? (
				<FuseLoading />
			) : isErrorWarehouses ? (
				<ErrorMessage />
			) : (
				<DataTable data={listWarehouses.results} columns={columns} options={tableOptions} />
			)}

			{isShowModalWarehouse && (
				<ModalWarehouse isOpen warehouseUuid={selectedWarehouseUuid} onClose={handleOnCloseModalWarehouse} />
			)}
		</>
	);
}
