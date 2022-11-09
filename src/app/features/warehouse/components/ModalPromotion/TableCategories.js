import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormHelperText, IconButton } from '@material-ui/core';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';
import { Button, DataTable, ServerAutocomplete } from '../../../../bizKITUi';
import { useStateForm, useConfirm } from '../../../../hooks';
import { productsService, warehousesService } from '../../../../services';

export function TableCategories({ categories = [], onChange }) {
	const [openModalConfirm] = useConfirm();
	const { form, setInForm, resetForm } = useStateForm({
		wareHouse: null,
		category: null,
		service: null
	});

	const [editItemIndex, setEditItemIndex] = useState(null);
	const [tableData, setTableData] = useState([]);
	const isEditItem = editItemIndex !== null;

	const [errorMessage, setErrorMessage] = useState('');

	const handleEditItem = index => {
		setEditItemIndex(index);
		setInForm('wareHouse', categories[index][0]);
		setInForm('category', categories[index][1]);
		setErrorMessage('');
	};

	const handleOnAddInList = () => {
		const wareHouseUuid = form.wareHouse?.uuid;
		const hasInProductList = categories.some(item => item === wareHouseUuid);

		if (hasInProductList) {
			setErrorMessage('Услуга уже добавлена в таблицу');

			return;
		}

		setTableData([...tableData, [form.wareHouse?.name, '']]);

		resetForm();
		setEditItemIndex(null);
		onChange([...categories, form.wareHouse.uuid]);
		setErrorMessage('');
	};

	const handleOnDeleteItem = index => {
		onChange(categories.filter((_, idx) => idx !== index));
	};

	const handleChangeEditedItem = () => {
		const newList = categories.slice();

		newList[editItemIndex] = form.service;
		resetForm();
		setEditItemIndex(null);
		onChange(newList);
		setErrorMessage('');
	};

	const isDisabledAddButton = !form.wareHouse || !form.category;
	const isDisabledEditButton = !form.wareHouse || !form.category;

	const columns = [
		{
			name: 'wareHouse',
			label: 'Склад'
		},
		{
			name: 'categories',
			label: 'Категория'
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
					value={form.category}
					getOptionLabel={option => option.name}
					label="Категория"
					className="ml-16"
					fullWidth
					onChange={value => {
						setInForm('category', value);
						setInForm('service', null);
					}}
					onFetchList={(search, limit) =>
						productsService.getProductCategories({ search, limit }).then(res => res.data)
					}
					onFetchItem={uuid => productsService.getProductCategory(uuid).then(res => res.data)}
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

TableCategories.propTypes = {
	categories: PropTypes.arrayOf(
		PropTypes.shape({
			uuid: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
			wareHouse: PropTypes.shape({
				uuid: PropTypes.string.isRequired
			}).isRequired
		})
	).isRequired,
	onChange: PropTypes.func.isRequired
};
