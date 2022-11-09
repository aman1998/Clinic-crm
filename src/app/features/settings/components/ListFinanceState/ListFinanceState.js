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
import { ModalFinanceState } from '../../../../common/ModalFinanceState';
import { ENTITY, ENTITY_DEPS, financeService } from '../../../../services';

export function ListFinanceState() {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();
	const [openModalConfirm] = useConfirm();

	const theme = useTheme();
	const matches = useMediaQuery(theme.breakpoints.down(768));

	const [isShowModalFinanceState, setIsShowModalFinanceState] = useState(false);
	const [selectedFinanceState, setSelectedFinanceState] = useState(null);

	useToolbarTitle({
		name: 'Кассовые статьи',
		content: (
			<>
				{!matches && (
					<Button textNormal onClick={() => setIsShowModalFinanceState(true)}>
						Добавить кассовую статью
					</Button>
				)}
			</>
		)
	});

	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);
	const { isLoading, isError, data } = useQuery(
		[ENTITY.FINANCE_STATE, { limit, offset: page * limit }],
		({ queryKey }) => financeService.getFinanceStates(queryKey[1]).then(res => res.data)
	);

	const deleteFinanceState = useMutation(uuid => financeService.removeFinanceState(uuid));
	const handleOnDeleteItem = uuid => {
		deleteFinanceState
			.mutateAsync(uuid)
			.then(() => {
				ENTITY_DEPS.FINANCE_STATE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Кассовая статья успешно удалена');
			})
			.catch(() => {
				alertError('Не удалось удалить кассовую статью');
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
				customBodyRenderLite: dataIndex => {
					const { type } = data.results[dataIndex];
					return financeService.getFinanceStateTypeNameByType(type);
				}
			}
		},
		{
			name: 'counterparty_type',
			label: 'Контрагент',
			options: {
				customBodyRenderLite: dataIndex => {
					const { counterparty_type } = data.results[dataIndex];
					return financeService.getCounterpartyTypeNameByType(counterparty_type);
				}
			}
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
								aria-label="Редактировать кассовую статью"
								onClick={() => {
									setIsShowModalFinanceState(true);
									setSelectedFinanceState(uuid);
								}}
							>
								<EditIcon />
							</IconButton>
							<IconButton
								aria-label="Удалить кассовую статью"
								onClick={() =>
									openModalConfirm({
										title: 'Удалить кассовую статью?',
										onSuccess: () => handleOnDeleteItem(uuid)
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
						<Button className="mb-10" textNormal onClick={() => setIsShowModalFinanceState(true)}>
							Добавить кассовую статью
						</Button>
					)}
					<DataTable data={data.results} columns={columns} options={tableOptions} />
				</>
			)}

			{isShowModalFinanceState && (
				<ModalFinanceState
					isOpen
					financeStateUuid={selectedFinanceState}
					onClose={() => {
						setIsShowModalFinanceState(false);
						setSelectedFinanceState(null);
					}}
				/>
			)}
		</>
	);
}
