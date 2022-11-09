import React, { useContext, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { IconButton } from '@material-ui/core';
import { Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';
import { DataTable, Button } from '../../../../bizKITUi';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ContextMenu } from '../../pages/Warehouse';
import { useConfirm, useAlert, useDebouncedFilterForm } from '../../../../hooks';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { ModalProductCategory } from '../../../../common/ModalProductCategory';

import { productsService, ENTITY, ENTITY_DEPS } from '../../../../services';
import { modalPromise } from '../../../../common/ModalPromise';

export function ListWarehouseProductCategories() {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();
	const [openModalConfirm] = useConfirm();

	const { form, debouncedForm, getPage, setPage, setInForm } = useDebouncedFilterForm({
		limit: 10,
		offset: 0
	});

	const { isLoading, isError, data } = useQuery([ENTITY.PRODUCT_CATEGORY, debouncedForm], ({ queryKey }) =>
		productsService.getProductCategories(queryKey[1]).then(res => res.data)
	);

	const setMenu = useContext(ContextMenu);
	useEffect(() => {
		setMenu(
			<div>
				<Button
					textNormal
					className="whitespace-no-wrap"
					onClick={() =>
						modalPromise.open(({ onClose }) => <ModalProductCategory isOpen onClose={onClose} />)
					}
				>
					Добавить категорию
				</Button>
			</div>
		);

		return () => setMenu(null);
	}, [setMenu]);

	const deleteCategory = useMutation(uuid => productsService.deleteProductCategory(uuid));
	const handleOnDelete = uuid => {
		deleteCategory
			.mutateAsync(uuid)
			.then(() => {
				ENTITY_DEPS.PRODUCT_CATEGORY.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Категория успешно удалена');
			})
			.catch(() => {
				alertError('Не удалось удалить категорию');
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
					const { uuid } = data.results[dataIndex];

					return (
						<div className="flex justify-end">
							<IconButton
								aria-label="Редактировать категорию"
								disabled={deleteCategory.isLoading}
								onClick={() =>
									modalPromise.open(({ onClose }) => (
										<ModalProductCategory isOpen onClose={onClose} productCategoryUuid={uuid} />
									))
								}
							>
								<EditIcon />
							</IconButton>
							<IconButton
								aria-label="Удалить категорию"
								disabled={deleteCategory.isLoading}
								onClick={() =>
									openModalConfirm({
										title: 'Вы действительно хотите удалить категорию?',
										onSuccess: () => handleOnDelete(uuid)
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
		count: data?.count ?? 0,
		onChangePage: page => setPage(page),
		onChangeRowsPerPage: limit => setInForm('limit', limit)
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
