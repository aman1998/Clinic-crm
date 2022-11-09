import React, { useState, useEffect } from 'react';
import { FormHelperText, IconButton, TableBody, TableCell, TableRow, makeStyles, Switch } from '@material-ui/core';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';
import PropTypes from 'prop-types';
import { Button, DataTable, TextField, Autocomplete } from '../../bizKITUi';
import { useSearchClinicService } from '../hooks/useSearchClinicService';
import { numberFormat } from '../../utils';
import { useStateForm, useConfirm } from '../../hooks';
import { ModalClinicService } from '../ModalClinicService';
import { TYPE_SERVICE_HOSPITAL } from '../../services/clinic/constants';
import { normalizeNumberType } from '../../utils/normalizeNumber';

const useStyles = makeStyles(theme => ({
	table: {
		display: 'grid',
		gridTemplateColumns: '2fr 1fr 1fr',
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

export function TableServices({ initialList, isEdit, onChange }) {
	const classes = useStyles();

	const [openModalConfirm] = useConfirm();
	const { form, handleChange, setInForm } = useStateForm({
		amount: ''
	});

	const [list, setList] = useState(initialList);
	useEffect(() => {
		if (!initialList) {
			return;
		}
		setList(initialList);
	}, [initialList]);

	const {
		status: statusSearchClinicService,
		actions: actionsSearchClinicService,
		data: dataSearchClinicService
	} = useSearchClinicService();

	const [editIndexItem, setIndexItem] = useState(null);
	const isEditItem = editIndexItem !== null;
	const handleOnSeEditItem = index => {
		setIndexItem(index);
		setInForm('amount', list[index].amount);
	};

	const [errorMessage, setErrorMessage] = useState('');
	useEffect(() => {
		setErrorMessage('');
	}, [dataSearchClinicService.value, form.amount]);

	const refreshState = () => {
		actionsSearchClinicService.setValue(null);
		setInForm('amount', '');
		setIndexItem(null);
	};

	const handleOnAddInList = () => {
		const serviceUuid = dataSearchClinicService.value.uuid;
		const hasInProductList = list.some(item => item.serviceUuid === serviceUuid);

		if (hasInProductList) {
			setErrorMessage('Услуга уже добавлена в таблицу');

			return;
		}

		const newItem = {
			serviceUuid: dataSearchClinicService.value.uuid,
			name: dataSearchClinicService.value.name,
			amount: Number(form.amount),
			cost: Number(dataSearchClinicService.value.cost),
			clinicPatient: false
		};
		const newList = [...list, newItem];

		refreshState();
		setList(newList);
		onChange(newList);
	};

	const handleOnDeleteItem = index => {
		const newList = list.slice();

		newList.splice(index, 1);
		setList(newList);
		onChange(newList);
	};

	const handleOnEditItem = () => {
		const newList = list.slice();

		newList[editIndexItem].amount = Number(form.amount);
		setList(newList);
		onChange(newList);
		refreshState();
	};

	const handleClinicPatientSwitch = currentItem => {
		const itemIndex = list.findIndex(service => service.serviceUuid === currentItem.serviceUuid);

		// const newItemCost = currentItem.clinicPatient
		// 	? dataSearchClinicService.listServices.find(service => service.uuid === currentItem.serviceUuid)?.cost || 0
		// 	: 0;
		const newItem = {
			...currentItem,
			clinicPatient: !currentItem.clinicPatient
			// cost: newItemCost
		};
		const newList = list.slice();

		newList.splice(itemIndex, 1, newItem);
		setList(newList);
		onChange(newList);
	};

	const [isShowModalService, setIsShowModalService] = useState(false);

	const isDisabledAddButton = !isEdit || !dataSearchClinicService.value || !(form.amount > 0) || !!errorMessage;
	const isDisabledEditButton = !isEdit || !(form.amount > 0) || !!errorMessage;

	const columns = [
		{
			name: 'name',
			label: 'Услуга'
		},
		{
			name: 'amount',
			label: 'Количество'
		},
		{
			name: 'cost',
			label: 'Цена',
			options: {
				customBodyRenderLite: dataIndex => {
					const { cost, clinicPatient } = list[dataIndex];

					return `${!clinicPatient ? numberFormat.currency(cost) : 0} ₸`;
				}
			}
		},
		{
			name: 'total',
			label: 'Сумма',
			options: {
				customBodyRenderLite: dataIndex => {
					const { cost, amount, clinicPatient } = list[dataIndex];

					return `${numberFormat.currency(!clinicPatient ? cost * amount : 0)} ₸`;
				}
			}
		},
		{
			name: 'total',
			label: 'Клиника/Пациент',
			options: {
				customBodyRenderLite: dataIndex => {
					const { clinicPatient } = list[dataIndex];

					return (
						<TableCell align="right">
							<Switch
								edge="end"
								checked={clinicPatient}
								onChange={() => handleClinicPatientSwitch(list[dataIndex])}
								color="primary"
								style={{ border: 'none' }}
							/>
						</TableCell>
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
								aria-label="Редактировать услугу"
								disabled={!isEdit || isEditItem}
								onClick={() => handleOnSeEditItem(dataIndex)}
							>
								<EditIcon />
							</IconButton>
							<IconButton
								aria-label="Удалить услугу"
								disabled={!isEdit || isEditItem}
								onClick={() =>
									openModalConfirm({
										title: 'Удалить услугу?',
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
			const totalCost = list.reduce((prev, current) => {
				if (!current.clinicPatient) {
					return prev + current.amount * current.cost;
				}
				return prev;
			}, 0);

			const totalAmount = list.reduce((prev, current) => prev + current.amount, 0);

			return (
				list.length > 0 && (
					<TableBody>
						<TableRow>
							<TableCell className="font-bold">Итого</TableCell>
							<TableCell className="font-bold">{totalAmount}</TableCell>
							<TableCell />
							<TableCell className="font-bold">{`${numberFormat.currency(totalCost)} ₸`}</TableCell>
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
				{isEditItem ? (
					<TextField
						label="Услуга"
						variant="outlined"
						fullWidth
						value={list[editIndexItem].name}
						InputProps={{
							readOnly: true
						}}
					/>
				) : (
					<Autocomplete
						isLoading={statusSearchClinicService.isLoading}
						options={dataSearchClinicService.listServices}
						readOnly={!isEdit}
						onAdd={() => setIsShowModalService(true)}
						addDisabled={!isEdit}
						getOptionLabel={option => option.name}
						filterOptions={options => options}
						getOptionSelected={(option, value) => option.uuid === value.uuid}
						onOpen={() =>
							actionsSearchClinicService.update(dataSearchClinicService.keyword, {
								type: TYPE_SERVICE_HOSPITAL
							})
						}
						onInputChange={(_, newValue) =>
							actionsSearchClinicService.update(newValue, { type: TYPE_SERVICE_HOSPITAL })
						}
						onChange={(_, value) => actionsSearchClinicService.setValue(value)}
						value={dataSearchClinicService.value}
						fullWidth
						renderInput={params => <TextField {...params} label="Услуга" variant="outlined" />}
					/>
				)}

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

				{isEditItem ? (
					<Button
						className={classes.btn}
						color="primary"
						aria-label="Редактировать"
						disabled={isDisabledEditButton}
						onClick={handleOnEditItem}
					>
						<EditIcon />
					</Button>
				) : (
					<Button
						className={classes.btn}
						color="primary"
						aria-label="Добавить в таблицу"
						disabled={isDisabledAddButton}
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

			{isShowModalService && (
				<ModalClinicService
					isOpen
					initialValues={{ type: TYPE_SERVICE_HOSPITAL }}
					onClose={() => setIsShowModalService(false)}
				/>
			)}
		</>
	);
}
TableServices.defaultProps = {
	isEdit: true,
	onChange: () => {}
};
TableServices.propTypes = {
	isEdit: PropTypes.bool,
	initialList: PropTypes.arrayOf(
		PropTypes.shape({
			serviceUuid: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
			amount: PropTypes.number.isRequired,
			cost: PropTypes.number.isRequired
		})
	).isRequired,
	onChange: PropTypes.func
};
