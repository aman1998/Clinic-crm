import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@material-ui/icons';
import { FormControl, FormControlLabel, IconButton, Radio, RadioGroup, makeStyles } from '@material-ui/core';
import Switch from '@material-ui/core/Switch';
import { useConfirm, useStateForm } from '../../hooks';
import { getShortName } from '../../utils';
import { clinicService } from '../../services';
import { Amount, Button, CurrencyTextField, DataTable, MenuItem, TextField } from '../../bizKITUi';
import { SERVICE_PAYOUT_STOCKTAKING_ALWAYS } from '../../services/clinic/constants';
import { FieldCounterpartyAutocomplete } from '../FieldCounterpartyAutocomplete';
import { decimalPercentOnChange, numberFormat } from '../../utils/numberFormat';

const calculationTypeList = clinicService.getCalculationTypeList();
const counterpartyTypeList = clinicService.getClinicCounterpartyTypeList();

const useStyles = makeStyles(theme => ({
	table: {
		display: 'grid',
		gridTemplateColumns: '1fr 1fr',
		[theme.breakpoints.down(767)]: {
			gridTemplateColumns: '1fr'
		}
	},
	payItem: {
		display: 'grid',
		gridTemplateColumns: '1fr 1fr',
		[theme.breakpoints.down(767)]: {
			gridTemplateColumns: '1fr'
		}
	}
}));

