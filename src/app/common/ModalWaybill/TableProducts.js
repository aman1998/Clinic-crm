import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton, TableCell, TableRow, TextField } from '@material-ui/core';
import { Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';
import { useFormContext } from 'react-hook-form';
import { PACKAGE_TYPE_PACK, PACKAGE_TYPE_PIECE } from '../../services/packages/constants';
import { DataTable, Amount } from '../../bizKITUi';
import { useConfirm } from '../../hooks';
import {
	WAYBILL_TYPE_ACCEPTANCE,
	WAYBILL_TYPE_EXPENSE,
	WAYBILL_TYPE_MOVING,
	WAYBILL_TYPE_WRITE_OFF,
	WAYBILL_STATUS_PLAN,
	WAYBILL_STATUS_ACCEPTED,
	WAYBILL_STATUS_REWORK,
	WAYBILL_STATUS_COMPLETED
} from '../../services/waybills/constants';
import { productsService } from '../../services';

const useStyles = makeStyles(theme => ({
	amountInput: {
		maxWidth: 50
	},
	costInput: {
		minWidth: 90
	},
	sumRow: {
		width: '100%',
		backgroundColor: '#F5F5F5'
	},
	sumLabel: {
		fontWeight: 'bold',
		color: theme.palette.secondary.main
	}
}));

export function TableProducts({ isEdit, initialList, onEditItem, onDeleteItem, onChangeList, isCreatedBySystem }) {
	const classes = useStyles();
	const [openModalConfirm] = useConfirm();
	const { watch } = useFormContext();

	const { type: waybillType, status: waybillStatus } = watch(['type', 'status']);

	const waybillStatusIsEmpty = waybillStatus === '';
	const waybillStatusIsPlan = waybillStatus === WAYBILL_STATUS_PLAN;
	const waybillStatusIsRework = waybillStatus === WAYBILL_STATUS_REWORK;
	const waybillStatusIsActive = waybillStatus === WAYBILL_STATUS_ACCEPTED;
	const waybillStatusIsCompleted = waybillStatus === WAYBILL_STATUS_COMPLETED;

	const [list, setList] = useState(initialList);
	useEffect(() => {
		if (!initialList) {
			return;
		}
		setList(initialList);
	}, [initialList]);

	const handleOnChangeItemInList = (index, item) => {
		list.splice(index, 1, item);

		setList([...list]);
	};

	const renderTitles = {
		[WAYBILL_TYPE_ACCEPTANCE]: {
			plan: 'Кол-во по закупу',
			fact: 'Кол-во принято',
			cost: 'Цена	закупки ₸'
		},
		[WAYBILL_TYPE_EXPENSE]: {
			plan: 'Кол-во на отпуск',
			fact: 'Кол-во отпущено',
			cost: 'Цена	продажи ₸'
		},
		[WAYBILL_TYPE_MOVING]: {
			plan: 'Кол-во для перевода',
			fact: 'Кол-во переведено',
			cost: 'Цена	₸'
		},
		[WAYBILL_TYPE_WRITE_OFF]: {
			plan: 'Кол-во для списания',
			fact: 'Кол-во списано',
			cost: 'Цена	₸'
		}
	}[waybillType];

	const isEditProduct =
		(!isCreatedBySystem && isEdit) ||
		(isEdit && (waybillStatusIsPlan || waybillStatusIsRework || waybillStatusIsEmpty));
	const isEditPlan =
		(!isCreatedBySystem && isEdit) ||
		(isEdit && (waybillStatusIsPlan || waybillStatusIsRework || waybillStatusIsEmpty));

	const columns = [
		{
			name: 'number',
			label: '№',
			options: {
				customBodyRenderLite: dataIndex => {
					return <span>{dataIndex + 1}</span>;
				}
			}
		},
		{
			name: 'name',
			label: 'Наименование'
		},
		{
			name: 'packing',
			label: 'Тип Ед.изм.',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = list[dataIndex];
					return <span>{currentItem.packing.name}</span>;
				}
			}
		},

		{
			name: 'plan_amount',
			label: renderTitles.plan,
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = list[dataIndex];

					return isEditPlan ? (
						<TextField
							className={classes.amountInput}
							aria-label={renderTitles.plan}
							value={currentItem.plan_amount || ''}
							size="small"
							onChange={event =>
								handleOnChangeItemInList(dataIndex, {
									...currentItem,
									plan_amount: Number(event.target.value)
								})
							}
							inputProps={{ pattern: '[0-9]*' }}
							onBlur={() => onChangeList(list)}
						/>
					) : (
						<span>{currentItem.plan_amount}</span>
					);
				}
			}
		},
		{
			name: 'fact_amount',
			label: renderTitles.fact,
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = list[dataIndex];

					return isEditPlan ? (
						<TextField
							className={classes.amountInput}
							aria-label={renderTitles.fact}
							value={currentItem.fact_amount || ''}
							size="small"
							onChange={event =>
								handleOnChangeItemInList(dataIndex, {
									...currentItem,
									fact_amount: Number(event.target.value)
								})
							}
							inputProps={{ pattern: '[0-9]*' }}
							onBlur={() => onChangeList(list)}
						/>
					) : (
						<span>{currentItem.fact_amount}</span>
					);
				}
			}
		},
		{
			name: renderTitles.cost,
			label: 'Цена',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = list[dataIndex];
					return <Amount value={currentItem.plan_cost} />;
				}
			}
		},
		{
			name: 'total',
			label: 'Сумма',
			options: {
				customBodyRenderLite: dataIndex => {
					const product = list[dataIndex];
					const amount =
						waybillStatusIsCompleted || waybillStatusIsActive ? product.fact_amount : product.plan_amount;
					const cost = product.fact_cost ?? product.plan_cost;
					const total = productsService.getProductCost(product, product.packing, amount, cost);

					return <Amount value={total} />;
				}
			}
		},
		{
			name: 'actions',
			label: 'Действия',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = list[dataIndex];

					return (
						<div className="flex justify-end">
							<IconButton
								aria-label="Редактировать продукт"
								size="small"
								disabled={!isEditProduct}
								onClick={() => onEditItem(currentItem.product)}
							>
								<EditIcon fontSize="inherit" />
							</IconButton>

							<IconButton
								className="ml-6"
								aria-label="Удалить продукт из таблицы"
								size="small"
								disabled={!isEditProduct}
								onClick={() =>
									openModalConfirm({
										title: 'Удалить продукт из таблицы?',
										onSuccess: () => onDeleteItem(currentItem)
									})
								}
							>
								<DeleteIcon fontSize="inherit" />
							</IconButton>
						</div>
					);
				}
			}
		}
	];
	const options = {
		pagination: false,
		rowsPerPage: 5,
		rowsPerPageOptions: [5, 10, 15],
		customTableBodyFooterRender() {
			const sumPlanAmount = list.reduce((prev, current) => prev + current.plan_amount, 0) || 0;
			const sumFactAmount = list.reduce((prev, current) => prev + current.fact_amount, 0) || 0;
			const sumFactCost =
				list.reduce((prev, current) => {
					const amount =
						waybillStatusIsCompleted || waybillStatusIsActive ? current.fact_amount : current.plan_amount;
					const cost = current.fact_cost ?? current.plan_cost;
					return prev + productsService.getProductCost(current, current.packing, amount, cost);
				}, 0) || 0;

			return (
				<tbody>
					<TableRow className={classes.sumRow}>
						<TableCell />
						<TableCell className={classes.sumLabel}>Итого</TableCell>
						<TableCell />
						<TableCell>{sumPlanAmount}</TableCell>
						<TableCell>{sumFactAmount}</TableCell>
						<TableCell />
						<TableCell>
							<Amount value={sumFactCost} />
						</TableCell>
						<TableCell />
					</TableRow>
				</tbody>
			);
		}
	};

	return <DataTable data={list} columns={columns} options={options} />;
}
TableProducts.defaultProps = {
	initialList: [],
	onChangeList: () => {},
	isCreatedBySystem: true
};
TableProducts.propTypes = {
	initialList: PropTypes.arrayOf(
		PropTypes.shape({
			name: PropTypes.string.isRequired,
			product: PropTypes.string.isRequired,
			remnants: PropTypes.string,
			manufacturer: PropTypes.string.isRequired,
			provider: PropTypes.string.isRequired,
			plan_amount: PropTypes.number.isRequired,
			fact_amount: PropTypes.number,
			plan_cost: PropTypes.number.isRequired,
			minimum_unit_of_measure: PropTypes.shape({
				uuid: PropTypes.string.isRequired,
				name: PropTypes.string.isRequired,
				type: PropTypes.oneOf([PACKAGE_TYPE_PIECE, PACKAGE_TYPE_PACK])
			}),
			packing: PropTypes.shape({
				uuid: PropTypes.string.isRequired,
				name: PropTypes.string.isRequired,
				type: PropTypes.oneOf([PACKAGE_TYPE_PIECE, PACKAGE_TYPE_PACK])
			}),
			packing_unit: PropTypes.shape({
				uuid: PropTypes.string.isRequired,
				name: PropTypes.string.isRequired,
				type: PropTypes.oneOf([PACKAGE_TYPE_PIECE, PACKAGE_TYPE_PACK])
			}),
			amount_in_package: PropTypes.number
		})
	),
	isEdit: PropTypes.bool.isRequired,
	isCreatedBySystem: PropTypes.bool,
	onChangeList: PropTypes.func,
	onEditItem: PropTypes.func.isRequired,
	onDeleteItem: PropTypes.func.isRequired
};
