import React, { useState, useEffect } from 'react';
import { FormHelperText, IconButton, makeStyles } from '@material-ui/core';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';
import PropTypes from 'prop-types';
import { Button, DataTable, TextField } from 'app/bizKITUi';
import { daysFormat } from 'app/utils';
import { useStateForm, useConfirm } from 'app/hooks';

const useStyles = makeStyles(theme => ({
	btn: {
		display: 'flex',
		marginLeft: 'auto',
		width: '64px',
		[theme.breakpoints.down(767)]: {
			margin: '0'
		}
	}
}));

const defaultValues = {
	medicament: '',
	days: '',
	instruction: ''
};

export function TableMedications({ initialList, onChange, readOnly, isEdit }) {
	const classes = useStyles();

	const [openModalConfirm] = useConfirm();
	const { form, handleChange, setInForm } = useStateForm(defaultValues);

	const [list, setList] = useState(initialList);
	useEffect(() => {
		if (!initialList) {
			return;
		}
		setList(initialList);
	}, [initialList]);

	const [editIndexItem, setIndexItem] = useState(null);
	const isEditItem = editIndexItem !== null;
	const handleOnSeEditItem = index => {
		setIndexItem(index);
		setInForm('instruction', list[index].instruction);
		setInForm('days', list[index].days);
		setInForm('medicament', list[index].medicament);
	};

	const [errorMessage, setErrorMessage] = useState('');
	useEffect(() => {
		setErrorMessage('');
	}, []);

	const refreshState = () => {
		setInForm('medicament', '');
		setInForm('instruction', '');
		setInForm('days', '');
		setIndexItem(null);
	};

	const handleOnAddInList = () => {
		const hasInProductList = list.some(item => item.medicament === form.medicament);
		const singleDays = daysFormat(form.days);
		const isValidDays = singleDays.some(day => Number.isNaN(Number(day)));
		if (isValidDays) {
			setErrorMessage('Неправильный формат');

			return;
		}

		if (hasInProductList) {
			setErrorMessage('Услуга уже добавлена в таблицу');

			return;
		}

		const newItem = {
			medicament: form.medicament,
			days: singleDays,
			instruction: form.instruction
		};
		const newList = [...initialList, newItem];

		refreshState();
		setList(newList);
		onChange(newList);
		setErrorMessage('');
	};

	const handleOnDeleteItem = index => {
		const newList = list.slice();

		newList.splice(index, 1);
		setList(newList);
		onChange(newList);
	};

	const handleOnEditItem = () => {
		const newList = list.slice();
		const singleDays = daysFormat(form.days);
		const isValidDays = singleDays.some(day => Number.isNaN(Number(day)));
		if (isValidDays) {
			setErrorMessage('Неправильный формат');

			return;
		}

		newList[editIndexItem].medicament = form.medicament;
		newList[editIndexItem].days = singleDays;
		newList[editIndexItem].instruction = form.instruction;

		setList(newList);
		onChange(newList);
		refreshState();
	};

	const isDisabledAddButton = !form.medicament || !form.days;
	const isDisabledEditButton = !form.medicament || !form.days || !form.instruction;

	const columns = [
		{
			name: 'medicament',
			label: 'Медикамент'
		},
		{
			name: 'days',
			label: 'Дни лечения'
		},
		{
			name: 'instruction',
			label: 'Инструкция'
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
								disabled={isEditItem}
								onClick={() => handleOnSeEditItem(dataIndex)}
							>
								<EditIcon />
							</IconButton>
							<IconButton
								aria-label="Удалить медикамент"
								disabled={isEditItem}
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
		responsive: 'standard'
	};

	return (
		<>
			<div>
				<div className="xs1:flex gap-10 mb-10">
					<TextField
						label="Медикамент"
						variant="outlined"
						fullWidth
						name="medicament"
						value={form.medicament}
						onChange={handleChange}
						disabled={readOnly}
					/>
					<TextField
						label="Дни лечения"
						variant="outlined"
						fullWidth
						name="days"
						value={form.days}
						onChange={handleChange}
						disabled={readOnly}
					/>
				</div>
				<div className="gap-10 xs1:flex">
					<TextField
						label="Инструкция"
						variant="outlined"
						fullWidth
						multiline
						className="mb-10 xs1:mb-0"
						name="instruction"
						value={form.instruction}
						disabled={readOnly}
						onChange={handleChange}
					/>

					{isEditItem ? (
						<Button
							className={classes.btn}
							color="primary"
							aria-label="Редактировать"
							disabled={isDisabledEditButton || readOnly}
							onClick={handleOnEditItem}
						>
							<EditIcon />
						</Button>
					) : (
						<Button
							className={classes.btn}
							color="primary"
							aria-label="Добавить в таблицу"
							disabled={isDisabledAddButton || readOnly}
							onClick={handleOnAddInList}
						>
							<AddIcon />
						</Button>
					)}
				</div>
			</div>
			<FormHelperText error>{errorMessage}</FormHelperText>

			<div className="mt-20">
				<DataTable columns={columns} options={tableOptions} data={list} />
			</div>
		</>
	);
}
TableMedications.defaultProps = {
	isEdit: true,
	readOnly: false,
	onChange: () => {}
};
TableMedications.propTypes = {
	isEdit: PropTypes.bool,
	readOnly: PropTypes.bool,
	initialList: PropTypes.arrayOf(
		PropTypes.shape({
			service: PropTypes.string.isRequired,
			count: PropTypes.number.isRequired,
			days: PropTypes.string
		})
	).isRequired,
	onChange: PropTypes.func
};
