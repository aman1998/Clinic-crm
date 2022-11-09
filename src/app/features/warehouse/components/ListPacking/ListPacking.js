import React, { useContext, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { IconButton } from '@material-ui/core';
import { Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';
import { ContextMenu } from 'app/features/warehouse/pages/Warehouse';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { Button, DataTable } from '../../../../bizKITUi';
import { useConfirm, useAlert } from '../../../../hooks';
import { ModalPackage } from '../../../../common/ModalPackage';
import { ENTITY, ENTITY_DEPS, packagesService } from '../../../../services';
import { modalPromise } from '../../../../common/ModalPromise';
import { PACKAGE_TYPE_PACK, PACKAGE_TYPE_PIECE } from '../../../../services/packages/constants';

export function ListPacking() {
	const { alertSuccess, alertError } = useAlert();
	const [openModalConfirm] = useConfirm();
	const queryClient = useQueryClient();

	const setMenu = useContext(ContextMenu);
	useEffect(() => {
		setMenu(
			<div>
				<Button
					textNormal
					variant="outlined"
					onClick={() =>
						modalPromise.open(({ onClose }) => (
							<ModalPackage isOpen onClose={onClose} packageType={PACKAGE_TYPE_PIECE} />
						))
					}
				>
					Добавить ед. измерения
				</Button>
				<Button
					className="ml-16"
					textNormal
					onClick={() =>
						modalPromise.open(({ onClose }) => (
							<ModalPackage isOpen onClose={onClose} packageType={PACKAGE_TYPE_PACK} />
						))
					}
				>
					Добавить ед. фасовки
				</Button>
			</div>
		);

		return () => {
			setMenu(null);
		};
	}, [setMenu]);

	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);
	const { isLoading, isError, data } = useQuery([ENTITY.PACKAGE, { limit, offset: page * limit }], ({ queryKey }) =>
		packagesService.getPackages(queryKey[1])
	);

	const deletePackage = useMutation(uuid => packagesService.deletePackage(uuid));
	const handleOnDeleteItem = index => {
		const { uuid } = data.results[index];
		deletePackage
			.mutateAsync(uuid)
			.then(() => {
				ENTITY_DEPS.PACKAGE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Успешно удалено');
			})
			.catch(() => {
				alertError('Во время удаления произошла ошибка');
			});
	};

	const columns = [
		{
			name: 'name',
			label: 'Наименование'
		},
		{
			name: 'type',
			label: 'Тип',
			options: {
				customBodyRender(value) {
					return packagesService.getPackageTypeByType(value).name;
				}
			}
		},
		{
			name: 'actions',
			label: 'Действия',
			options: {
				setCellHeaderProps: () => ({ style: { textAlign: 'right' } }),
				customBodyRenderLite: dataIndex => {
					const { uuid, name, type } = data.results[dataIndex];
					return (
						<div className="flex justify-end">
							<IconButton
								aria-label="Редактировать"
								onClick={() =>
									modalPromise.open(({ onClose }) => (
										<ModalPackage isOpen onClose={onClose} packageUuid={uuid} packageType={type} />
									))
								}
							>
								<EditIcon />
							</IconButton>
							<IconButton
								aria-label="Удалить"
								onClick={() =>
									openModalConfirm({
										title: `Удалить "${name}"?`,
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
				<DataTable data={data.results} columns={columns} options={tableOptions} />
			)}
		</>
	);
}
