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
import { employeesService, ENTITY, ENTITY_DEPS } from '../../../../services';
import { modalPromise } from '../../../../common/ModalPromise';
import { ModalJuridicalPerson } from '../../../../common/ModalJuridicalPerson';

export function ListJuridicalPersons() {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();
	const [openModalConfirm] = useConfirm();

	const theme = useTheme();
	const matches = useMediaQuery(theme.breakpoints.down(768));

	useToolbarTitle({
		name: 'Юридические лица',
		content: (
			<>
				{!matches && (
					<Button
						textNormal
						onClick={() =>
							modalPromise.open(({ onClose }) => <ModalJuridicalPerson isOpen onClose={onClose} />)
						}
					>
						Добавить юридическое лицо
					</Button>
				)}
			</>
		)
	});

	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);
	const { isLoading, isError, data } = useQuery(
		[ENTITY.JURIDICAL_PERSON, { limit, offset: page * limit }],
		({ queryKey }) => employeesService.getJuridicalPersons(queryKey[1])
	);

	const deleteJuridicalPerson = useMutation(uuid => employeesService.deleteJuridicalPerson(uuid));
	const handleOnDeleteItem = uuid => {
		deleteJuridicalPerson
			.mutateAsync(uuid)
			.then(() => {
				ENTITY_DEPS.JURIDICAL_PERSON.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Юридическое лицо успешно удалено');
			})
			.catch(() => {
				alertError('Не удалось удалить юридическое лицо');
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
								aria-label="Редактировать юридическое лицо"
								onClick={() =>
									modalPromise.open(({ onClose }) => (
										<ModalJuridicalPerson isOpen onClose={onClose} personUuid={uuid} />
									))
								}
							>
								<EditIcon />
							</IconButton>
							<IconButton
								aria-label="Удалить юридическое лицо"
								onClick={() =>
									openModalConfirm({
										title: 'Удалить юридическое лицо?',
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
						<Button
							className="mb-10"
							textNormal
							onClick={() =>
								modalPromise.open(({ onClose }) => <ModalJuridicalPerson isOpen onClose={onClose} />)
							}
						>
							Добавить юридическое лицо
						</Button>
					)}
					<DataTable data={data.results} columns={columns} options={tableOptions} />
				</>
			)}
		</>
	);
}
