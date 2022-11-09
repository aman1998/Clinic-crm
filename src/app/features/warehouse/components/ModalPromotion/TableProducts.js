import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormHelperText, IconButton } from '@material-ui/core';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';
import { Button, DataTable, ServerAutocomplete } from '../../../../bizKITUi';
import { useStateForm, useConfirm } from '../../../../hooks';
import { productsService, warehousesService } from '../../../../services';

export function TableProducts({ products = [], onChange }) {
	const [openModalConfirm] = useConfirm();
	const { form, setInForm, resetForm } = useStateForm({
		product: null,
		wareHouse: null,
		service: null
	});

	const [editItemIndex, setEditItemIndex] = useState(null);
	const [tableData, setTableData] = useState([]);
	const isEditItem = editItemIndex !== null;
	const handleEditItem = index => {
		setEditItemIndex(index);
	};

	const [errorMessage, setErrorMessage] = useState('');

	const handleOnAddInList = () => {
		const productName = form.product?.name;
		const wareHouseName = form.wareHouse?.name;
		const productUuid = form.product?.uuid;
		const hasInProductList = products.some(item => productUuid === item);

		if (hasInProductList) {
			setErrorMessage('Услуга уже добавлена в таблицу');

			return;
		}

		setTableData([...tableData, [wareHouseName, productName]]);

		onChange([...products, productUuid]);
		resetForm();
		setEditItemIndex(null);
		setErrorMessage('');
	};

	const handleOnDeleteItem = index => {
		onChange(products.filter((_, idx) => idx !== index));
		setTableData(tableData.filter((_, idx) => idx !== index));
	};

	const handleChangeEditedItem = () => {
		const productName = form.product?.name;
		const wareHouseName = form.wareHouse?.name;
		const productUuid = form.product?.uuid;
		const newList = products.slice();
		const newTableData = tableData.slice();
		newTableData.splice(editItemIndex, 1, [wareHouseName, productName]);

		const hasInProductList = products.some(item => productUuid === item);

		if (hasInProductList) {
			setErrorMessage('Услуга уже добавлена в таблицу');

			return;
		}

		setTableData(newTableData);
		onChange(newList.splice(editItemIndex, 1, form.product?.uuid));
		setEditItemIndex(null);
		resetForm();
		setErrorMessage('');
	};

	const isDisabledAddButton = !form.product || !form.wareHouse;
	const isDisabledEditButton = !form.product || !form.wareHouse;

	const columns = [
		{
			name: 'wareHouse',
			label: 'Склад'
		},
		{
			name: 'product',
			label: 'Товар'
		},
		{
			name: 'actions',
			label: 'Действия',
			options: {
				setCellHeaderProps: () => ({ style: { textAlign: 'right' } }),
				customBodyRenderLite: dataIndex => {
					return (
						<div className="flex justify-end">
							<IconButton
								aria-label="Редактировать услугу"
								disabled={isEditItem}
								onClick={() => handleEditItem(dataIndex)}
							>
								<EditIcon />
							</IconButton>
							<IconButton
								aria-label="Удалить услугу"
								disabled={isEditItem}
								edge="end"
								onClick={() =>
									openModalConfirm({
										title: 'Удалить услугу из таблицы?',
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
		responsive: 'standard'
	};

	return (
		<>
			<div className="flex">
				<ServerAutocomplete
					value={form.wareHouse}
					getOptionLabel={option => option.name}
					label="Склад"
					fullWidth
					onChange={value => {
						setInForm('wareHouse', value);
						setInForm('service', null);
					}}
					onFetchList={(search, limit) => warehousesService.getWarehouses({ search, limit })}
					onFetchItem={uuid => warehousesService.getWarehouse(uuid).then(res => res.data)}
				/>

				<ServerAutocomplete
					value={form.product}
					getOptionLabel={option => option.name}
					disabled={!form.wareHouse}
					className="ml-16"
					label="Товар"
					fullWidth
					onChange={value => {
						setInForm('product', value);
						setInForm('service', null);
					}}
					onFetchList={(search, limit) =>
						productsService.getProducts({ search, limit }).then(res => res.data)
					}
					onFetchItem={uuid => productsService.getProduct(uuid).then(res => res.data)}
				/>
				{isEditItem ? (
					<Button
						color="primary"
						aria-label="Редактировать"
						className="ml-16"
						disabled={isDisabledEditButton}
						onClick={handleChangeEditedItem}
					>
						<EditIcon />
					</Button>
				) : (
					<Button
						color="primary"
						aria-label="Добавить в таблицу"
						className="ml-16"
						disabled={isDisabledAddButton}
						onClick={handleOnAddInList}
					>
						<AddIcon />
					</Button>
				)}
			</div>
			<FormHelperText error>{errorMessage}</FormHelperText>

			<div className="mt-20">
				<DataTable columns={columns} options={tableOptions} data={tableData} />
			</div>
		</>
	);
}

TableProducts.propTypes = {
	products: PropTypes.arrayOf(
		PropTypes.shape({
			uuid: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired
		})
	).isRequired,
	onChange: PropTypes.func.isRequired
};
