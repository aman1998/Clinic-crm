import React, { useEffect, useContext } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import clsx from 'clsx';
import moment from 'moment';
import { IconButton } from '@material-ui/core';
import { Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';
import { PRODUCT_PROMOTION_STATUS_TYPE_DISABLED } from 'app/services/products/constants';
import { ModalPromotion } from '../ModalPromotion';
import { ContextMenu } from '../../pages/Warehouse';
import { Button, DataTable } from '../../../../bizKITUi';
import { useConfirm, useToolbarTitle, useAlert, useDebouncedFilterForm } from '../../../../hooks';
import { ENTITY, ENTITY_DEPS, productsService } from '../../../../services';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { modalPromise } from '../../../../common/ModalPromise';

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
		productsService.getProductPromotions(queryKey[1])
	);

	const deletePromotion = useMutation(uuid => productsService.deleteProductPromotion(uuid));
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
					const { type } = data?.data.results[dataIndex];
					return productsService.getProductPromotionTypeNameByType(type);
				}
			}
		},
		{
			name: 'date_time_start',
			label: 'Дата начала',
			options: {
				customBodyRenderLite: dataIndex => {
					const { date_time_start } = data?.data.results[dataIndex];
					return moment(date_time_start).format('DD.MM.YYYY');
				}
			}
		},
		{
			name: 'date_time_end',
			label: 'Дата окончания',
			options: {
				customBodyRenderLite: dataIndex => {
					const { date_time_end } = data?.data.results[dataIndex];
					return date_time_end ? moment(date_time_end).format('DD.MM.YYYY') : '∞';
				}
			}
		},
		{
			name: 'status',
			label: 'Статус',
			options: {
				customBodyRenderLite: dataIndex => {
					const { status } = data?.data.results[dataIndex];
					return (
						<span className={clsx({ 'text-error': status === PRODUCT_PROMOTION_STATUS_TYPE_DISABLED })}>
							{productsService.getProductPromotionStatusNameByType(status)}
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
					const { uuid } = data?.data.results[dataIndex];
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
	return <DataTable data={data?.data?.results} columns={columns} options={tableOptions} />;
}
