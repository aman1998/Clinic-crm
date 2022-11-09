import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from '@lodash';
import { FormHelperText, IconButton, MenuItem, TableCell, TableRow } from '@material-ui/core';
import { Add as AddIcon, Delete as DeleteIcon } from '@material-ui/icons';
import { Amount, Button, DataTable, ServerAutocomplete, TextField } from '../../bizKITUi';
import { useAlert, useConfirm } from '../../hooks';
import { productsService } from '../../services';
import { normalizeNumberType } from '../../utils/normalizeNumber';

export function TableMedications({ readOnly, medications, onChange, onClick, showBtn }) {
	const { alertError } = useAlert();
	const [openModalConfirm] = useConfirm();
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [count, setCount] = useState(1);
	const [errorMessage, setErrorMessage] = useState('');
	const [factCountNullChanged, setFactCountNullChanged] = useState(false);

	useEffect(() => {
		_.each(medications, item => {
			if (item.fact_count === 0 && !factCountNullChanged) item.fact_count = item.plan_count;
			if (item.fact_count === 0 && factCountNullChanged) item.fact_count = 0;
		});
		if (factCountNullChanged) setFactCountNullChanged(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [medications]);

	const handleOnAdd = () => {
		if (medications.some(item => item.product.uuid === selectedProduct.uuid)) {
			setErrorMessage('Медикамент уже добавлен в таблицу');
			return;
		}
		if (count < 1) {
			setErrorMessage('Количество не может быть меньше одного');
			return;
		}
		onChange([
			...medications,
			{
				product: selectedProduct,
				cost: selectedProduct.sale_price,
				minimum_unit_of_measure: selectedProduct.minimum_unit_of_measure,
				packing_unit: selectedProduct.packing_unit,
				amount_in_package: selectedProduct.amount_in_package,
				packing: selectedProduct.minimum_unit_of_measure,
				plan_count: 0,
				fact_count: Number(count)
			}
		]);
		setErrorMessage('');
		setSelectedProduct(null);
		setCount(1);
	};

	const handleOnDelete = item => {
		if (item.plan_count > 0) {
			alertError('Нельзя удалить медикамент который был в изначальном плане');
			return;
		}
		const newMedications = medications.filter(({ product }) => product.uuid !== item.product.uuid);

		onChange(newMedications);
	};

	const handleOnChangeFactCount = (event, dataIndex, product) => {
		const value = Number(event.target.value);
		const newList = medications.map((item, idx) => {
			if (idx === dataIndex) {
				return { ...product, fact_count: value };
			}
			return item;
		});
		if (value === 0) setFactCountNullChanged(true);
		onChange(newList);
	};

	const handleOnChangeItemPacking = (dataIndex, product) => {
		const newList = medications.map((item, idx) => {
			if (idx === dataIndex) {
				return product;
			}
			return item;
		});
		onChange(newList);
	};

	const columns = [
		{
			name: 'product_name',
			label: 'Медикамент',
			options: {
				customBodyRenderLite: dataIndex => {
					return medications[dataIndex].product.name;
				}
			}
		},
		{
			name: 'sale_price',
			label: 'Цена',
			options: {
				customBodyRenderLite: dataIndex => {
					return <Amount value={medications[dataIndex].product.sale_price} />;
				}
			}
		},
		{
			name: 'packing',
			label: 'Тип Ед.изм.',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = medications[dataIndex];
					const { product } = currentItem;
					const items = productsService.getProductPackingUnits(product);
					return (
						<TextField
							aria-label="Тип единиц измерения"
							select
							value={currentItem.packing.uuid}
							onChange={event =>
								handleOnChangeItemPacking(dataIndex, {
									...currentItem,
									packing: items.find(item => item.uuid === event.target.value)
								})
							}
							onBlur={() => onChange(medications)}
						>
							{items.map(item => (
								<MenuItem key={item.uuid} value={item.uuid}>
									{item.name}
								</MenuItem>
							))}
						</TextField>
					);
				}
			}
		},
		{
			name: 'plan_count',
			label: 'Кол-во план'
		},
		{
			name: 'plan_summ',
			label: 'Сумма план',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = medications[dataIndex];
					const cost = productsService.getProductCost(
						currentItem,
						currentItem.packing,
						currentItem.plan_count,
						currentItem.cost
					);
					return <Amount value={cost} />;
				}
			}
		},
		{
			name: 'fact_count',
			label: 'Кол-во факт',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = medications[dataIndex];
					return (
						<TextField
							InputProps={{ readOnly }}
							value={currentItem.fact_count}
							onChange={event => handleOnChangeFactCount(event, dataIndex, currentItem)}
							onKeyPress={normalizeNumberType}
						/>
					);
				}
			}
		},
		{
			name: 'fact_summ',
			label: 'Сумма факт',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = medications[dataIndex];
					const cost = productsService.getProductCost(
						currentItem,
						currentItem.packing,
						currentItem.fact_count,
						currentItem.cost
					);
					return <Amount value={cost} />;
				}
			}
		},
		{
			name: 'actions',
			label: 'Действия',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = medications[dataIndex];

					return (
						<div className="flex justify-end">
							<IconButton
								className="ml-6"
								aria-label="Удалить продукт из таблицы"
								size="small"
								disabled={readOnly}
								onClick={() =>
									openModalConfirm({
										title: 'Удалить продукт из таблицы?',
										onSuccess: () => handleOnDelete(currentItem)
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
			const sumPlanCount = medications.reduce((prev, current) => prev + current.plan_count, 0) || 0;
			const sumFactCount = medications.reduce((prev, current) => prev + current.fact_count, 0) || 0;
			const sumPlanCost = medications.reduce(
				(prev, current) =>
					prev + productsService.getProductCost(current, current.packing, current.plan_count, current.cost),
				0
			);
			const sumFactCost = medications.reduce(
				(prev, current) =>
					prev + productsService.getProductCost(current, current.packing, current.fact_count, current.cost),
				0
			);

			return (
				<tbody>
					<TableRow className="font-bold">
						<TableCell>Итого</TableCell>
						<TableCell />
						<TableCell />
						<TableCell>{sumPlanCount}</TableCell>
						<TableCell>
							<Amount value={sumPlanCost} />
						</TableCell>
						<TableCell>{sumFactCount}</TableCell>
						<TableCell>
							<Amount value={sumFactCost} />
						</TableCell>
						<TableCell />
					</TableRow>
					{showBtn && (
						<Button
							className="mt-20 mb-20 ml-20"
							variant="outlined"
							color="primary"
							textNormal
							disabled={readOnly}
							onClick={onClick}
						>
							Сохранить
						</Button>
					)}
				</tbody>
			);
		}
	};

	return (
		<>
			<div className="flex">
				<ServerAutocomplete
					value={selectedProduct}
					label="Наименование / артикул"
					name="product"
					fullWidth
					readOnly={readOnly}
					getOptionLabel={option => option.name}
					onFetchList={name_vendor_code_manufacturer =>
						productsService
							.getProducts({
								name_vendor_code_manufacturer,
								limit: 10
							})
							.then(({ data }) => data.results)
					}
					onFetchItem={uuid => productsService.getProduct(uuid).then(({ data }) => data)}
					onChange={setSelectedProduct}
				/>

				<TextField
					className="mx-10 w-1/3"
					label="Кол-во"
					variant="outlined"
					InputProps={{
						readOnly
					}}
					fullWidth
					name="count"
					type="number"
					value={count}
					onChange={event => {
						if (event.target.value >= 0) {
							setCount(event.target.value);
						}
					}}
					onKeyPress={normalizeNumberType}
				/>

				<Button
					color="primary"
					aria-label="Добавить в таблицу"
					disabled={readOnly || !selectedProduct || !count}
					onClick={handleOnAdd}
				>
					<AddIcon />
				</Button>
			</div>

			<FormHelperText error>{errorMessage}</FormHelperText>

			<div className="mt-20">
				<DataTable data={medications} columns={columns} options={options} />
			</div>
		</>
	);
}
TableMedications.defaultProps = {
	readOnly: false
};
TableMedications.propTypes = {
	readOnly: PropTypes.bool,
	medications: PropTypes.arrayOf(
		PropTypes.shape({
			uuid: PropTypes.string,
			product: PropTypes.shape({
				uuid: PropTypes.string.isRequired,
				name: PropTypes.string.isRequired,
				sale_price: PropTypes.number.isRequired,
				minimum_unit_of_measure: PropTypes.shape({
					uuid: PropTypes.string.isRequired,
					name: PropTypes.string.isRequired
				}).isRequired,
				packing_unit: PropTypes.shape({
					uuid: PropTypes.string.isRequired,
					name: PropTypes.string.isRequired
				})
			}),
			packing: PropTypes.shape({
				name: PropTypes.string.isRequired,
				uuid: PropTypes.string.isRequired
			}),
			plan_count: PropTypes.number,
			fact_count: PropTypes.number,
			cost: PropTypes.number.isRequired
		})
	).isRequired,
	onChange: PropTypes.func.isRequired,
	onClick: PropTypes.func.isRequired,
	showBtn: PropTypes.bool.isRequired
};
