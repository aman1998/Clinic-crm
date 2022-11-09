import React, { useContext, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, DataTable, Button, MenuItem } from '../../../../bizKITUi';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ContextMenu } from '../../pages/Warehouse';
import { useDebouncedFilterForm } from '../../../../hooks';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { ModalProduct } from '../../../../common/ModalProduct';
import { getFullName, numberFormat } from '../../../../utils';
import { ModalWaybill } from '../../../../common/ModalWaybill';
import { ENTITY, waybillsService } from '../../../../services';
import { WAYBILL_TYPE_EXPENSE } from '../../../../services/waybills/constants';
import { normalizeNumberType } from '../../../../utils/normalizeNumber';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
	},
	btnReset: {
		display: 'flex',
		justifyContent: 'flex-end',
		marginLeft: 'auto',
		[theme.breakpoints.down(878)]: {
			margin: '0',
			justifyContent: 'flex-start'
		}
	}
}));

const defaultValues = {
	number: '',
	type: '',
	status: '',
	limit: 10,
	offset: 0
};

const waybillsTypeList = waybillsService.getWaybillsTypeList();
const waybillsStatusList = waybillsService.getWaybillsStatusList();

export function ListWarehouseWaybills() {
	const classes = useStyles();

	const { form, debouncedForm, handleChange, getPage, setPage, setInForm, resetForm } = useDebouncedFilterForm(
		defaultValues
	);

	const { isLoading, isError, data } = useQuery([ENTITY.WAYBILL, debouncedForm], ({ queryKey }) =>
		waybillsService.getWaybills(queryKey[1]).then(res => res.data)
	);

	const [isShowModalProduct, setIsShowModalProduct] = useState(false);

	const [isShowModalWaybill, setIsShowModalWaybill] = useState(false);
	const [selectedWaybillUuid, setSelectedWaybillUuid] = useState(null);
	const handleOnCloseModalWaybill = () => {
		setIsShowModalWaybill(false);
		setSelectedWaybillUuid(null);
	};
	const handleOnOpenModalWaybillByUuid = uuid => {
		setIsShowModalWaybill(true);
		setSelectedWaybillUuid(uuid);
	};

	const setMenu = useContext(ContextMenu);
	useEffect(() => {
		setMenu(
			<div className="flex">
				<Button
					textNormal
					variant="outlined"
					className="whitespace-no-wrap mr-10"
					onClick={() => setIsShowModalProduct(true)}
				>
					Добавить товар
				</Button>
				<Button textNormal className="whitespace-no-wrap" onClick={() => setIsShowModalWaybill(true)}>
					Добавить накладную
				</Button>
			</div>
		);

		return () => {
			setMenu(null);
		};
	}, [setMenu]);

	const columns = [
		{
			name: 'number',
			label: '№'
		},
		{
			name: 'type',
			label: 'Тип накладной',
			options: {
				customBodyRenderLite: dataIndex => {
					const type = waybillsService.getWaybillType(data.results[dataIndex].type);

					return type?.name ?? 'Не указано';
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
			name: 'total_cost',
			label: 'Сумма',
			options: {
				customBodyRenderLite: dataIndex => {
					const { sum } = data.results[dataIndex];

					return `${numberFormat.currency(sum)} ₸`;
				}
			}
		},
		{
			name: 'status',
			label: 'Статус',
			options: {
				customBodyRenderLite: dataIndex => {
					const status = waybillsService.getWaybillStatus(data.results[dataIndex].status);

					return status?.name ?? 'Не указано';
				}
			}
		},
		{
			name: 'action',
			label: 'Действие',
			options: {
				customBodyRenderLite: dataIndex => {
					const { uuid } = data.results[dataIndex];

					return (
						<Button
							textNormal
							variant="text"
							color="primary"
							onClick={() => handleOnOpenModalWaybillByUuid(uuid)}
						>
							Подробнее
						</Button>
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

	return (
		<>
			<Paper className="p-12 mb-32">
				<form className={`gap-10 ${classes.form}`}>
					<TextField
						label="Поиск по номеру"
						variant="outlined"
						size="small"
						name="number"
						value={form.number}
						onChange={handleChange}
						onKeyPress={normalizeNumberType}
					/>
					<TextField
						label="Тип"
						type="text"
						variant="outlined"
						size="small"
						name="type"
						select
						value={form.type}
						onChange={handleChange}
					>
						<MenuItem value="">Все</MenuItem>
						{waybillsTypeList.map(item => (
							<MenuItem key={item.type} value={item.type}>
								{item.name}
							</MenuItem>
						))}
					</TextField>

					<TextField
						label="Статус"
						type="text"
						variant="outlined"
						size="small"
						name="status"
						select
						value={form.status}
						onChange={handleChange}
					>
						<MenuItem value="">Все</MenuItem>
						{waybillsStatusList.map(item => (
							<MenuItem key={item.type} value={item.type}>
								{item.name}
							</MenuItem>
						))}
					</TextField>

					<div className={classes.btnReset}>
						<Button textNormal color="primary" variant="outlined" onClick={() => resetForm()}>
							Сбросить
						</Button>
					</div>
				</form>
			</Paper>

			{isLoading ? (
				<FuseLoading />
			) : isError ? (
				<ErrorMessage />
			) : (
				<DataTable data={data.results} columns={columns} options={tableOptions} />
			)}

			{isShowModalProduct && <ModalProduct isOpen onClose={() => setIsShowModalProduct(false)} />}

			{isShowModalWaybill && (
				<ModalWaybill
					count={data?.count}
					isOpen
					waybillUuid={selectedWaybillUuid}
					onClose={handleOnCloseModalWaybill}
				/>
			)}
		</>
	);
}
