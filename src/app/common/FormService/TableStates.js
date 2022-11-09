import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@material-ui/icons';
import { FormHelperText, IconButton, Grid, FormControlLabel, Switch, MenuItem } from '@material-ui/core';
import { clinicService, globalFinanceService } from '../../services';
import { Button, DataTable, ServerAutocomplete, TextField } from '../../bizKITUi';
import { useConfirm } from '../../hooks';
import { FINANCE_STATE_TYPE_SPENDING } from '../../services/finance/constants';
import { numberFormat } from '../../utils';

const calculationTypeList = clinicService.getCalculationTypeList();

export function TableStates({ states, onChange }) {
	const [openModalConfirm] = useConfirm();

	const [selectedState, setSelectedState] = useState(null);
	const [selectedType, setSelectedType] = useState('');
	const [isPercentage, setIsPercentage] = useState(false);
	const [value, setValue] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	const handleOnAdd = () => {
		const isExists = states.some(({ state }) => state.uuid === selectedState.uuid);

		if (isExists) {
			setErrorMessage('Статья уже добавлена в таблицу');
			return;
		}

		const newItem = {
			state: {
				uuid: selectedState.uuid,
				name: selectedState.name
			},
			type: selectedType,
			percent: isPercentage,
			value
		};

		onChange([...states, newItem]);
		setSelectedState(null);
		setSelectedType('');
		setIsPercentage(false);
		setValue('');
		setErrorMessage('');
	};

	const handleOnDelete = stateItem => {
		const newList = states.filter(item => item.state.uuid !== stateItem.state.uuid);

		onChange(newList);
	};

	const [isEdit, setIsEdit] = useState(false);
	const handleOnSetEdit = medication => {
		setIsEdit(true);

		setSelectedState(medication.state);
		setSelectedType(medication.type);
		setIsPercentage(medication.percent);
		setValue(medication.value);
	};

	const handleOnEdit = () => {
		const index = states.findIndex(({ state }) => state.uuid === selectedState.uuid);
		const newList = states.slice();
		const newItem = {
			state: {
				uuid: selectedState.uuid,
				name: selectedState.name
			},
			type: selectedType,
			percent: isPercentage,
			value
		};

		newList.splice(index, 1, newItem);

		onChange(newList);
		setIsEdit(false);

		setSelectedState(null);
		setSelectedType('');
		setIsPercentage(false);
		setValue('');
		setErrorMessage('');
	};

	const columns = [
		{
			name: 'name',
			label: 'Статья расходов',
			options: {
				customBodyRenderLite: dataIndex => {
					return states[dataIndex].state.name;
				}
			}
		},
		{
			name: 'type',
			label: 'Тип расчёта',
			options: {
				customBodyRenderLite: dataIndex => {
					return clinicService.getCalculationByType(states[dataIndex].type)?.name ?? '—';
				}
			}
		},
		{
			name: 'value',
			label: 'Значение',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = states[dataIndex];
					return currentItem.percent
						? `${currentItem.value}%`
						: `${numberFormat.currency(currentItem.value)} ₸`;
				}
			}
		},
		{
			name: 'actions',
			label: 'Действия',
			options: {
				setCellHeaderProps: () => ({ style: { textAlign: 'right' } }),
				customBodyRenderLite: dataIndex => {
					const currentItem = states[dataIndex];

					return (
						<div className="flex justify-end">
							<IconButton aria-label="Редактировать статью" onClick={() => handleOnSetEdit(currentItem)}>
								<EditIcon />
							</IconButton>
							<IconButton
								aria-label="Удалить статью"
								disabled={isEdit}
								onClick={() =>
									openModalConfirm({
										title: 'Удалить статью?',
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

	const isDisabledActionButton = !selectedState || !value || !selectedType;

	return (
		<>
			<Grid container spacing={2}>
				<Grid item xs={12} sm={6}>
					<ServerAutocomplete
						value={selectedState}
						label="Статья расходов"
						name="state"
						fullWidth
						getOptionLabel={option => option.name}
						onFetchList={(name, limit) =>
							globalFinanceService.getStates({ name, limit, type: FINANCE_STATE_TYPE_SPENDING })
						}
						onFetchItem={uuid => globalFinanceService.getState(uuid)}
						onChange={setSelectedState}
					/>
				</Grid>

				<Grid item xs={12} sm={6}>
					<TextField
						select
						fullWidth
						variant="outlined"
						label="Тип расчета"
						value={selectedType}
						onChange={event => setSelectedType(event.target.value)}
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
				</Grid>

				<Grid item xs={12} sm={6}>
					<div className="flex h-full">
						<FormControlLabel
							label="Сумма / %"
							labelPlacement="end"
							control={
								<Switch
									checked={isPercentage}
									onChange={event => {
										setIsPercentage(event.target.checked);
										setValue('');
									}}
								/>
							}
						/>
					</div>
				</Grid>

				<Grid item xs={12} sm={6}>
					<div className="flex">
						<TextField
							className="mr-10"
							label="Значение"
							variant="outlined"
							fullWidth
							name="count"
							error={value && !numberFormat.decimal(value)}
							value={value}
							onChange={event => {
								const re = /^(\d*)(\.\d{0,2})?$/g;
								if (re.test(event.target.value)) {
									setValue(event.target.value);
								}
							}}
						/>
						{isEdit ? (
							<Button
								color="primary"
								aria-label="Редактировать"
								disabled={isDisabledActionButton}
								onClick={handleOnEdit}
							>
								<EditIcon />
							</Button>
						) : (
							<Button
								color="primary"
								aria-label="Добавить в таблицу"
								disabled={isDisabledActionButton}
								onClick={handleOnAdd}
							>
								<AddIcon />
							</Button>
						)}
					</div>
				</Grid>
			</Grid>
			<FormHelperText error>{errorMessage}</FormHelperText>

			<div className="mt-20">
				<DataTable columns={columns} options={tableOptions} data={states} />
			</div>
		</>
	);
}
TableStates.propTypes = {
	states: PropTypes.arrayOf(
		PropTypes.shape({
			state: PropTypes.shape({
				uuid: PropTypes.string.isRequired,
				name: PropTypes.string.isRequired
			}),
			percent: PropTypes.bool.isRequired,
			value: PropTypes.number.isRequired,
			type: PropTypes.oneOf(calculationTypeList.map(item => item.type))
		})
	).isRequired,
	onChange: PropTypes.func.isRequired
};