export function TablePayouts({ payouts, onChange }) {
	const classes = useStyles();
	const [openModalConfirm] = useConfirm();

	const { form, setInForm, handleChange, resetForm, setForm } = useStateForm({
		counterparty_type: '',
		counterparty: null,
		calculation_type: '',
		percent: false,
		value: '',
		stocktaking: SERVICE_PAYOUT_STOCKTAKING_ALWAYS
	});

	const handleOnAddPayout = () => {
		onChange([...payouts, { ...form }]);
		resetForm();
	};

	const handleOnDeletePayout = index => {
		const newPayouts = payouts.slice();

		newPayouts.splice(index, 1);
		onChange(newPayouts);
	};

	const [indexEditPayout, setIndexEditPayout] = useState();
	const isEditPayout = indexEditPayout > -1;
	const handleOnSetEditPayout = index => {
		const payout = payouts[index];

		setIndexEditPayout(index);
		setForm(payout);
	};

	const handleOnEditPayout = () => {
		const newPayouts = payouts.slice();
		newPayouts.splice(indexEditPayout, 1, { ...form });

		onChange(newPayouts);
		resetForm();
		setIndexEditPayout();
	};

	const handleOnChangeCounterpartyType = counterparty => {
		setInForm('counterparty_type', counterparty);
		setInForm('counterparty', null);
	};

	const columns = [
		{
			name: 'counterparty_type',
			label: 'Тип контрагента',
			options: {
				customBodyRenderLite: dataIndex => {
					const { counterparty_type } = payouts[dataIndex];
					return clinicService.getClinicCounterpartyByType(counterparty_type)?.name;
				}
			}
		},
		{
			name: 'counterparty',
			label: 'Контрагент',
			options: {
				customBodyRenderLite: dataIndex => {
					const { counterparty } = payouts[dataIndex];
					if (!counterparty) {
						return null;
					}

					return counterparty.name ?? getShortName(counterparty);
				}
			}
		},
		{
			name: 'calculation_type',
			label: 'Тип расчета',
			options: {
				customBodyRenderLite: dataIndex => {
					const { calculation_type } = payouts[dataIndex];
					return clinicService.getCalculationByType(calculation_type).name;
				}
			}
		},
		{
			name: 'value',
			label: 'Значение',
			options: {
				customBodyRenderLite: dataIndex => {
					const { percent, value } = payouts[dataIndex];

					return percent ? `${value}%` : <Amount value={value} />;
				}
			}
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
								aria-label="Редактировать выплату"
								onClick={() => handleOnSetEditPayout(dataIndex)}
							>
								<EditIcon />
							</IconButton>
							<IconButton
								aria-label="Удалить выплату"
								disabled={isEditPayout}
								onClick={() =>
									openModalConfirm({
										title: 'Удалить выплату?',
										onSuccess: () => handleOnDeletePayout(dataIndex)
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

	const isDisabledActionButton =
		!form.counterparty_type ||
		!form.calculation_type ||
		!form.value ||
		!form.counterparty ||
		(form.percent && !numberFormat.decimal(form.value));

	return (
		<>
			<div className={`mt-20 gap-10 ${classes.table}`}>
				<TextField
					label="Тип контрагента"
					select
					fullWidth
					variant="outlined"
					value={form.counterparty_type}
					onChange={event => handleOnChangeCounterpartyType(event.target.value)}
				>
					<MenuItem disabled value="">
						Не выбран
					</MenuItem>
					{counterpartyTypeList.map(item => (
						<MenuItem key={item.type} value={item.type}>
							{item.name}
						</MenuItem>
					))}
				</TextField>

				<div className="flex">
					{!form.counterparty_type && (
						<TextField label="Контрагент" variant="outlined" fullWidth InputProps={{ readOnly: true }} />
					)}

					{form.counterparty_type && (
						<FieldCounterpartyAutocomplete
							type={form.counterparty_type}
							label="Контрагент"
							value={form.counterparty}
							onChange={value => setInForm('counterparty', value)}
							fullWidth
						/>
					)}
				</div>

				<TextField
					name="calculation_type"
					value={form.calculation_type}
					select
					label="Тип расчета"
					variant="outlined"
					fullWidth
					onChange={handleChange}
				>
					<MenuItem disabled value="">
						Не выбрано
					</MenuItem>
					{calculationTypeList.map(item => (
						<MenuItem value={item.type} key={item.type}>
							{item.name}
						</MenuItem>
					))}
				</TextField>
			</div>

			<div className={`gap-10 mt-10  ${classes.payItem}`}>
				<FormControlLabel
					label="Сумма / %"
					control={
						<Switch
							checked={form.percent}
							onChange={event => {
								setInForm('percent', event.target.checked);
								setInForm('value', '');
							}}
						/>
					}
				/>

				<div className="flex">
					{form.percent ? (
						<TextField
							value={form.value}
							label="Процент"
							variant="outlined"
							fullWidth
							error={form.value && !numberFormat.decimal(form.value)}
							onChange={event => {
								if (decimalPercentOnChange.test(event.target.value)) {
									setInForm('value', event.target.value ?? null);
								}
							}}
						/>
					) : (
						<CurrencyTextField
							value={form.value}
							variant="outlined"
							label="Сумма"
							fullWidth
							onChange={(_, value) => setInForm('value', value)}
						/>
					)}

					{isEditPayout ? (
						<Button
							color="primary"
							aria-label="Редактировать"
							disabled={isDisabledActionButton}
							onClick={handleOnEditPayout}
						>
							<EditIcon />
						</Button>
					) : (
						<Button
							color="primary"
							aria-label="Добавить в таблицу"
							disabled={isDisabledActionButton}
							onClick={handleOnAddPayout}
						>
							<AddIcon />
						</Button>
					)}
				</div>
			</div>

			<div>
				<FormControl component="fieldset">
					<RadioGroup
						onChange={event => setInForm('stocktaking', event.target.value)}
						value={form.stocktaking}
						name="stocktaking"
						type="text"
						variant="outlined"
						row
					>
						{clinicService.getStocktakingList().map(item => (
							<FormControlLabel
								key={item.type}
								value={item.type}
								control={<Radio color="primary" />}
								label={item.name}
							/>
						))}
					</RadioGroup>
				</FormControl>
			</div>

			<div className="mt-20">
				<DataTable columns={columns} options={tableOptions} data={payouts} />
			</div>
		</>
	);
}
TablePayouts.propTypes = {
	payouts: PropTypes.arrayOf(
		PropTypes.shape({
			value: PropTypes.number.isRequired,
			percent: PropTypes.bool.isRequired,
			counterparty: PropTypes.oneOfType([
				PropTypes.shape({
					last_name: PropTypes.string,
					first_name: PropTypes.string,
					middle_name: PropTypes.string
				}),
				PropTypes.shape({
					name: PropTypes.string
				})
			]),
			counterparty_type: PropTypes.oneOf(counterpartyTypeList.map(item => item.type)),
			calculation_type: PropTypes.oneOf(calculationTypeList.map(item => item.type))
		})
	).isRequired,
	onChange: PropTypes.func.isRequired
};
