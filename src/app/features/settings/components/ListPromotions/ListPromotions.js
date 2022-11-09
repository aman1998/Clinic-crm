import React, { useEffect, useContext } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import clsx from 'clsx';
import moment from 'moment';
import { IconButton } from '@material-ui/core';
import { Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';
import { ContextMenu } from '../../pages/Settings';
import { Button, DataTable } from '../../../../bizKITUi';
import { useConfirm, useToolbarTitle, useAlert, useDebouncedFilterForm } from '../../../../hooks';
import { financeService, ENTITY, ENTITY_DEPS } from '../../../../services';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { modalPromise } from '../../../../common/ModalPromise';
import { ModalPromotion } from '../ModalPromotion';
import { PROMOTION_STATUS_COMPLETED } from '../../../../services/finance/constants';

const defaultValues = {
	limit: 10,
	offset: 0
};

export function ListPromotions() {
	const { alertSuccess, alertError } = useAlert();
	const [openModalConfirm] = useConfirm();
	const queryClient = useQueryClient();

	useToolbarTitle('Программа лояльности');

	const setMenu = useContext(ContextMenu);
	useEffect(() => {
		setMenu(
			<Button
				textNormal
				className="whitespace-no-wrap ml-10"
				onClick={() => modalPromise.open(({ onClose }) => <ModalPromotion isOpen onClose={onClose} />)}
			>
				Добавить акцию
			</Button>
		);
	}, [setMenu]);

	const { form, debouncedForm, setInForm, getPage, setPage } = useDebouncedFilterForm(defaultValues);
	const { isLoading, isError, data } = useQuery([ENTITY.PROMOTION, debouncedForm], ({ queryKey }) =>
		financeService.getPromotions(queryKey[1])
	);

	const deletePromotion = useMutation(uuid => financeService.deletePromotion(uuid));
	const handleOnDelete = uuid => {
		deletePromotion
			.mutateAsync(uuid)
			.then(() => {
				ENTITY_DEPS.PROMOTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Акция успешно удалена');
			})
			.catch(() => {
				alertError('Не удалось удалить акцию');
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
					return financeService.getPromotionTypeNameByType(type);
				}
			}
		},
		{
			name: 'date_time_start',
			label: 'Дата начала',
			options: {
				customBodyRenderLite: dataIndex => {
					const { date_time_start } = data.results[dataIndex];
					return moment(date_time_start).format('DD.MM.YYYY');
				}
			}
		},
		{
			name: 'date_time_end',
			label: 'Дата окончания',
			options: {
				customBodyRenderLite: dataIndex => {
					const { date_time_end } = data.results[dataIndex];
					return date_time_end ? moment(date_time_end).format('DD.MM.YYYY') : '∞';
				}
			}
		},
		{
			name: 'status',
			label: 'Статус',
			options: {
				customBodyRenderLite: dataIndex => {
					const { status } = data.results[dataIndex];
					return (
						<span className={clsx({ 'text-error': status === PROMOTION_STATUS_COMPLETED })}>
							{financeService.getPromotionStatusNameByType(status)}
						</span>
					);
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
								aria-label="Редактировать акцию"
								onClick={() =>
									modalPromise.open(({ onClose }) => (
										<ModalPromotion promotionUuid={uuid} isOpen onClose={onClose} />
									))
								}
							>
								<EditIcon />
							</IconButton>
							<IconButton
								aria-label="Удалить акцию"
								onClick={() =>
									openModalConfirm({
										title: 'Удалить акцию?',
										onSuccess: () => handleOnDelete(uuid)
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

	if (isLoading) {
		return <FuseLoading />;
	}
	if (isError) {
		return <ErrorMessage />;
	}
	return <DataTable data={data.results} columns={columns} options={tableOptions} />;
}
