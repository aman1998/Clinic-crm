import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { IconButton } from '@material-ui/core';
import { Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { Button, DataTable } from '../../../../bizKITUi';
import { useConfirm, useToolbarTitle, useAlert } from '../../../../hooks';
import { modalPromise } from '../../../../common/ModalPromise';
import { ModalBranch } from '../ModalBranch';
import { companiesService, ENTITY, ENTITY_DEPS } from '../../../../services';

export function ListBranches() {
	const { alertSuccess, alertError } = useAlert();
	const [openModalConfirm] = useConfirm();
	const queryClient = useQueryClient();

	const theme = useTheme();
	const matches = useMediaQuery(theme.breakpoints.down(768));

	useToolbarTitle({
		name: 'Филиалы',
		content: (
			<>
				{!matches && (
					<Button
						textNormal
						onClick={() => modalPromise.open(({ onClose }) => <ModalBranch isOpen onClose={onClose} />)}
					>
						Добавить филиал
					</Button>
				)}
			</>
		)
	});

	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);
	const { isLoading, isError, data } = useQuery(
		[ENTITY.COMPANY_BRANCH, { limit, offset: page * limit }],
		({ queryKey }) => companiesService.getCompaniesBranches(queryKey[1])
	);

	const deleteBranch = useMutation(uuid => companiesService.deleteCompanyBranch(uuid));
	const handleOnDeleteItem = index => {
		const { uuid } = data.results[index];
		deleteBranch
			.mutateAsync(uuid)
			.then(() => {
				ENTITY_DEPS.COMPANY_BRANCH.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Филиал успешно удалёл');
			})
			.catch(() => {
				alertError('Не удалось удалить филиал');
			});
	};

	const columns = [
		{
			name: 'name',
			label: 'Наименование'
		},
		{
			name: 'address',
			label: 'Адрес'
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
								aria-label="Редактировать филиал"
								onClick={() =>
									modalPromise.open(({ onClose }) => (
										<ModalBranch isOpen branchUuid={uuid} onClose={onClose} />
									))
								}
							>
								<EditIcon />
							</IconButton>

							<IconButton
								aria-label="Удалить филиал"
								onClick={() =>
									openModalConfirm({
										title: 'Удалить филиал',
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

	if (isError) {
		return <ErrorMessage />;
	}
	if (isLoading) {
		return <FuseLoading />;
	}
	return (
		<>
			{' '}
			{matches && (
				<Button
					className="mb-10"
					textNormal
					onClick={() => modalPromise.open(({ onClose }) => <ModalBranch isOpen onClose={onClose} />)}
				>
					Добавить филиал
				</Button>
			)}
			<DataTable data={data.results} columns={columns} options={tableOptions} />
		</>
	);
}
