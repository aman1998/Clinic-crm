import React, { useState, useRef, Fragment } from 'react';
import clsx from 'clsx';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { useForm } from '@fuse/hooks';
import {
	Typography,
	Table,
	TableBody,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	TableCell,
	Card,
	CardHeader,
	CardContent,
	Divider,
	Grid
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckIcon from '@material-ui/icons/Check';
import AddIcon from '@material-ui/icons/Add';
import Autocomplete from '@material-ui/lab/Autocomplete';
import PropTypes from 'prop-types';
import { Button, TextField, MenuItem } from '../../../../bizKITUi';

const useStyles = makeStyles(theme => ({
	cardHeader: {
		'& .MuiCardHeader-action': {
			margin: -4
		}
	},
	label: {
		fontSize: '14px',
		fontWeight: 'bold',
		color: theme.palette.secondary.main
	},
	button: {
		marginLeft: theme.spacing(2),
		width: '50px',
		height: '53px'
	},
	tableContainer: {
		marginTop: '25px',
		borderTop: '1px solid rgba(0, 0, 0, 0.12)'
	}
}));

const StyledTableCell = withStyles(theme => ({
	head: {
		color: theme.palette.secondary.main,
		paddingLeft: 0
	},
	body: {
		color: theme.palette.secondary.main,
		paddingLeft: 0
	}
}))(TableCell);

const ActionsTableCell = withStyles(theme => ({
	body: {
		color: theme.palette.secondary.main,
		width: '100px'
	}
}))(TableCell);

const typesList = [
	{
		type: 'text',
		name: 'Текст'
	},
	{
		type: 'textarea',
		name: 'Описание'
	},
	{
		type: 'number',
		name: 'Число'
	},

	{
		type: 'list',
		name: 'Список'
	},
	{
		type: 'switch',
		name: 'Переключатель'
	},
	{
		type: 'checkbox',
		name: 'Чек-боксы'
	},
	{
		type: 'radio',
		name: 'Радио'
	},
	{
		type: 'date',
		name: 'Дата'
	},
	{
		type: 'dateTime',
		name: 'Дата и время'
	},
	{
		type: 'money',
		name: 'Деньги'
	},
	{
		type: 'link',
		name: 'Ссылка'
	},
	{
		type: 'dateRange',
		name: 'Период (от и до)'
	}
];

export function CustomFields({ initialValues, onSave, title }) {
	const classes = useStyles();
	const [groupName, setGroupName] = useState('');
	const [schema, setSchema] = useState(initialValues);

	const [selectList, setSelectList] = useState([]);
	const [checkboxesList, setCheckboxesList] = useState([]);

	const groupNameInput = useRef(null);
	const fieldNameInput = useRef(null);

	const { form, handleChange, setForm, setInForm, resetForm } = useForm({
		groupIndex: '',
		key: '',
		fieldName: '',
		type: '',
		url: ''
	});

	const addNewGroup = () => {
		setSchema(prevState => {
			const data = [...prevState];
			data.push({ name: groupName, fields: [] });
			return data;
		});
		setGroupName('');
	};

	const editGroupName = index => {
		setGroupName(schema[index].name);
		groupNameInput.current.focus();
		deleteGroup(index);
	};

	const deleteGroup = index => {
		setSchema(prevState => {
			const data = [...prevState];
			data.splice(index, 1);
			return data;
		});
	};

	const addFieldKey = e => {
		const { value } = e.target;
		const reg = /^[a-z0-9_]{0,16}$/;
		if (reg.test(value)) {
			setInForm('key', value);
		}
	};

	const addFieldToGroup = () => {
		const newField = {
			key: form.key,
			verbose_name: form.fieldName,
			value: '',
			type: form.type
		};
		if (form.type === 'link') {
			const source = { url: form.url };
			newField.source = source;
		}
		if (form.type === 'list') {
			const source = { list: selectList };
			newField.source = source;
			setSelectList([]);
		}
		if (form.type === 'radio' || form.type === 'checkbox') {
			const list = [];
			checkboxesList.forEach(item => {
				list.push({ name: item, checked: false });
			});
			newField.value = list;
			setCheckboxesList([]);
		}
		setSchema(prevState => {
			const copySchema = [...prevState];
			copySchema[form.groupIndex].fields.push(newField);
			return copySchema;
		});

		resetForm();
	};

	const editGroupField = (groupIndex, index) => {
		const field = {
			groupIndex,
			key: schema[groupIndex].fields[index].key,
			fieldName: schema[groupIndex].fields[index].verbose_name,
			type: schema[groupIndex].fields[index].type ? schema[groupIndex].fields[index].type : ''
		};
		if (schema[groupIndex].fields[index].type === 'link') {
			field.url = schema[groupIndex].fields[index].source ? schema[groupIndex].fields[index].source.url : '';
		}
		if (schema[groupIndex].fields[index].type === 'list') {
			setSelectList(schema[groupIndex].fields[index].source ? schema[groupIndex].fields[index].source.list : []);
		}
		if (schema[groupIndex].fields[index].type === 'checkbox' || schema[groupIndex].fields[index].type === 'radio') {
			const list = [];
			if (Array.isArray(schema[groupIndex].fields[index].value)) {
				schema[groupIndex].fields[index].value.forEach(item => {
					list.push(item.name);
				});
			}
			setCheckboxesList(list);
		}
		setForm(field);
		fieldNameInput.current.focus();
		deleteGroupField(groupIndex, index);
	};

	const deleteGroupField = (groupIndex, index) => {
		setSchema(prevState => {
			const copySchema = [...prevState];
			copySchema[groupIndex].fields.splice(index, 1);
			return copySchema;
		});
	};

	const checkKey = key => {
		let isHave = false;
		schema.forEach(item => {
			item.fields.forEach(field => {
				if (field.key === key) {
					isHave = true;
				}
			});
		});

		return isHave;
	};

	const checkForm = () => {
		if (form.type === 'link') {
			return (
				form.groupIndex === '' ||
				form.key === '' ||
				form.fieldName === '' ||
				checkKey(form.key) ||
				form.type === '' ||
				form.url === ''
			);
		}
		if (form.type === 'list') {
			return (
				form.groupIndex === '' ||
				form.key === '' ||
				form.fieldName === '' ||
				checkKey(form.key) ||
				form.type === '' ||
				selectList.length === 0
			);
		}
		if (form.type === 'radio' && form.type === 'checkbox') {
			return (
				form.groupIndex === '' ||
				form.key === '' ||
				form.fieldName === '' ||
				checkKey(form.key) ||
				form.type === '' ||
				checkboxesList.length === 0
			);
		}
		return (
			form.groupIndex === '' || form.key === '' || form.fieldName === '' || checkKey(form.key) || form.type === ''
		);
	};

	const isFormFilled = checkForm();

	const saveFields = () => onSave({ custom_fields: { sections: schema } });

	return (
		<Card>
			<CardHeader
				title={title}
				className={classes.cardHeader}
				action={
					<Button
						onClick={saveFields}
						textNormal
						size="small"
						variant="text"
						color="primary"
						startIcon={<CheckIcon />}
					>
						Сохранить
					</Button>
				}
			/>
			<Divider />
			<CardContent>
				<>
					<Typography className={classes.label}>Группы дополнительных полей</Typography>
					<div className="flex mt-16">
						<TextField
							label="Наименование группы"
							type="text"
							name="groupName"
							value={groupName}
							onChange={e => setGroupName(e.target.value)}
							variant="outlined"
							inputRef={groupNameInput}
							fullWidth
						/>
						<Button
							variant="contained"
							color="primary"
							size="large"
							className={classes.button}
							onClick={addNewGroup}
							disabled={groupName === ''}
						>
							<AddIcon />
						</Button>
					</div>
					{
						<>
							<TableContainer className={classes.tableContainer}>
								<Table color="secondary" aria-label="simple table">
									<TableBody>
										{schema.map((row, index) => (
											<TableRow key={row.name}>
												<StyledTableCell component="th" scope="row">
													{row.name}
												</StyledTableCell>
												<ActionsTableCell>
													<EditIcon
														className="w-16 text-black cursor-pointer"
														onClick={() => editGroupName(index)}
													/>
													<DeleteIcon
														className="md:ml-32 ml-12 text-black w-16 cursor-pointer"
														onClick={() => deleteGroup(index)}
													/>
												</ActionsTableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>

							<Typography className={clsx(classes.label, 'mt-32 mb-16')}>Дополнительные поля</Typography>
							<Grid container spacing={2}>
								<Grid item xs={12}>
									<TextField
										label="Наименование поля"
										type="text"
										name="fieldName"
										value={form.fieldName}
										onChange={handleChange}
										variant="outlined"
										inputRef={fieldNameInput}
										fullWidth
									/>
								</Grid>
								<Grid item md={6} xs={12}>
									<TextField
										id="outlined-select"
										fullWidth
										variant="outlined"
										select
										label="Группа"
										name="groupIndex"
										value={form.groupIndex}
										onChange={handleChange}
									>
										{schema.map((item, index) => (
											<MenuItem key={item.name} value={index}>
												{item.name}
											</MenuItem>
										))}
									</TextField>
								</Grid>
								<Grid item md={6} xs={12}>
									<TextField
										id="outlined-select"
										fullWidth
										variant="outlined"
										select
										label="Тип поля"
										name="type"
										value={form.type}
										onChange={handleChange}
									>
										{typesList.map((item, index) => (
											<MenuItem key={item.name} value={item.type}>
												{item.name}
											</MenuItem>
										))}
									</TextField>
								</Grid>
								{['link', 'list', 'radio', 'checkbox'].includes(form.type) && (
									<Grid item xs={12}>
										{form.type === 'link' && (
											<div className="flex">
												<TextField
													label="URL ссылка"
													type="text"
													name="url"
													value={form.url}
													onChange={handleChange}
													variant="outlined"
													fullWidth
												/>
											</div>
										)}
										{form.type === 'list' && (
											<div className="flex">
												<Autocomplete
													multiple
													id="tags-filled"
													options={[]}
													value={selectList}
													freeSolo
													fullWidth
													onChange={(event, newValue, reason) => {
														setSelectList([...newValue]);
													}}
													renderTags={(value, getTagProps) =>
														value.map((option, index) => (
															<Chip
																key={option}
																variant="outlined"
																label={option}
																{...getTagProps({ index })}
															/>
														))
													}
													renderInput={params => (
														<TextField
															{...params}
															variant="outlined"
															label="Список"
															placeholder="Варианты (введите вариант и нажмите Enter)"
															fullWidth
														/>
													)}
												/>
											</div>
										)}
										{(form.type === 'radio' || form.type === 'checkbox') && (
											<div className="flex">
												<Autocomplete
													multiple
													id="tags-filled"
													options={[]}
													value={checkboxesList}
													freeSolo
													fullWidth
													onChange={(event, newValue, reason) => {
														setCheckboxesList([...newValue]);
													}}
													renderTags={(value, getTagProps) =>
														value.map((option, index) => (
															<Chip
																key={option}
																variant="outlined"
																label={option}
																{...getTagProps({ index })}
															/>
														))
													}
													renderInput={params => (
														<TextField
															{...params}
															variant="outlined"
															label="Список"
															placeholder="Варианты (введите вариант и нажмите Enter)"
															fullWidth
														/>
													)}
												/>
											</div>
										)}
									</Grid>
								)}
								<Grid item xs={12}>
									<div className="flex">
										<TextField
											label="Код поля"
											type="text"
											name="key"
											value={form.key}
											onChange={addFieldKey}
											variant="outlined"
											fullWidth
											helperText={
												checkKey(form.key)
													? 'И уникальные значения'
													: 'Принимаются латинские буквы, цифры и символ _'
											}
										/>
										<Button
											variant="contained"
											color="primary"
											size="large"
											className={classes.button}
											onClick={addFieldToGroup}
											disabled={isFormFilled}
										>
											<AddIcon />
										</Button>
									</div>
								</Grid>
							</Grid>
						</>
					}
					{schema.map(
						(item, groupIndex) =>
							item?.fields?.length > 0 && (
								<Fragment key={item.name}>
									<Typography className={clsx(classes.label, 'mt-32')}>{item.name}</Typography>
									<div className="w-full">
										<TableContainer>
											<Table color="secondary" aria-label="simple table">
												<TableHead>
													<TableRow>
														<StyledTableCell>Наименование</StyledTableCell>
														<StyledTableCell>Код поля</StyledTableCell>
														<StyledTableCell>Действия</StyledTableCell>
													</TableRow>
												</TableHead>
												<TableBody>
													{item.fields.map((field, index) => (
														<TableRow key={index}>
															<StyledTableCell component="th" scope="row">
																{field.verbose_name}
															</StyledTableCell>
															<StyledTableCell>{field.key}</StyledTableCell>

															<ActionsTableCell>
																<EditIcon
																	className="w-16 text-black cursor-pointer"
																	onClick={() => editGroupField(groupIndex, index)}
																/>
																<DeleteIcon
																	className="md:ml-32 ml-12 text-black w-16 cursor-pointer"
																	onClick={() => deleteGroupField(groupIndex, index)}
																/>
															</ActionsTableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										</TableContainer>
									</div>
								</Fragment>
							)
					)}
				</>
			</CardContent>
		</Card>
	);
}

CustomFields.defaultProps = {
	title: <></>
};

CustomFields.propTypes = {
	initialValues: PropTypes.array.isRequired,
	title: PropTypes.element,
	onSave: PropTypes.func.isRequired
};
