import React, { useContext, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { IconButton } from '@material-ui/core';
import { Delete as DeleteIcon, Edit as EditIcon } from '@material-ui/icons';
import FuseLoading from '@fuse/core/FuseLoading';
import { ContextMenu } from '../../pages/SettingsGroupBonus';
import { useConfirm, useToolbarTitle, useDebouncedFilterForm } from '../../../../hooks';
import { modalPromise } from '../../../../common/ModalPromise';
import { ErrorMessage } from '../../../../common/ErrorMessage';

import { Button, DataTable } from '../../../../bizKITUi';
import { treatmentService, ENTITY } from '../../../../services';
import { ModalGroupBonus } from '../ModalGroupBonus/ModalGroupBonus';

const defaultValues = {
	search: null,
	limit: 9,
	offset: 0
};

const groupBonusListData = {
	results: [
		{
			uuid: '05221f7e-07aa-49f9-b530-d4f1e5f8ca33',
			name: 'Продажа косметических средств',
			amount: 2,
			startDate: '05.11.2021',
			endDate: '30.11.2021',
			status: 'Активный'
		},
		{
			uuid: '05221f7e-07aa-49f9-b530-d4f1e5f8ca33',
			name: 'Гинекология',
			amount: null,
			startDate: null,
			endDate: null,
			status: null
		},
		{
			uuid: '05221f7e-07aa-49f9-b530-d4f1e5f8ca33',
			name: 'Кардиология',
			amount: null,
			startDate: null,
			endDate: null,
			status: null
		},
		{
			uuid: '05221f7e-07aa-49f9-b530-d4f1e5f8ca33',
			name: 'Невропотология',
			amount: null,
			startDate: null,
			endDate: null,
			status: null
		},
		{
			uuid: '05221f7e-07aa-49f9-b530-d4f1e5f8ca33',
			name: 'Хирургия',
			amount: null,
			startDate: null,
			endDate: null,
			status: null
		},
		{
			uuid: '05221f7e-07aa-49f9-b530-d4f1e5f8ca33',
			name: 'Педиатрия',
			amount: null,
			startDate: null,
			endDate: null,
			status: null
		},
		{
			uuid: '05221f7e-07aa-49f9-b530-d4f1e5f8ca33',
			name: 'Лаборатория',
			amount: null,
			startDate: null,
			endDate: null,
			status: null
		},
		{
			uuid: '05221f7e-07aa-49f9-b530-d4f1e5f8ca33',
			name: 'Диангостика',
			amount: null,
			startDate: null,
			endDate: null,
			status: null
		},
		{
			uuid: '05221f7e-07aa-49f9-b530-d4f1e5f8ca33',
			name: 'Стационар',
			amount: null,
			startDate: null,
			endDate: null,
			status: null
		}
	]
};

export function ListGroupBonus() {
	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);

	const setMenu = useContext(ContextMenu);
	const [openModalConfirm] = useConfirm();

	useToolbarTitle({ name: 'Групповой бонус' });

	useEffect(() => {
		setMenu(
			<Button
				textNormal
				className="whitespace-no-wrap"
				onClick={() =>
					modalPromise.open(({ onClose }) => <ModalGroupBonus onClose={onClose} isOpen isCancelModal />)
				}
			>
				Добавить группы
			</Button>
		);
		return () => setMenu('');
	}, [setMenu]);

	const { debouncedForm } = useDebouncedFilterForm(defaultValues);

	const { isLoading, isError, data } = useQuery([ENTITY.TREATMENTS_TEMPLATE, debouncedForm], () =>
		treatmentService.getTreatmentsTemplate(debouncedForm)
	);

	const tableOptions = {
		serverSide: true,
		rowsPerPage: limit,
		page,
		count: data?.count ?? 0,
		onChangePage: newPage => setPage(newPage),
		onChangeRowsPerPage: newLimit => setLimit(newLimit)
	};

	const columns = [
		{
			name: 'fio',
			label: 'Наименование',
			options: {
				customBodyRenderLite: dataIndex => {
					const { name } = groupBonusListData.results[dataIndex];
					return name ?? '—';
				}
			}
		},

		{
			name: 'amount',
			label: 'Кол-во в группе',
			options: {
				customBodyRenderLite: dataIndex => {
					const { amount } = groupBonusListData.results[dataIndex];
					return amount ?? '—';
				}
			}
		},
		{
			name: 'startDate',
			label: 'Дата начала',
			options: {
				customBodyRenderLite: dataIndex => {
					const { startDate } = groupBonusListData.results[dataIndex];
					return startDate ?? '—';
				}
			}
		},
		{
			name: 'endDate',
			label: 'Дата завершения',
			options: {
				customBodyRenderLite: dataIndex => {
					const { endDate } = groupBonusListData.results[dataIndex];
					return endDate ?? '—';
				}
			}
		},
		{
			name: 'status',
			label: 'Статус',
			options: {
				customBodyRenderLite: dataIndex => {
					const { status } = groupBonusListData.results[dataIndex];
					return status ?? '—';
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
								aria-label="Редактировать пользователя"
								onClick={() =>
									modalPromise.open(({ onClose }) => (
										<ModalGroupBonus
											onClose={onClose}
											isOpen
											isCancelModal
											groupBonusUuid={uuid}
											// initialValues={{
											// 	name: data.results[dataIndex]?.name,
											// 	medicaments: data.results[dataIndex]?.medicaments,
											// 	services: data.results[dataIndex]?.services
											// }}
										/>
									))
								}
							>
								<EditIcon />
							</IconButton>
							<IconButton
								aria-label="Удалить пользователя"
								onClick={() =>
									openModalConfirm({
										title: 'Удалить пользователя?'
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

	return (
		<div className="md:m-32 m-12">
			{isLoading ? (
				<FuseLoading />
			) : isError ? (
				<ErrorMessage />
			) : (
				<DataTable data={data.results} columns={columns} options={tableOptions} />
			)}
		</div>
	);
}
