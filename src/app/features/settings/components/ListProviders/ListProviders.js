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
import { ModalCompanyProvider } from '../../../../common/ModalCompanyProvider';
import { companiesService, ENTITY, ENTITY_DEPS } from '../../../../services';

export function ListProviders() {
	const { alertSuccess, alertError } = useAlert();
	const [openModalConfirm] = useConfirm();
	const queryClient = useQueryClient();

	const theme = useTheme();
	const matches = useMediaQuery(theme.breakpoints.down(768));

	const [isShowModalProvider, setIsShowModalProvider] = useState(false);
	const [selectedProvider, setSelectedProvider] = useState(null);

	useToolbarTitle({
		name: 'Поставщики',
		content: (
			<>
				{!matches && (
					<Button textNormal onClick={() => setIsShowModalProvider(true)}>
						Добавить поставщика
					</Button>
				)}
			</>
		)
	});

	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);
	const { isLoading, isError, data } = useQuery([ENTITY.PROVIDER, { limit, offset: page * limit }], ({ queryKey }) =>
		companiesService.getCompanyProviders(queryKey[1])
	);

	const deleteProvider = useMutation(uuid => companiesService.removeCompanyProvider(uuid));
	const handleOnDeleteItem = index => {
		const { uuid } = data.results[index];
		deleteProvider
			.mutateAsync(uuid)
			.then(() => {
				ENTITY_DEPS.PROVIDER.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Поставщик успешно удалён');
			})
			.catch(() => {
				alertError('Не удалось удалить поставщика');
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
								aria-label="Редактировать поставщика"
								onClick={() => {
									setIsShowModalProvider(true);
									setSelectedProvider(uuid);
								}}
							>
								<EditIcon />
							</IconButton>
							<IconButton
								aria-label="Удалить поставщика"
								onClick={() =>
									openModalConfirm({
										title: 'Удалить поставщика?',
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
						<Button className="mb-10" textNormal onClick={() => setIsShowModalProvider(true)}>
							Добавить поставщика
						</Button>
					)}
					<DataTable data={data.results} columns={columns} options={tableOptions} />
				</>
			)}

			{isShowModalProvider && (
				<ModalCompanyProvider
					isOpen
					companyProviderUuid={selectedProvider}
					onClose={() => {
						setIsShowModalProvider(false);
						setSelectedProvider(null);
					}}
				/>
			)}
		</>
	);
}
