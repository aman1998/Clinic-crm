import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormHelperText, IconButton, makeStyles } from '@material-ui/core';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';
import { useConfirm } from 'app/hooks';
import { clinicService } from 'app/services';
import { TYPE_SERVICE_HOSPITAL } from 'app/services/clinic/constants';
import { Button, ServerAutocomplete, TextField, DataTable } from 'app/bizKITUi';

const useStyles = makeStyles(theme => ({
	table: {
		display: 'grid',
		gridTemplateColumns: '2fr 1fr 1fr',
		gap: 16,
		[theme.breakpoints.down(768)]: {
			gridTemplateColumns: '2fr 1fr'
		},
		[theme.breakpoints.down(360)]: {
			gridTemplateColumns: '1fr'
		}
	},
	btn: {
		display: 'flex',
		marginLeft: 'auto',
		width: '4px',
		[theme.breakpoints.down(768)]: {
			margin: '0'
		}
	}
}));

export const TableHospital = ({ readOnly, onChange, isEdit, hospitalServices }) => {
	const [count, setCount] = useState(1);
	const [errorMessage, setErrorMessage] = useState('');
	const [openModalConfirm] = useConfirm();
	const [selectedProduct, setSelectedProduct] = useState(null);
	const classes = useStyles();

	const [editIndexItem, setIndexItem] = useState(null);
	const isEditItem = editIndexItem !== null;

	const handleOnDelete = item => {
		const newHospitalServices = hospitalServices.filter(({ product }) => product.uuid !== item.product.uuid);

		onChange(newHospitalServices);
	};

	const handleOnSetEdit = editIndex => {
		setIndexItem(editIndex);
		setCount(hospitalServices[editIndex].count);
		setSelectedProduct(hospitalServices[editIndex].product);
	};

	const handleOnEditItem = () => {
		if (count < 1) {
			setErrorMessage('Количество не может быть меньше одного');
			return;
		}

		const newHospitalServices = [...hospitalServices];

		newHospitalServices.splice(editIndexItem, 1, {
			product: selectedProduct,
			cost: selectedProduct.cost,
			count: Number(count)
		});

		onChange(newHospitalServices);
		setCount(1);
		setErrorMessage('');
		setSelectedProduct(null);
		setIndexItem(null);
	};

	const handleOnAdd = () => {
		if (hospitalServices.some(item => item.product.uuid === selectedProduct.uuid)) {
			setErrorMessage('Медикамент уже добавлен в таблицу');
			return;
		}
		if (count < 1) {
			setErrorMessage('Количество не может быть меньше одного');
			return;
		}
		onChange([
			...hospitalServices,
			{
				product: selectedProduct,
				cost: selectedProduct.cost,
				count: Number(count)
			}
		]);
		setCount(1);
		setErrorMessage('');
		setSelectedProduct(null);
	};

	const columns = [
		{
			name: 'name',
			label: 'Наименование услуги',
			options: {
				customBodyRenderLite: dataIndex => {
					return hospitalServices[dataIndex].product.name;
				}
			}
		},
		{
			name: 'count',
			label: 'Количество',
			options: {
				customBodyRenderLite: dataIndex => {
					return hospitalServices[dataIndex].count;
				}
			}
		},
		{
			name: 'actions',
			label: 'Действия',
			options: {
				setCellHeaderProps: () => ({ style: { display: 'flex', justifyContent: 'flex-end' } }),
				customBodyRenderLite: dataIndex => {
					const currentItem = hospitalServices[dataIndex];
					return (
						<div className="flex justify-end">
							<IconButton
								aria-label="Редактировать услугу"
								disabled={!isEdit || isEditItem}
								onClick={() => handleOnSetEdit(dataIndex)}
							>
								<EditIcon />
							</IconButton>
							<IconButton
								aria-label="Удалить услугу"
								disabled={!isEdit || isEditItem}
								onClick={() =>
									openModalConfirm({
										title: 'Удалить услугу?',
										onSuccess: () => handleOnDelete(currentItem)
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
					value={selectedProduct}
					getOptionLabel={option => option.name}
					label="Услуга"
					variant="outlined"
					fullWidth
					disabled={readOnly}
					onChange={setSelectedProduct}
					onFetchList={name =>
						clinicService.getServices({ name, type: TYPE_SERVICE_HOSPITAL }).then(res => res.data.results)
					}
					onFetchItem={fetchUuid => clinicService.getServiceById(fetchUuid).then(res => res.data)}
				/>
				<TextField
					className="mx-10 w-1/3"
					label="Кол-во"
					type="number"
					variant="outlined"
					name="count"
					value={count}
					onChange={event => {
						if (Number(event.target.value) >= 0) {
							setCount(event.target.value);
						}
					}}
					disabled={readOnly}
				/>

				{isEditItem ? (
					<Button
						className={classes.btn}
						color="primary"
						aria-label="Редактировать"
						disabled={readOnly}
						// disabled={isDisabledEditButton || readOnly}
						onClick={handleOnEditItem}
					>
						<EditIcon />
					</Button>
				) : (
					<Button
						className={classes.btn}
						color="primary"
						aria-label="Добавить в таблицу"
						disabled={readOnly || !selectedProduct}
						// disabled={isDisabledAddButton || readOnly}
						onClick={handleOnAdd}
					>
						<AddIcon />
					</Button>
				)}
			</div>
			<FormHelperText error>{errorMessage}</FormHelperText>

			<div className="mt-20">
				<DataTable columns={columns} options={tableOptions} data={hospitalServices} />
			</div>
		</>
	);
};

TableHospital.defaultProps = {
	isEdit: true,
	readOnly: false,
	onChange: () => {}
};
TableHospital.propTypes = {
	isEdit: PropTypes.bool,
	readOnly: PropTypes.bool,
	hospitalServices: PropTypes.arrayOf(
		PropTypes.shape({
			product: PropTypes.objectOf().isRequired,
			count: PropTypes.number.isRequired,
			cost: PropTypes.number
		})
	).isRequired,
	onChange: PropTypes.func
};
