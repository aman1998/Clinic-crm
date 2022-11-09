import React, { useCallback, useMemo, useState } from 'react';
import moment from 'moment';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import IconButton from '@material-ui/core/IconButton';
import { Delete, Edit } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import { documentsService, ENTITY, ENTITY_DEPS } from '../../../../services';
import { GuardCheckPermission } from '../../../../common/GuardCheckPermission';
import { PERMISSION } from '../../../../services/auth/constants';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { DataTable, Button } from '../../../../bizKITUi';
import { useConfirm, useAlert, useToolbarTitle } from '../../../../hooks';
import { modalPromise } from '../../../../common/ModalPromise';
import { ModalDocumentTemplate } from '../ModalDocumentTemplate';

export function ListDocumentTemplate() {
	const [openModalConfirm] = useConfirm();
	const { alertSuccess, alertError } = useAlert();
	const queryClient = useQueryClient();

	useToolbarTitle({
		name: 'Документы',
		content: (
			<GuardCheckPermission permission={PERMISSION.DOCUMENTS.ADD_DOCUMENT_TEMPLATE}>
				{() => (
					<Button
						textNormal
						onClick={() =>
							modalPromise.open(({ onClose }) => <ModalDocumentTemplate onClose={onClose} isOpen />)
						}
					>
						Добавить шаблон
					</Button>
				)}
			</GuardCheckPermission>
		)
	});

	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);
	const { isError, isLoading, data } = useQuery(
		[ENTITY.DOCUMENT_TEMPLATE, { offset: page * limit, limit }],
		({ queryKey }) => documentsService.getDocumentsTemplates(queryKey[1])
	);

	const deleteDocumentTemplate = useMutation(uuid => documentsService.removeDocumentTemplate(uuid));
	const handleOnDeleteDocumentTemplate = useCallback(
		uuid => {
			deleteDocumentTemplate
				.mutateAsync(uuid)
				.then(() => {
					alertSuccess('Документ успешно удалён');

					ENTITY_DEPS.DOCUMENT_TEMPLATE.forEach(dep => {
						queryClient.invalidateQueries(dep);
					});
				})
				.catch(() => {
					alertError('Не удалось удалить документ');
				});
		},
		[alertError, alertSuccess, deleteDocumentTemplate, queryClient]
	);

	const columns = useMemo(
		() => [
			{
				name: '#',
				label: '№',
				options: {
					customBodyRender: (_, tableMeta) => {
						return tableMeta.rowIndex + 1 + page * limit;
					}
				}
			},
			{
				name: 'name',
				label: 'Наименование'
			},
			{
				name: 'updated_at',
				label: 'Дата изменения',
				options: {
					customBodyRender: value => moment(value).format('DD.MM.YYYY')
				}
			},
			{
				name: 'actions',
				label: 'Действия',
				options: {
					setCellHeaderProps: () => ({ style: { textAlign: 'right' } }),
					customBodyRenderLite: dataIndex => {
						const { uuid, deletable } = data.results[dataIndex];
						return (
							<div className="flex justify-end">
								<GuardCheckPermission permission={PERMISSION.DOCUMENTS.CHANGE_DOCUMENT_TEMPLATE}>
									{() => (
										<IconButton component={Link} to={`/settings/documents/templates/${uuid}/edit`}>
											<Edit />
										</IconButton>
									)}
								</GuardCheckPermission>
								<GuardCheckPermission permission={PERMISSION.DOCUMENTS.DELETE_DOCUMENT_TEMPLATE}>
									{() => (
										<IconButton
											disabled={!deletable}
											onClick={() => {
												openModalConfirm({
													title: 'Удалить документ?',
													onSuccess: () => handleOnDeleteDocumentTemplate(uuid)
												});
											}}
										>
											<Delete />
										</IconButton>
									)}
								</GuardCheckPermission>
							</div>
						);
					}
				}
			}
		],
		[data, handleOnDeleteDocumentTemplate, limit, openModalConfirm, page]
	);

	if (isLoading) {
		return <FuseLoading />;
	}
	if (isError) {
		return <ErrorMessage />;
	}

	const tableOptions = {
		serverSide: true,
		rowsPerPage: limit,
		page,
		count: data.count ?? 0,
		onChangePage: newPage => setPage(newPage),
		onChangeRowsPerPage: newLimit => setLimit(newLimit)
	};

	return <DataTable title="Список шаблонов" options={tableOptions} columns={columns} data={data.results} />;
}
