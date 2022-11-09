import React, { useState, useContext, useEffect } from 'react';
import FuseLoading from '@fuse/core/FuseLoading';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { IconButton } from '@material-ui/core';
import { Delete as DeleteIcon, Edit as EditIcon } from '@material-ui/icons';
import { useAlert, useConfirm } from '../../../../hooks';
import { modalPromise } from '../../../../common/ModalPromise';
import { ENTITY, ENTITY_DEPS, equipmentsService } from '../../../../services';
import { Button, DataTable } from '../../../../bizKITUi';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { ContextMenu } from '../../pages/SettingsEquipments';
import { ModalEquipment } from '../ModalEquipment';
import { PERMISSION } from '../../../../services/auth/constants';
import { GuardCheckPermission } from '../../../../common/GuardCheckPermission';

export function ListEquipments() {
	const queryClient = useQueryClient();

	const [openModalConfirm] = useConfirm();

	const { alertSuccess, alertError } = useAlert();

	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);

	const setMenu = useContext(ContextMenu);

	useEffect(() => {
		setMenu(
			<GuardCheckPermission permission={PERMISSION.EQUIPMENTS.ADD_EQUIPMENT}>
				{() => (
					<div className="flex">
						<Button
							textNormal
							className="whitespace-no-wrap"
							onClick={() => {
								modalPromise.open(({ onClose }) => <ModalEquipment isOpen onClose={onClose} />);
							}}
						>
							Добавить оборудование
						</Button>
					</div>
				)}
			</GuardCheckPermission>
		);
		return () => setMenu(null);
	}, [setMenu]);

	const { isLoading, isError, data } = useQuery([ENTITY.EQUIPMENT, { limit, offset: page * limit }], ({ queryKey }) =>
		equipmentsService.getEquipments(queryKey[1])
	);

	const deleteEquipment = useMutation(uuid => equipmentsService.deleteEquipment(uuid));
	const handleOnDelete = async uuid => {
		try {
			await deleteEquipment.mutateAsync(uuid);
			ENTITY_DEPS.EQUIPMENT.forEach(dep => {
				queryClient.invalidateQueries(dep);
			});

			alertSuccess('Оборудование удалено');
		} catch {
			alertError('Не удалось удалить оборудование');
		}
	};

	const columns = [
		{
			name: 'name',
			label: 'Наименование'
		},

		{
			name: 'actions',
			label: 'Действие',
			options: {
				setCellHeaderProps: () => ({ style: { textAlign: 'right' } }),
				customBodyRenderLite: dataIndex => {
					return (
						<div className="flex justify-end">
							<GuardCheckPermission permission={PERMISSION.EQUIPMENTS.EDIT_EQUIPMENT}>
								{() => (
									<IconButton
										aria-label="Редактировать услугу"
										onClick={() =>
											modalPromise.open(({ onClose }) => (
												<ModalEquipment
													isOpen
													onClose={onClose}
													equipmentUuid={data.results[dataIndex].uuid}
												/>
											))
										}
									>
										<EditIcon />
									</IconButton>
								)}
							</GuardCheckPermission>
							<GuardCheckPermission permission={PERMISSION.EQUIPMENTS.DELETE_EQUIPMENT}>
								{() => (
									<IconButton
										aria-label="Удалить оборудование"
										onClick={() =>
											openModalConfirm({
												title: 'Удалить оборудование?',
												onSuccess: () => handleOnDelete(data.results[dataIndex].uuid)
											})
										}
									>
										<DeleteIcon />
									</IconButton>
								)}
							</GuardCheckPermission>
						</div>
					);
				}
			}
		}
	];

	const tableOptions = {
		serverSide: true,
		rowsPerPage: limit,
		page,
		count: data?.count ?? 0,
		onChangePage: newPage => setPage(newPage),
		onChangeRowsPerPage: newLimit => setLimit(newLimit)
	};

	return isLoading ? (
		<FuseLoading />
	) : isError ? (
		<ErrorMessage />
	) : (
		<DataTable columns={columns} options={tableOptions} data={data.results} />
	);
}
