import React, { useState } from 'react';
import { IconButton, Typography } from '@material-ui/core';
import { Add as AddIcon, Delete as DeleteIcon } from '@material-ui/icons';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ENTITY, ENTITY_DEPS, operationService } from '../../../../services';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { DataTable, Button } from '../../../../bizKITUi';
import { getFullName } from '../../../../utils';
import { modalPromise } from '../../../../common/ModalPromise';
import { ModalOperationStage } from '../ModalOperationStage';
import { useAlert, useConfirm } from '../../../../hooks';

export function ListOperationStages() {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();
	const [openModalConfirm] = useConfirm();

	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);
	const { isLoading, isFetching, isError, data } = useQuery(
		[ENTITY.OPERATION_STAGE, { limit, offset: page * limit }],
		({ queryKey }) => operationService.getOperationStages(queryKey[1])
	);

	const removeOperationStage = useMutation(uuid => operationService.removeOperationStage(uuid));
	const handleOnRemoveOperationStage = (uuid, event) => {
		event.stopPropagation();

		openModalConfirm({
			title: 'Удалить этап?',
			onSuccess: () => {
				removeOperationStage
					.mutateAsync(uuid)
					.then(() => {
						ENTITY_DEPS.OPERATION_STAGE.forEach(dep => {
							queryClient.invalidateQueries(dep);
						});
						alertSuccess('Этап успешно удалён');
					})
					.catch(() => {
						alertError('Не удалось удалить этап');
					});
			}
		});
	};

	const columns = [
		{
			name: 'name',
			label: 'Наименование'
		},
		{
			name: 'number',
			label: 'Порядок'
		},
		{
			name: 'responsible',
			label: 'Отвественный',
			options: {
				customBodyRenderLite: dataIndex => {
					return getFullName(data.results[dataIndex].responsible ?? {});
				}
			}
		},
		{
			name: 'duration',
			label: 'Длительность'
		},
		{
			name: 'actions',
			label: 'Действия',
			options: {
				setCellHeaderProps: () => ({ style: { textAlign: 'right' } }),
				customBodyRenderLite: dataIndex => {
					const { uuid } = data.results[dataIndex];

					return (
						<div className="flex justify-end">
							<IconButton
								aria-label="Удалить"
								variant="text"
								size="small"
								disabled={removeOperationStage.isLoading || isFetching}
								onClick={event => handleOnRemoveOperationStage(uuid, event)}
							>
								<DeleteIcon fontSize="inherit" />
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
		onChangeRowsPerPage: newLimit => setLimit(newLimit),
		onRowClick: (_, rowMeta) => {
			modalPromise.open(({ onClose }) => (
				<ModalOperationStage isOpen stageUuid={data.results[rowMeta.dataIndex].uuid} onClose={onClose} />
			));
		}
	};

	return (
		<>
			<div className="flex justify-between">
				<Typography variant="h6">Этапы</Typography>

				<Button
					textNormal
					startIcon={<AddIcon />}
					onClick={() => modalPromise.open(({ onClose }) => <ModalOperationStage isOpen onClose={onClose} />)}
				>
					Добавить этап
				</Button>
			</div>

			<div className="mt-10">
				{isError ? (
					<ErrorMessage />
				) : isLoading ? (
					<FuseLoading />
				) : (
					<DataTable data={data.results} columns={columns} options={tableOptions} />
				)}
			</div>
		</>
	);
}
