import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormHelperText, IconButton, TableBody, TableCell, TableRow, Grid, makeStyles } from '@material-ui/core';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';
import { Button, DataTable, TextField, Autocomplete, ServerAutocomplete } from '../../bizKITUi';
import { useSearchClinicService } from '../hooks/useSearchClinicService';
import { numberFormat } from '../../utils';
import { useStateForm, useConfirm } from '../../hooks';
import { ModalClinicService } from '../ModalClinicService';
import { TYPE_SERVICE_LABORATORY } from '../../services/clinic/constants';
import { clinicService, companiesService } from '../../services';
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
		amount: '',
		partner: null,
		direction: null
	});

	const [list, setList] = useState(initialList);
	useEffect(() => {
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
			cost: Number(dataSearchClinicService.value.cost)
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
					const { cost } = list[dataIndex];

					return `${numberFormat.currency(cost)} ₸`;
				}
			}
		},
		{
			name: 'total',
			label: 'Сумма',
			options: {
				customBodyRenderLite: dataIndex => {
					const { cost, amount } = list[dataIndex];

					return `${numberFormat.currency(cost * amount)} ₸`;
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
			const totalCost = list.reduce((prev, current) => prev + current.amount * current.cost, 0);
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
			{!isEditItem && (
				<Grid container spacing={2}>
					<Grid item md={6} xs={12}>
						<ServerAutocomplete
							label="Партнёр"
							fullWidth
							name="partner"
							value={form.partner}
							onChange={value => {
								setInForm('partner', value?.uuid ?? null);
								actionsSearchClinicService.setValue(null);
							}}
							getOptionLabel={option => option.name}
							onFetchList={search =>
								companiesService
									.getPartnersCompanies({ search, limit: 10 })
									.then(({ data }) => data.results)
							}
							onFetchItem={fetchUuid => companiesService.getPartnerCompany(fetchUuid)}
						/>
					</Grid>

					<Grid item md={6} xs={12}>
						<ServerAutocomplete
							label="Направление"
							fullWidth
							name="direction"
							value={form.direction}
							onChange={value => {
								setInForm('direction', value?.uuid ?? null);
								actionsSearchClinicService.setValue(null);
							}}
							getOptionLabel={option => option.name}
							onFetchList={name =>
								clinicService
									.getDirections({ name, service_type: TYPE_SERVICE_LABORATORY, limit: 10 })
									.then(({ results }) => results)
							}
							onFetchItem={fetchUuid => clinicService.getDirectionById(fetchUuid)}
						/>
					</Grid>
				</Grid>
			)}
			<div className={`mt-20 gap-10 ${classes.table}`}>
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
								type: TYPE_SERVICE_LABORATORY,
								direction: form.direction,
								partner: form.partner,
								partner_null: !form.partner
							})
						}
						onInputChange={(_, newValue) =>
							actionsSearchClinicService.update(newValue, {
								type: TYPE_SERVICE_LABORATORY,
								direction: form.direction,
								partner: form.partner,
								partner_null: !form.partner
							})
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
					initialValues={{ type: TYPE_SERVICE_LABORATORY }}
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
