import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { IconButton } from '@material-ui/core';
import { Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { Button, DataTable } from '../../../../bizKITUi';
import { useConfirm, useToolbarTitle, useAlert } from '../../../../hooks';
import { ModalGroup } from '../ModalGroup';
import { authService, ENTITY, ENTITY_DEPS } from '../../../../services';

export function ListGroups() {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();
	const [openModalConfirm] = useConfirm();

	const [isShowModal, setIsShowModal] = useState(false);
	const [selectedGroup, setSelectedGroup] = useState(null);

	const theme = useTheme();
	const matches = useMediaQuery(theme.breakpoints.down(768));

	useToolbarTitle({
		name: 'Группы пользователей',
		content: (
			<>
				{!matches && (
					<Button textNormal onClick={() => setIsShowModal(true)}>
						Добавить группу
					</Button>
				)}
			</>
		)
	});

	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);
	const { isLoading, isError, data } = useQuery([ENTITY.GROUP, { limit, offset: page * limit }], ({ queryKey }) =>
		authService.getGroups(queryKey[1])
	);

	const deleteGroup = useMutation(id => authService.removeGroup(id));
	const handleDeleteGroup = index => {
		const { id } = data.results[index];
		deleteGroup
			.mutateAsync(id)
			.then(() => {
				ENTITY_DEPS.GROUP.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Группа успешно удалена');
			})
			.catch(() => {
				alertError('Не удалось удалить группу');
			});
	};

	const handleEditGroup = index => {
		setSelectedGroup(data.results[index]);
		setIsShowModal(true);
	};
	const handleCloseModal = () => {
		setSelectedGroup(null);
		setIsShowModal(false);
	};

	const columns = [
		{
			name: 'id',
			label: '№'
		},
		{
			name: 'name',
			label: 'Наименование группы'
		},
		{
			name: 'actions',
			label: 'Действия',
			options: {
				setCellHeaderProps: () => ({ style: { textAlign: 'right' } }),
				customBodyRenderLite: dataIndex => {
					return (
						<div className="flex justify-end">
							<IconButton aria-label="Редактировать группу" onClick={() => handleEditGroup(dataIndex)}>
								<EditIcon />
							</IconButton>
							<IconButton
								aria-label="Удалить группу"
								onClick={() =>
									openModalConfirm({
										title: 'Удалить группу?',
										onSuccess: () => handleDeleteGroup(dataIndex)
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
		count: data?.count ?? 0,
		onChangePage: newPage => setPage(newPage),
		onChangeRowsPerPage: newLimit => setLimit(newLimit)
	};

	return (
		<>
			{isLoading ? (
				<FuseLoading />
			) : isError ? (
				<ErrorMessage />
			) : (
				<>
					{matches && (
						<Button className="mb-10" textNormal onClick={() => setIsShowModal(true)}>
							Добавить группу
						</Button>
					)}
					<DataTable data={data.results} columns={columns} options={tableOptions} />
				</>
			)}

			{isShowModal && <ModalGroup isOpen groupId={selectedGroup?.id} onClose={handleCloseModal} />}
		</>
	);
}
