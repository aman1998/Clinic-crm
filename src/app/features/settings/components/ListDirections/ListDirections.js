import React, { useState, useEffect, useContext } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { IconButton } from '@material-ui/core';
import { Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';
import { ContextMenu } from '../../pages/Settings';
import { Button, DataTable } from '../../../../bizKITUi';
import { useConfirm, useToolbarTitle, useAlert } from '../../../../hooks';
import { clinicService, ENTITY, ENTITY_DEPS } from '../../../../services';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ModalClinicDirection } from '../../../../common/ModalClinicDirection';
import { ModalClinicService } from '../../../../common/ModalClinicService';
import { modalPromise } from '../../../../common/ModalPromise';

export function ListDirections() {
	const { alertSuccess, alertError } = useAlert();
	const queryClient = useQueryClient();
	const [openModalConfirm] = useConfirm();

	useToolbarTitle('Направления');

	const setMenu = useContext(ContextMenu);
	useEffect(() => {
		setMenu(
			<div className="flex">
				<Button
					textNormal
					className="whitespace-no-wrap"
					variant="outlined"
					onClick={() => {
						modalPromise.open(({ onClose }) => <ModalClinicDirection isOpen onClose={onClose} />);
					}}
				>
					Добавить направление
				</Button>
				<Button
					textNormal
					className="whitespace-no-wrap ml-10"
					onClick={() => {
						modalPromise.open(({ onClose }) => <ModalClinicService isOpen onClose={onClose} />);
					}}
				>
					Добавить услугу
				</Button>
			</div>
		);
	}, [setMenu]);

	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);
	const { isLoading, isError, data: listDirections } = useQuery(
		[ENTITY.DIRECTION, { offset: page * limit, limit }],
		({ queryKey }) => clinicService.getDirections(queryKey[1])
	);

	const deleteDirection = useMutation(uuid => clinicService.removeDirectionById(uuid));
	const handleOnDeleteItem = index => {
		const { uuid } = listDirections.results[index];
		deleteDirection
			.mutateAsync(uuid)
			.then(() => {
				ENTITY_DEPS.DIRECTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Направление успешно удалено');
			})
			.catch(() => {
				alertError('Не удалось удалить направление');
			});
	};

	const columns = [
		{
			name: 'name',
			label: 'Наименование'
		},
		{
			name: 'actions',
			label: 'Действия',
			options: {
				setCellHeaderProps: () => ({ style: { textAlign: 'right' } }),
				customBodyRenderLite: dataIndex => {
					return (
						<div className="flex justify-end">
							<IconButton
								aria-label="Редактировать направление"
								onClick={() => {
									const { uuid } = listDirections.results[dataIndex];
									modalPromise.open(({ onClose }) => (
										<ModalClinicDirection isOpen onClose={onClose} uuid={uuid} />
									));
								}}
							>
								<EditIcon />
							</IconButton>
							<IconButton
								aria-label="Удалить направление"
								onClick={() =>
									openModalConfirm({
										title: 'Удалить направление?',
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
		rowsPerPage: limit,
		page,
		count: listDirections?.count ?? 0,
		onChangePage: newPage => setPage(newPage),
		onChangeRowsPerPage: newLimit => setLimit(newLimit)
	};

	if (isLoading) {
		return <FuseLoading />;
	}
	if (isError) {
		return <ErrorMessage />;
	}
	return <DataTable data={listDirections.results} columns={columns} options={tableOptions} />;
}
