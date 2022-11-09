import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { IconButton } from '@material-ui/core';
import { Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { Button, DataTable } from '../../../../bizKITUi';
import { useConfirm, useToolbarTitle, useAlert } from '../../../../hooks';
import { ModalSourceHandbook } from '../ModalSourceHandbook';
import { sourceHandbooksService, ENTITY, ENTITY_DEPS } from '../../../../services';
import { modalPromise } from '../../../../common/ModalPromise';

export function ListSourceHandbook() {
	const { alertSuccess, alertError } = useAlert();
	const [openModalConfirm] = useConfirm();
	const queryClient = useQueryClient();

	const theme = useTheme();
	const matches = useMediaQuery(theme.breakpoints.down(768));

	useToolbarTitle({
		name: 'Источники лидов',
		content: (
			<>
				{!theme && (
					<Button
						textNormal
						onClick={() =>
							modalPromise.open(({ onClose }) => <ModalSourceHandbook isOpen onClose={onClose} />)
						}
					>
						Добавить источник
					</Button>
				)}
			</>
		)
	});

	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);
	const { isLoading, isError, data } = useQuery(
		[ENTITY.SOURCE_HANDBOOK, { limit, offset: page * limit }],
		({ queryKey }) => sourceHandbooksService.getSources(queryKey[1])
	);

	const deleteSource = useMutation(uuid => sourceHandbooksService.deleteSource(uuid));
	const handleOnDeleteItem = index => {
		const { uuid } = data.results[index];
		deleteSource
			.mutateAsync(uuid)
			.then(() => {
				ENTITY_DEPS.SOURCE_HANDBOOK.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Источник успешно удалён');
			})
			.catch(() => {
				alertError('Не удалось удалить источник');
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
					const { uuid, name } = data.results[dataIndex];
					return (
						<div className="flex justify-end">
							<IconButton
								aria-label="Редактировать источник"
								onClick={() =>
									modalPromise.open(({ onClose }) => (
										<ModalSourceHandbook isOpen onClose={onClose} sourceUuid={uuid} />
									))
								}
							>
								<EditIcon />
							</IconButton>
							<IconButton
								aria-label="Удалить источник"
								onClick={() =>
									openModalConfirm({
										title: `Удалить источник "${name}"?`,
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
						<Button
							className="mb-10"
							textNormal
							onClick={() =>
								modalPromise.open(({ onClose }) => <ModalSourceHandbook isOpen onClose={onClose} />)
							}
						>
							Добавить источник
						</Button>
					)}
					<DataTable data={data.results} columns={columns} options={tableOptions} />
				</>
			)}
		</>
	);
}
