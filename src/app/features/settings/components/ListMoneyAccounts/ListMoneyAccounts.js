import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { IconButton } from '@material-ui/core';
import { Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { Button, DataTable, Amount } from '../../../../bizKITUi';
import { useConfirm, useToolbarTitle, useAlert } from '../../../../hooks';
import { ModalMoneyAccount } from '../../../../common/ModalMoneyAccount';
import { companiesService, ENTITY, ENTITY_DEPS } from '../../../../services';
import { modalPromise } from '../../../../common/ModalPromise';

export function ListMoneyAccounts() {
	const { alertSuccess, alertError } = useAlert();
	const [openModalConfirm] = useConfirm();
	const queryClient = useQueryClient();

	const theme = useTheme();
	const matches = useMediaQuery(theme.breakpoints.down(768));

	useToolbarTitle({
		name: 'Реквизиты счетов',
		content: (
			<>
				{!matches && (
					<Button
						textNormal
						onClick={() =>
							modalPromise.open(({ onClose }) => <ModalMoneyAccount isOpen onClose={onClose} />)
						}
					>
						Добавить счёт
					</Button>
				)}
			</>
		)
	});

	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);
	const { isLoading, isError, data } = useQuery(
		[ENTITY.MONEY_ACCOUNT, { offset: page * limit, limit }],
		({ queryKey }) => companiesService.getMoneyAccounts(queryKey[1]).then(({ data: results }) => results)
	);

	const deleteMoneyAccount = useMutation(uuid => companiesService.removeMoneyAccount(uuid));
	const handleOnDeleteItem = index => {
		const { uuid } = data.results[index];
		deleteMoneyAccount
			.mutateAsync(uuid)
			.then(() => {
				ENTITY_DEPS.MONEY_ACCOUNT.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Счёт успешно удалён');
			})
			.catch(() => {
				alertError('Не удалось удалить счёт');
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
					return companiesService.getMoneyAccountTypeByType(value).name;
				}
			}
		},
		{
			name: 'balance',
			label: 'Баланс',
			options: {
				customBodyRender(value) {
					return <Amount value={value} />;
				}
			}
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
								aria-label="Редактировать счёт"
								onClick={() =>
									modalPromise.open(({ onClose }) => (
										<ModalMoneyAccount isOpen onClose={onClose} moneyAccountUuid={uuid} />
									))
								}
							>
								<EditIcon />
							</IconButton>
							<IconButton
								aria-label="Удалить счёт"
								onClick={() =>
									openModalConfirm({
										title: `Удалить счёт "${name}"?`,
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
								modalPromise.open(({ onClose }) => <ModalMoneyAccount isOpen onClose={onClose} />)
							}
						>
							Добавить счёт
						</Button>
					)}
					<DataTable data={data.results} columns={columns} options={tableOptions} />
				</>
			)}
		</>
	);
}
