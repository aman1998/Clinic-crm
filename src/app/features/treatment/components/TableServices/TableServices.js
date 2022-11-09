import React, { useState, useEffect } from 'react';
import { FormHelperText, IconButton, makeStyles } from '@material-ui/core';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';
import PropTypes from 'prop-types';
import { clinicService } from 'app/services';
import { Button, DataTable, TextField, ServerAutocomplete } from '../../../../bizKITUi';
import { daysFormat } from '../../../../utils';
import { useStateForm, useConfirm } from '../../../../hooks';
import { TYPE_SERVICE_HOSPITAL } from '../../../../services/clinic/constants';

const useStyles = makeStyles(theme => ({
	table: {
		display: 'grid',
		gridTemplateColumns: '2fr 1fr 1fr',
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
		width: '64px',
		[theme.breakpoints.down(768)]: {
			margin: '0'
		}
	}
}));

const defaultValues = {
	count: '',
	// service: '',
	days: ''
};

export function TableServices({ initialList, isEdit, readOnly, onChange }) {
	const classes = useStyles();

	const [openModalConfirm] = useConfirm();
	const { form, handleChange, setInForm } = useStateForm(defaultValues);

	const [list, setList] = useState(initialList);
	useEffect(() => {
		if (!initialList) {
			return;
		}
		setList(
			initialList.map(item => {
				const newItem = {
					...item,
					name: item.service.name
				};
				return newItem;
			})
		);
	}, [initialList]);

	const [editIndexItem, setIndexItem] = useState(null);
	const isEditItem = editIndexItem !== null;
	const handleOnSeEditItem = index => {
		setIndexItem(index);
		setInForm('count', list[index].count);
		setInForm('service', list[index].service);
		setInForm('days', list[index].days);
	};

	const [errorMessage, setErrorMessage] = useState('');
	useEffect(() => {
		setErrorMessage('');
	}, [form.service, form.count]);

	const refreshState = () => {
		setInForm('count', '');
		setInForm('service', '');
		setInForm('days', '');
		setIndexItem(null);
	};

	const handleOnAddInList = () => {
		const singleDays = daysFormat(form.days);

		const serviceUuid = form.service.uuid;
		const hasInProductList = list.some(item => item.service.uuid === serviceUuid);
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
			service: form.service,
			name: form.service.name,
			count: Number(form.count),
			days: singleDays
		};
		const newList = [...list, newItem];

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

		newList[editIndexItem].count = Number(form.count);
		newList[editIndexItem].days = singleDays;
		newList[editIndexItem].service = form.service;
		setList(newList);
		onChange(newList);
		refreshState();
	};

	const isDisabledAddButton = !form.service || !(form.count > 0) || !!errorMessage;
	const isDisabledEditButton = !(form.count > 0) || !form.service || !form.days;

	const columns = [
		{
			name: 'name',
			label: 'Услуга'
		},
		{
			name: 'days',
			label: 'Дни лечения'
		},
		{
			name: 'count',
			label: 'Количество'
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
		responsive: 'standard'
	};

	return (
		<>
			<div>
				<ServerAutocomplete
					getOptionLabel={option => option.name}
					label="Услуга"
					variant="outlined"
					className="mb-10"
					disabled={readOnly}
					onChange={value => setInForm('service', value ?? null)}
					value={form.service}
					onFetchList={name =>
						clinicService.getServices({ name, type: TYPE_SERVICE_HOSPITAL }).then(res => res.data.results)
					}
					onFetchItem={fetchUuid => clinicService.getServiceById(fetchUuid).then(res => res.data)}
				/>
				<div className={`${classes.table} gap-10 `}>
					<TextField
						label="Дни лечения"
						variant="outlined"
						fullWidth
						name="days"
						value={form.days}
						onChange={handleChange}
						disabled={readOnly}
					/>

					<TextField
						label="Кол-во"
						variant="outlined"
						fullWidth
						name="count"
						value={form.count}
						onChange={handleChange}
						disabled={readOnly}
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
TableServices.defaultProps = {
	isEdit: true,
	readOnly: false,
	onChange: () => {}
};
TableServices.propTypes = {
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
