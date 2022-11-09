import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@material-ui/icons';
import { FormHelperText, IconButton, makeStyles } from '@material-ui/core';
import { productsService } from '../../services';
import { Button, DataTable, MenuItem, ServerAutocomplete, TextField } from '../../bizKITUi';
import { useConfirm } from '../../hooks';
import { normalizeNumberType } from '../../utils/normalizeNumber';

const useStyles = makeStyles(theme => ({
	table: {
		display: 'grid',
		gridTemplateColumns: '2fr 1fr 1fr 1fr',
		[theme.breakpoints.down(767)]: {
			gridTemplateColumns: '2fr 1fr'
		},
		[theme.breakpoints.down(400)]: {
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

export function TableMedications({ medications, onChange }) {
	const classes = useStyles();

	const [openModalConfirm] = useConfirm();

	const [selectedProduct, setSelectedProduct] = useState(null);
	const [count, setCount] = useState('');
	const [packing, setPacking] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	const handleOnAddMedication = () => {
		const isExistsMedication = medications.some(({ product }) => product.uuid === selectedProduct.uuid);

		if (isExistsMedication) {
			setErrorMessage('Медикамент уже добавлен в таблицу');

			return;
		}

		const newMedication = {
			count,
			packing,
			packing_unit: selectedProduct.packing_unit,
			minimum_unit_of_measure: selectedProduct.minimum_unit_of_measure,
			amount_in_package: selectedProduct.amount_in_package,
			product: {
				uuid: selectedProduct.uuid,
				name: selectedProduct.name,
				packing_unit: selectedProduct.packing_unit,
				minimum_unit_of_measure: selectedProduct.minimum_unit_of_measure,
				amount_in_package: selectedProduct.amount_in_package
			}
		};

		onChange([...medications, newMedication]);
		setSelectedProduct(null);
		setCount('');
		setPacking('');
		setErrorMessage('');
	};

	const handleOnDeleteMedication = medication => {
		const newMedications = medications.filter(({ product }) => product.uuid !== medication.product.uuid);

		onChange(newMedications);
	};

	const [isEditMedication, setIsEditMedication] = useState(false);
	const handleOnSetEditProduct = medication => {
		setIsEditMedication(true);
		setCount(medication.count);
		setPacking(medication.packing);
		setSelectedProduct(medication.product);
	};

	const handleOnEditProduct = () => {
		const index = medications.findIndex(({ product }) => product.uuid === selectedProduct.uuid);
		const newMedications = medications.slice();
		const newMedication = {
			count,
			packing,
			packing_unit: selectedProduct.packing_unit,
			minimum_unit_of_measure: selectedProduct.minimum_unit_of_measure,
			amount_in_package: selectedProduct.amount_in_package,
			product: {
				uuid: selectedProduct.uuid,
				name: selectedProduct.name,
				packing_unit: selectedProduct.packing_unit,
				minimum_unit_of_measure: selectedProduct.minimum_unit_of_measure,
				amount_in_package: selectedProduct.amount_in_package
			}
		};

		newMedications.splice(index, 1, newMedication);

		onChange(newMedications);
		setIsEditMedication(false);
		setSelectedProduct(null);
		setCount('');
		setPacking('');
		setErrorMessage('');
	};

	const columns = [
		{
			name: 'name',
			label: 'Медикамент',
			options: {
				customBodyRenderLite: dataIndex => {
					return medications[dataIndex].product.name;
				}
			}
		},
		{
			name: 'count',
			label: 'Количество'
		},
		{
			name: 'packing',
			label: 'Ед.изм.',
			options: {
				customBodyRenderLite: dataIndex => {
					return medications[dataIndex].packing.name;
				}
			}
		},
		{
			name: 'actions',
			label: 'Действия',
			options: {
				setCellHeaderProps: () => ({ style: { textAlign: 'right' } }),
				customBodyRenderLite: dataIndex => {
					const medication = medications[dataIndex];

					return (
						<div className="flex justify-end">
							<IconButton
								aria-label="Редактировать медикамент"
								onClick={() => handleOnSetEditProduct(medication)}
							>
								<EditIcon />
							</IconButton>
							<IconButton
								aria-label="Удалить медикамент"
								disabled={isEditMedication}
								onClick={() =>
									openModalConfirm({
										title: 'Удалить медикамент?',
										onSuccess: () => handleOnDeleteMedication(medication)
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

	const selectedProductPacking = productsService.getProductPackingUnits(selectedProduct);

	const isDisabledActionButton = !selectedProduct || !packing || !(count > 0);

	return (
		<>
			<div className={`gap-10 ${classes.table}`}>
				<ServerAutocomplete
					value={selectedProduct}
					label="Наименование / артикул"
					name="product"
					fullWidth
					getOptionLabel={option => option.name}
					onFetchList={(name_vendor_code_manufacturer, limit) =>
						productsService
							.getProducts({
								name_vendor_code_manufacturer,
								limit
							})
							.then(({ data }) => data)
					}
					onFetchItem={uuid => productsService.getProduct(uuid).then(({ data }) => data)}
					onChange={setSelectedProduct}
				/>

				<TextField
					label="Ед.изм"
					select
					variant="outlined"
					fullWidth
					name="packing"
					value={selectedProduct && packing ? packing.uuid : ''}
					InputProps={{ readOnly: !selectedProduct }}
					onChange={event =>
						setPacking(selectedProductPacking.find(item => item.uuid === event.target.value))
					}
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

				<TextField
					label="Кол-во"
					variant="outlined"
					fullWidth
					name="count"
					value={count}
					onChange={event => setCount(event.target.value)}
					onKeyPress={normalizeNumberType}
				/>

				{isEditMedication ? (
					<Button
						className={classes.btn}
						color="primary"
						aria-label="Редактировать"
						disabled={isDisabledActionButton}
						onClick={handleOnEditProduct}
					>
						<EditIcon />
					</Button>
				) : (
					<Button
						className={classes.btn}
						color="primary"
						aria-label="Добавить в таблицу"
						disabled={isDisabledActionButton}
						onClick={handleOnAddMedication}
					>
						<AddIcon />
					</Button>
				)}
			</div>
			<FormHelperText error>{errorMessage}</FormHelperText>

			<div className="mt-20">
				<DataTable columns={columns} options={tableOptions} data={medications} />
			</div>
		</>
	);
}
TableMedications.propTypes = {
	medications: PropTypes.arrayOf(
		PropTypes.shape({
			product: PropTypes.shape({
				uuid: PropTypes.string.isRequired,
				name: PropTypes.string.isRequired
			}),
			packing_unit: PropTypes.shape({
				uuid: PropTypes.string.isRequired,
				name: PropTypes.string.isRequired
			}),
			minimum_unit_of_measure: PropTypes.shape({
				uuid: PropTypes.string.isRequired,
				name: PropTypes.string.isRequired
			}).isRequired,
			amount_in_package: PropTypes.number,
			packing: PropTypes.shape({
				uuid: PropTypes.string.isRequired,
				name: PropTypes.string.isRequired
			}).isRequired,
			count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
		})
	).isRequired,
	onChange: PropTypes.func.isRequired
};
