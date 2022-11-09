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
import { ModalPartner } from '../../../../common/ModalPartner';
import { companiesService, ENTITY, ENTITY_DEPS } from '../../../../services';

export function ListPartners() {
	const { alertSuccess, alertError } = useAlert();
	const [openModalConfirm] = useConfirm();
	const queryClient = useQueryClient();

	const theme = useTheme();
	const matches = useMediaQuery(theme.breakpoints.down(768));

	const [isShowModalPartner, setIsShowModalPartner] = useState(false);
	const [selectedPartner, setSelectedPartner] = useState(null);

	useToolbarTitle({
		name: 'Партнёры',
		content: (
			<>
				{!matches && (
					<Button textNormal onClick={() => setIsShowModalPartner(true)}>
						Добавить партнёра
					</Button>
				)}
			</>
		)
	});

	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);
	const { isLoading, isError, data } = useQuery([ENTITY.PARTNER, { offset: page * limit, limit }], ({ queryKey }) =>
		companiesService.getPartnersCompanies(queryKey[1]).then(({ data: results }) => results)
	);

	const deletePartner = useMutation(uuid => companiesService.removePartnerCompany(uuid));
	const handleOnDeleteItem = index => {
		const { uuid } = data.results[index];
		deletePartner
			.mutateAsync(uuid)
			.then(() => {
				ENTITY_DEPS.PARTNER.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Партнёр успешно удалён');
			})
			.catch(() => {
				alertError('Не удалось удалить партнёра');
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
								aria-label="Редактировать партнёра"
								onClick={() => {
									setIsShowModalPartner(true);
									setSelectedPartner(uuid);
								}}
							>
								<EditIcon />
							</IconButton>
							<IconButton
								aria-label="Удалить партнёра"
								onClick={() =>
									openModalConfirm({
										title: 'Удалить партнёра?',
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
						<Button className="mb-10" textNormal onClick={() => setIsShowModalPartner(true)}>
							Добавить партнёра
						</Button>
					)}
					<DataTable data={data.results} columns={columns} options={tableOptions} />
				</>
			)}

			{isShowModalPartner && (
				<ModalPartner
					isOpen
					partnerUuid={selectedPartner}
					onClose={() => {
						setIsShowModalPartner(false);
						setSelectedPartner(null);
					}}
				/>
			)}
		</>
	);
}
