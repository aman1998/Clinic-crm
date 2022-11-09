import React, { useContext, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { IconButton } from '@material-ui/core';
import { Delete as DeleteIcon, Edit as EditIcon } from '@material-ui/icons';
import FuseLoading from '@fuse/core/FuseLoading';
import { ContextMenu } from '../../pages/SettingsTreatment';
import { useConfirm, useToolbarTitle, useDebouncedFilterForm, useAlert } from '../../../../hooks';
import { modalPromise } from '../../../../common/ModalPromise';
import { ErrorMessage } from '../../../../common/ErrorMessage';

import { ModalDiagnosis } from '../ModalDiagnosis';
import { Button, DataTable } from '../../../../bizKITUi';
import { treatmentService, ENTITY, ENTITY_DEPS } from '../../../../services';

const defaultValues = {
	search: null,
	limit: 10,
	offset: 0
};

export function ListDiagnoses() {
	const setMenu = useContext(ContextMenu);
	const [openModalConfirm] = useConfirm();
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	useToolbarTitle({ name: 'Диагнозы' });

	useEffect(() => {
		setMenu(
			<Button
				textNormal
				className="whitespace-no-wrap"
				onClick={() =>
					modalPromise.open(({ onClose }) => <ModalDiagnosis onClose={onClose} isOpen isCancelModal />)
				}
			>
				Добавить новый диагноз
			</Button>
		);
		return () => setMenu('');
	}, [setMenu]);

	const { form, debouncedForm, setInForm, setPage, getPage } = useDebouncedFilterForm(defaultValues);

	const { isLoading, isError, data } = useQuery([ENTITY.TREATMENTS_TEMPLATE, debouncedForm], () =>
		treatmentService.getTreatmentsTemplate(debouncedForm)
	);

	const deleteTreatment = useMutation(uuid => treatmentService.deleteTreatmentTemplateByUuid(uuid));
	const handleOnDelete = uuid => {
		deleteTreatment
			.mutateAsync(uuid)
			.then(() => {
				ENTITY_DEPS.TREATMENTS_TEMPLATE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Диагноз успешно удален');
			})
			.catch(() => {
				alertError('Не удалось удалить диагноз');
			});
	};

	const tableOptions = {
		serverSide: true,
		rowsPerPage: form.limit,
		page: getPage(),
		count: data?.count ?? 0,
		onChangePage: page => setPage(page),
		onChangeRowsPerPage: limit => setInForm('limit', limit)
	};

	const columns = [
		{
			name: 'fio',
			label: 'Наименование',
			options: {
				customBodyRenderLite: dataIndex => {
					const { name } = data[dataIndex];
					return name ?? '—';
				}
			}
		},
		{
			name: 'actions',
			label: 'Действия',
			options: {
				setCellHeaderProps: () => ({ style: { textAlign: 'right' } }),
				customBodyRenderLite: dataIndex => {
					const { uuid } = data[dataIndex];
					return (
						<div className="flex justify-end">
							<IconButton
								aria-label="Редактировать диагноз"
								onClick={() =>
									modalPromise.open(({ onClose }) => (
										<ModalDiagnosis
											onClose={onClose}
											isOpen
											isCancelModal
											diagnosisUuid={uuid}
											initialValues={{
												name: data[dataIndex]?.name,
												medicaments: data[dataIndex]?.medicaments,
												services: data[dataIndex]?.services
											}}
										/>
									))
								}
							>
								<EditIcon />
							</IconButton>
							<IconButton
								aria-label="Удалить диагноз"
								onClick={() => {
									openModalConfirm({
										title: 'Удалить диагноз?',
										onSuccess: () => handleOnDelete(uuid)
									});
								}}
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
				<DataTable data={data} columns={columns} options={tableOptions} />
			)}
		</div>
	);
}
