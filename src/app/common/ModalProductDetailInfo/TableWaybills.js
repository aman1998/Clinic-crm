import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import moment from 'moment';
import { IconButton, Typography } from '@material-ui/core';
import { Visibility as VisibilityIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useDebouncedFilterForm } from '../../hooks';
import { ErrorMessage } from '../ErrorMessage';
import FuseLoading from '../../../@fuse/core/FuseLoading';
import { getFullName, numberFormat } from '../../utils';
import { DataTable, TextField, DatePickerField, MenuItem } from '../../bizKITUi';
import { ENTITY, waybillsService } from '../../services';
import { WAYBILL_TYPE_EXPENSE, WAYBILL_STATUS_COMPLETED } from '../../services/waybills/constants';
import { ModalWaybill } from '../ModalWaybill';
import {
	TYPE_WAREHOUSE_COMMON,
	TYPE_WAREHOUSE_HOSPITAL,
	TYPE_WAREHOUSE_LABORATORY
} from '../../services/warehouses/constants';

const useStyles = makeStyles(theme => ({
	waybillsWrapper: {
		display: 'flex',
		justifyContent: 'justify-between',
		marginLeft: '10px',
		[theme.breakpoints.down(1200)]: {
			flexDirection: 'column'
		}
	},
	waybills: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 200px))',
		width: '100%',
		[theme.breakpoints.down(1200)]: {
			marginTop: '16px'
		}
	},
	itemFilter: {
		width: 200,
		minWidth: 200
	}
}));

const waybillsTypeList = waybillsService.getWaybillsTypeList();

export function TableWaybills({ productUuid, warehouseType, warehouseResponsible }) {
	const classes = useStyles();

	const { form, debouncedForm, setInForm, getPage, setPage } = useDebouncedFilterForm({
		type: '',
		updated_at_from: null,
		updated_at_to: null,
		product: productUuid,
		status: WAYBILL_STATUS_COMPLETED,
		warehouse_type: warehouseType,
		warehouse_responsible: warehouseResponsible,
		limit: 10,
		offset: 0
	});

	const { isLoading, isError, data } = useQuery([ENTITY.WAYBILL, debouncedForm], ({ queryKey }) =>
		waybillsService.getWaybills(queryKey[1]).then(res => res.data)
	);

	const handleOnApplyFilter = (name, value) => {
		setInForm(name, value);
	};

	const [selectedWaybillUuid, setSelectedWaybillUuid] = useState(null);

	const columns = [
		{
			name: 'number',
			label: '№'
		},
		{
			name: 'type',
			label: 'Тип',
			options: {
				customBodyRenderLite: dataIndex => {
					const type = waybillsService.getWaybillType(data.results[dataIndex].type);

					return type?.name ?? 'Не указано';
				}
			}
		},
		{
			name: 'updated_at',
			label: 'Дата',
			options: {
				customBodyRenderLite: dataIndex => {
					const { updated_at } = data.results[dataIndex];

					return updated_at ? moment(updated_at).format('DD.MM.YYYY') : 'Не указано';
				}
			}
		},
		{
			name: 'sender',
			label: 'Отправитель',
			options: {
				customBodyRenderLite: dataIndex => {
					const { sender } = data.results[dataIndex];

					return sender?.name ?? 'Не указано';
				}
			}
		},
		{
			name: 'recipient',
			label: 'Получатель',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];
					let name;

					if (currentItem.type === WAYBILL_TYPE_EXPENSE) {
						name = getFullName({
							lastName: currentItem.recipient?.last_name,
							firstName: currentItem.recipient?.first_name
						});
					} else {
						name = currentItem.recipient?.name;
					}

					return name ?? 'Не указано';
				}
			}
		},
		{
			name: 'amount',
			label: 'Кол-во',
			options: {
				customBodyRenderLite: dataIndex => {
					const { items } = data.results[dataIndex];
					const currentProduct = items.find(item => item.product.uuid === productUuid);

					return currentProduct?.fact_amount ?? 'Не указано';
				}
			}
		},
		{
			name: 'packing',
			label: 'Ед.изм.',
			options: {
				customBodyRenderLite: dataIndex => {
					const { items } = data.results[dataIndex];
					const currentProduct = items.find(item => item.product.uuid === productUuid);

					return currentProduct?.packing.name;
				}
			}
		},
		{
			name: 'total_cost',
			label: 'Сумма',
			options: {
				customBodyRenderLite: dataIndex => {
					const { items } = data.results[dataIndex];
					const currentProduct = items.find(item => item.product.uuid === productUuid);
					const sum = currentProduct.fact_amount * currentProduct.fact_cost;

					return <div className="whitespace-no-wrap">{`${numberFormat.currency(sum)} ₸`}</div>;
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
								aria-label="Открыть информацию о продукте"
								variant="text"
								onClick={() => setSelectedWaybillUuid(uuid)}
							>
								<VisibilityIcon fontSize="inherit" />
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

	return isLoading ? (
		<FuseLoading />
	) : isError ? (
		<ErrorMessage />
	) : (
		<>
			<div className={classes.waybillsWrapper}>
				<Typography color="secondary" className="text-xl mb-24">
					Накладные
				</Typography>

				<div className={`gap-10 ${classes.waybills}`}>
					<TextField
						label="Тип"
						type="text"
						variant="outlined"
						size="small"
						name="type"
						fullWidth
						select
						value={form.type}
						onChange={event => handleOnApplyFilter('type', event.target.value)}
					>
						<MenuItem value="">Все</MenuItem>
						{waybillsTypeList.map(item => (
							<MenuItem key={item.type} value={item.type}>
								{item.name}
							</MenuItem>
						))}
					</TextField>

					<DatePickerField
						label="Дата от"
						inputVariant="outlined"
						fullWidth
						onlyValid
						size="small"
						value={form.updated_at_from}
						onChange={date => handleOnApplyFilter('updated_at_from', date)}
					/>

					<DatePickerField
						label="Дата до"
						inputVariant="outlined"
						fullWidth
						onlyValid
						size="small"
						value={form.updated_at_to}
						onChange={date => handleOnApplyFilter('updated_at_to', date)}
					/>
				</div>
			</div>

			<DataTable data={data.results} columns={columns} options={tableOptions} />

			{selectedWaybillUuid && (
				<ModalWaybill isOpen onClose={() => setSelectedWaybillUuid(null)} waybillUuid={selectedWaybillUuid} />
			)}
		</>
	);
}
TableWaybills.defaultProps = {
	warehouseType: null,
	warehouseResponsible: null
};
TableWaybills.propTypes = {
	productUuid: PropTypes.string.isRequired,
	warehouseType: PropTypes.oneOf([TYPE_WAREHOUSE_HOSPITAL, TYPE_WAREHOUSE_COMMON, TYPE_WAREHOUSE_LABORATORY]),
	warehouseResponsible: PropTypes.string
};
