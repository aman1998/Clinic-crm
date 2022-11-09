import React, { useState, useEffect } from 'react';
import { IconButton, TableBody, TableCell, TableRow, FormHelperText, makeStyles } from '@material-ui/core';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';
import PropTypes from 'prop-types';
import { Button, DataTable, TextField, Autocomplete, Amount, MenuItem } from '../../bizKITUi';
import { useSearchProductsRemnants } from '../hooks/useSearchProductsRemnants';
import { TYPE_WAREHOUSE_LABORATORY } from '../../services/warehouses/constants';
import { useStateForm, useConfirm } from '../../hooks';
import { productsService } from '../../services';
import { normalizeNumberType } from '../../utils/normalizeNumber';

const useStyles = makeStyles(theme => ({
	table: {
		display: 'grid',
		gridTemplateColumns: '2fr 1fr 1fr 1fr',
		[theme.breakpoints.down(767)]: {
			gridTemplateColumns: '2fr 1fr 1fr'
		},
		[theme.breakpoints.down(500)]: {
			gridTemplateColumns: '1fr'
		}
	},
	btn: {
		display: 'flex',
		marginLeft: 'auto',
		width: '64px',
		[theme.breakpoints.down(767)]: {
			margin: '0'
		}
	}
}));

export function TableProducts({ initialList: list, isEdit, onChange }) {
	const classes = useStyles();

	const [openModalConfirm] = useConfirm();
	const { form, handleChange, setInForm } = useStateForm({
		amount: '',
		packing: ''
	});

	const {
		status: statusSearchProductsRemnants,
		actions: actionsSearchProductsRemnants,
		data: dataSearchProductsRemnants
	} = useSearchProductsRemnants();

	const selectedProductPacking = productsService.getProductPackingUnits(dataSearchProductsRemnants.value);

	const [errorMessage, setErrorMessage] = useState('');
	useEffect(() => {
		setErrorMessage('');

		if (!form.amount || !dataSearchProductsRemnants.value) {
			return;
		}

		const totalRemnants = Number(dataSearchProductsRemnants.value?.total_remnants);

		if (form.amount <= totalRemnants) {
			return;
		}

		setErrorMessage(`Количество медикамента недостаточно на складе (Сейчас в наличии: ${totalRemnants})`);
	}, [dataSearchProductsRemnants.value, form.amount]);

	const [isEditItem, setIsEditItem] = useState(false);
	const handleOnSeEditItem = index => {
		const item = list[index];

		setIsEditItem(true);
		actionsSearchProductsRemnants.getByUuid(item.productUuid, { warehouse_type: TYPE_WAREHOUSE_LABORATORY });
		setInForm('amount', item.amount);
		setInForm('packing', item.packing.uuid);
	};

	const refreshState = () => {
		actionsSearchProductsRemnants.setValue(null);
		setInForm('amount', '');
		setInForm('packing', '');
		setIsEditItem(false);
	};

	const handleOnAddInList = () => {
		const productUuid = dataSearchProductsRemnants.value.uuid;
		const hasInProductList = list.some(item => item.productUuid === productUuid);

		if (hasInProductList) {
			setErrorMessage('Медикамент уже добавлен в таблицу');
			return;
		}

		const newItem = {
			productUuid,
			name: dataSearchProductsRemnants.value.name,
			amount: Number(form.amount),
			cost: Number(dataSearchProductsRemnants.value.sale_price),
			packing: selectedProductPacking.find(unit => unit.uuid === form.packing),
			minimum_unit_of_measure: dataSearchProductsRemnants.value.minimum_unit_of_measure,
			packing_unit: dataSearchProductsRemnants.value.packing_unit,
			amount_in_package: dataSearchProductsRemnants.value.amount_in_package
		};
		const newList = [...list, newItem];

		refreshState();
		onChange(newList);
	};

	const handleOnDeleteItem = index => {
		const newList = list.slice();

		newList.splice(index, 1);
		onChange(newList);
	};

	const handleOnEditItem = () => {
		const newList = list.slice();
		const findIndex = list.findIndex(item => item.productUuid === dataSearchProductsRemnants.value?.uuid);
		newList[findIndex].amount = Number(form.amount);
		newList[findIndex].packing = selectedProductPacking.find(unit => unit.uuid === form.packing);
		onChange(newList);
		refreshState();
	};

	const isDisabledButton =
		!isEdit || !form.packing || !dataSearchProductsRemnants.value || !(form.amount > 0) || !!errorMessage;

	const columns = [
		{
			name: 'name',
			label: 'Медикамент'
		},
		{
			name: 'amount',
			label: 'Количество'
		},
		{
			name: 'packing',
			label: 'Ед.изм.',
			options: {
				customBodyRenderLite: dataIndex => {
					const { packing } = list[dataIndex];
					return packing.name;
				}
			}
		},
		{
			name: 'cost',
			label: 'Цена',
			options: {
				customBodyRenderLite: dataIndex => {
					const { cost } = list[dataIndex];
					return <Amount value={cost} />;
				}
			}
		},
		{
			name: 'total',
			label: 'Сумма',
			options: {
				customBodyRenderLite: dataIndex => {
					const product = list[dataIndex];
					return (
						<Amount
							value={productsService.getProductCost(
								product,
								product.packing,
								product.amount,
								product.cost
							)}
						/>
					);
				}
			}
		},
		{
			name: 'actions',
			label: 'Действия',
			options: {
				setCellHeaderProps: () => ({ style: { display: 'flex', justifyContent: 'flex-end' } }),
				customBodyRenderLite: dataIndex => {
					return (
						<div className="flex justify-end">
							<IconButton
								aria-label="Редактировать медикамент"
								disabled={!isEdit || isEditItem}
								onClick={() => handleOnSeEditItem(dataIndex)}
							>
								<EditIcon />
							</IconButton>
							<IconButton
								aria-label="Удалить медикамент"
								disabled={!isEdit || isEditItem}
								onClick={() =>
									openModalConfirm({
										title: 'Удалить медикамент?',
										onSuccess: () => handleOnDeleteItem(dataIndex)
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
		elevation: 0,
		pagination: false,
		responsive: 'standard',
		customTableBodyFooterRender() {
			const totalCost = list.reduce(
				(prev, current) =>
					prev + productsService.getProductCost(current, current.packing, current.amount, current.cost),
				0
			);
			const totalAmount = list.reduce((prev, current) => prev + current.amount, 0);

			return (
				list.length > 0 && (
					<TableBody>
						<TableRow>
							<TableCell className="font-bold">Итого</TableCell>
							<TableCell className="font-bold">{totalAmount}</TableCell>
							<TableCell />
							<TableCell />
							<TableCell className="font-bold">
								<Amount value={totalCost} />
							</TableCell>
							<TableCell />
						</TableRow>
					</TableBody>
				)
			);
		}
	};

	return (
		<>
			<div className={`gap-10 ${classes.table}`}>
				<Autocomplete
					isLoading={statusSearchProductsRemnants.isLoading}
					options={dataSearchProductsRemnants.listProductRemnant}
					getOptionLabel={option => option.name}
					renderOption={option => <>{`${option.name} (остаток: ${option.total_remnants})`}</>}
					readOnly={isEditItem || !isEdit}
					filterOptions={options => options}
					getOptionSelected={(option, value) => option.uuid === value.uuid}
					onOpen={() =>
						actionsSearchProductsRemnants.update(dataSearchProductsRemnants.keyword, {
							warehouse_type: TYPE_WAREHOUSE_LABORATORY
						})
					}
					onInputChange={(_, newValue) =>
						actionsSearchProductsRemnants.update(newValue, {
							warehouse_type: TYPE_WAREHOUSE_LABORATORY
						})
					}
					onChange={(_, value) => {
						actionsSearchProductsRemnants.setValue(value);
						setInForm('packing', '');
					}}
					value={dataSearchProductsRemnants.value}
					fullWidth
					renderInput={params => <TextField {...params} label="Медикамент" variant="outlined" />}
				/>
				<TextField
					label="Кол-во"
					variant="outlined"
					fullWidth
					name="amount"
					InputProps={{
						readOnly: !isEdit
					}}
					value={form.amount}
					onChange={handleChange}
					onKeyPress={normalizeNumberType}
				/>
				<TextField
					select
					label="Ед.изм."
					variant="outlined"
					fullWidth
					name="packing"
					InputProps={{
						readOnly: !isEdit || !dataSearchProductsRemnants.value
					}}
					value={dataSearchProductsRemnants.value ? form.packing : ''}
					onChange={handleChange}
				>
					<MenuItem disabled value="">
						Не выбрано
					</MenuItem>
					{selectedProductPacking.map(item => (
						<MenuItem key={item.uuid} value={item.uuid}>
							{item.name}
						</MenuItem>
					))}
				</TextField>

				{isEditItem ? (
					<Button
						className={classes.btn}
						color="primary"
						aria-label="Редактировать"
						disabled={isDisabledButton}
						onClick={handleOnEditItem}
					>
						<EditIcon />
					</Button>
				) : (
					<Button
						className={classes.btn}
						color="primary"
						aria-label="Добавить в таблицу"
						disabled={isDisabledButton}
						onClick={handleOnAddInList}
					>
						<AddIcon />
					</Button>
				)}
			</div>
			<FormHelperText error>{errorMessage}</FormHelperText>

			<div className="mt-20">
				<DataTable columns={columns} options={tableOptions} data={list} />
			</div>
		</>
	);
}
TableProducts.defaultProps = {
	isEdit: true,
	onChange: () => {}
};
TableProducts.propTypes = {
	isEdit: PropTypes.bool,
	initialList: PropTypes.arrayOf(
		PropTypes.shape({
			productUuid: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
			amount: PropTypes.number.isRequired,
			cost: PropTypes.number.isRequired
		})
	).isRequired,
	onChange: PropTypes.func
};
