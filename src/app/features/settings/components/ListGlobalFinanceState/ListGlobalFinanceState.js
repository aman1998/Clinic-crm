import React, { useState } from 'react';
import { IconButton } from '@material-ui/core';
import { Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { Button, DataTable } from '../../../../bizKITUi';
import { useConfirm, useToolbarTitle, useAlert, useDebouncedFilterForm } from '../../../../hooks';
import { ModalGlobalFinanceState } from '../../../../common/ModalGlobalFinanceState';
import { ENTITY, ENTITY_DEPS, globalFinanceService } from '../../../../services';

const defaultValues = {
	limit: 10,
	offset: 0
};

export function ListGlobalFinanceState() {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();
	const [openModalConfirm] = useConfirm();

	const theme = useTheme();
	const matches = useMediaQuery(theme.breakpoints.down(768));

	const { form, debouncedForm, setInForm, getPage, setPage } = useDebouncedFilterForm(defaultValues);

	const [isShowModalGlobalFinanceState, setIsShowModalGlobalFinanceState] = useState(false);
	const [selectedUuidGlobalFinanceState, setSelectedUuidGlobalFinanceState] = useState(null);

	useToolbarTitle({
		name: 'Финансовые статьи',
		content: (
			<>
				{!matches && (
					<Button textNormal onClick={() => setIsShowModalGlobalFinanceState(true)}>
						Добавить финансовую статью
					</Button>
				)}
			</>
		)
	});

	const { data, isLoading, isError } = useQuery([ENTITY.GLOBAL_FINANCE_STATE, debouncedForm], ({ queryKey }) =>
		globalFinanceService.getStates(queryKey[1])
	);

	const removeGlobalFinanceState = useMutation(uuid => globalFinanceService.removeState(uuid));
	const handleOnRemoveGlobalFinanceState = uuid => {
		removeGlobalFinanceState
			.mutateAsync(uuid)
			.then(() => {
				alertSuccess('Финансовая статья успешно удалена');

				ENTITY_DEPS.GLOBAL_FINANCE_STATE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
			})
			.catch(error => {
				alertError(`Не удалось удалить финансовую статью. ${error.userMessage}`);
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
					const { global_finance_group } = data.results[dataIndex];

					return globalFinanceService.getGroupTypeNameByType(global_finance_group.type);
				}
			}
		},
		{
			name: 'counterparty_type',
			label: 'Контрагент',
			options: {
				customBodyRenderLite: dataIndex => {
					const { counterparty_type } = data.results[dataIndex];

					return globalFinanceService.getCounterpartyTypeNameByType(counterparty_type);
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
								aria-label="Редактировать финансовую статью"
								onClick={() => {
									setIsShowModalGlobalFinanceState(true);
									setSelectedUuidGlobalFinanceState(uuid);
								}}
							>
								<EditIcon />
							</IconButton>
							<IconButton
								aria-label="Удалить финансовую статью"
								disabled={removeGlobalFinanceState.isLoading}
								onClick={() =>
									openModalConfirm({
										title: 'Удалить финансовую статью?',
										onSuccess: () => handleOnRemoveGlobalFinanceState(uuid)
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

	if (isError) {
		return <ErrorMessage />;
	}
	if (isLoading) {
		return <FuseLoading />;
	}
	return (
		<>
			{matches && (
				<Button className="mb-10" textNormal onClick={() => setIsShowModalGlobalFinanceState(true)}>
					Добавить финансовую статью
				</Button>
			)}
			<DataTable data={data.results} columns={columns} options={tableOptions} />

			{isShowModalGlobalFinanceState && (
				<ModalGlobalFinanceState
					isOpen
					stateUuid={selectedUuidGlobalFinanceState}
					onClose={() => {
						setIsShowModalGlobalFinanceState(false);
						setSelectedUuidGlobalFinanceState(null);
					}}
				/>
			)}
		</>
	);
}
