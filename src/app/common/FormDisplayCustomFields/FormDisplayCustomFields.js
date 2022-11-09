import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import _ from '@lodash';
import { makeStyles } from '@material-ui/core/styles';
import { useForm } from '@fuse/hooks';
import { addDays, differenceInDays, addMinutes } from 'date-fns';
import {
	Link,
	FormControlLabel,
	MenuItem,
	Switch,
	Checkbox,
	Radio,
	InputAdornment,
	Typography
} from '@material-ui/core';
import { DateTimePickerField, DatePickerField, TextField } from '../../bizKITUi';
import { normalizeNumberType } from '../../utils/normalizeNumber';

const useStyles = makeStyles(theme => ({
	input: {
		marginTop: '20px'
	},
	label: {
		color: theme.palette.secondary.main
	},
	datePicker: { marginRight: '10px' },
	daysInput: {
		width: '71px',
		marginRight: '10px'
	},
	linkWrapper: {
		marginTop: '20px',
		width: '100%',
		height: '54px',
		border: '1px solid rgba(0, 0, 0, 0.25)',
		borderRadius: '4px',
		display: 'flex',
		paddingLeft: '12px',
		paddingTop: '16px',
		overflow: 'hidden'
	}
}));

function TypographyComponentDefault({ children }) {
	return (
		<Typography className="mt-28 text-lg font-bold" color="secondary">
			{children}
		</Typography>
	);
}
TypographyComponentDefault.propTypes = {
	children: PropTypes.node.isRequired
};

function ContainerComponentDefault({ children }) {
	return <div className="flex flex-col">{children}</div>;
}

ContainerComponentDefault.propTypes = {
	children: PropTypes.node.isRequired,
	fieldsLength: PropTypes.number
};

function FieldsContainerComponentDefault({ children }) {
	return children;
}

ContainerComponentDefault.defaultProps = {
	fieldsLength: 1
};

FieldsContainerComponentDefault.propTypes = {
	children: PropTypes.node.isRequired,
	fieldsLength: PropTypes.number
};

function NumberComponent({ field, onChangeData, sectionIndex, fieldIndex, isReadOnly, fullWidth, ...props }) {
	const classes = useStyles();
	const [number, setNumber] = useState(field.value);

	const changeValue = e => {
		const { value } = e.target;
		if (!isNaN(value)) {
			setNumber(value);
		}
	};
	return (
		<TextField
			{...props}
			className={classes.input}
			label={field.verbose_name}
			type="text"
			value={number}
			variant="outlined"
			onChange={changeValue}
			fullWidth={fullWidth}
			inputProps={{
				onBlur: e => onChangeData(e.target.value, sectionIndex, fieldIndex),
				readOnly: isReadOnly
			}}
		/>
	);
}

function SwitchComponent({ field, onChangeData, sectionIndex, fieldIndex }) {
	const classes = useStyles();
	const [switchStatus, setSwitchStatus] = useState(Boolean(field.value));

	const switched = e => {
		setSwitchStatus(e.target.checked);
		onChangeData(e.target.checked, sectionIndex, fieldIndex);
	};
	return (
		<div className="flex items-center justify-between mt-20">
			<span className={classes.label}>{field.verbose_name}</span>
			<Switch checked={switchStatus} onChange={switched} color="primary" />
		</div>
	);
}

function CheckboxComponent({ field, onChangeData, sectionIndex, fieldIndex }) {
	const classes = useStyles();
	const [checkboxes, setCheckboxes] = useState([]);

	useEffect(() => {
		if (Array.isArray(field.value)) {
			setCheckboxes(field.value);
		}
	}, [field]);

	const handleChange = (index, isChecked) => {
		let value = [...field.value];
		if (field.type === 'radio') {
			value = value.map(item => {
				return { name: item.name, checked: false };
			});
		}
		value[index].checked = isChecked;
		setCheckboxes(value);
		onChangeData(value, sectionIndex, fieldIndex);
	};

	return (
		<div className="flex mt-20">
			<span className={clsx(classes.label, 'mt-10')}>{field.verbose_name}</span>
			<div className="flex flex-col ml-40">
				{checkboxes.map((item, index) => (
					<CheckboxItem
						key={`ch_item_${index}`}
						item={item}
						type={field.type}
						handleChange={handleChange}
						index={index}
					/>
				))}
			</div>
		</div>
	);
}

function CheckboxItem({ item, type, index, handleChange }) {
	const checkChange = e => {
		const { checked } = e.target;
		handleChange(index, checked);
	};
	return (
		<FormControlLabel
			value="end"
			control={
				type === 'checkbox' ? (
					<Checkbox color="primary" checked={item.checked} onChange={checkChange} />
				) : (
					<Radio color="primary" checked={item.checked} onChange={checkChange} />
				)
			}
			label={item.name}
			labelPlacement="end"
		/>
	);
}

function DateTimeComponent({ field, onChangeData, sectionIndex, fieldIndex, isReadOnly }) {
	const [date, setDate] = useState(field.value === '' ? null : field.value);
	const changeDate = newDate => {
		setDate(newDate);
		onChangeData(newDate, sectionIndex, fieldIndex);
	};

	return (
		<>
			<div className="flex items-center justify-between mt-20">
				<DateTimePickerField
					label={field.verbose_name}
					value={date}
					onChange={changeDate}
					fullWidth
					readOnly={isReadOnly}
				/>
			</div>
		</>
	);
}

function DateComponent({ field, onChangeData, sectionIndex, fieldIndex, isReadOnly }) {
	const [date, setDate] = useState(field.value === '' ? null : field.value);
	const changeDate = newDate => {
		setDate(newDate);
		onChangeData(newDate, sectionIndex, fieldIndex);
	};

	return (
		<>
			<div className="flex items-center justify-between mt-20">
				<DatePickerField
					label={field.verbose_name}
					inputVariant="outlined"
					value={date}
					onChange={changeDate}
					fullWidth
					readOnly={isReadOnly}
				/>
			</div>
		</>
	);
}

function DateRangeComponent({ field, onChangeData, sectionIndex, fieldIndex, isReadOnly, dateRangeClassName }) {
	const classes = useStyles();
	const [daysBetween, setDaysBetween] = useState(0);
	const [minutesBetween, setMinutesBetween] = useState(0);

	const { form, setInForm } = useForm({
		startAt: null,
		endAt: null
	});

	useEffect(() => {
		if (field.value !== '' && !_.isEmpty(field.value)) {
			if (field.value.start_at) {
				setInForm('startAt', field.value.start_at);
			}
			if (field.value.end_at) {
				setInForm('endAt', field.value.end_at);
			}
			if (field.value.start_at && field.value.end_at) {
				const days = differenceInDays(new Date(field.value.end_at), new Date(field.value.start_at));
				setDaysBetween(days);
			}
		}
	}, [field, setInForm]);

	const setStartDate = date => {
		setInForm('startAt', date);
		if (form.end !== null) {
			const days = differenceInDays(new Date(form.endAt), date);
			setDaysBetween(days);
		}
		const value = { start_at: date, end_at: form.endAt };
		onChangeData(value, sectionIndex, fieldIndex);
	};

	const calcBetweenDay = date => {
		setInForm('endAt', date);
		const days = differenceInDays(date, new Date(form.startAt));
		setDaysBetween(days);
		const value = { start_at: form.startAt, end_at: date };
		onChangeData(value, sectionIndex, fieldIndex);
	};

	const calcEndDate = e => {
		const days = e.target.value;
		setDaysBetween(days);
		const newEndDate = addDays(new Date(form.startAt), days);
		setInForm('endAt', newEndDate);
		const value = { start_at: form.startAt, end_at: newEndDate };
		onChangeData(value, sectionIndex, fieldIndex);
	};

	const calcMinutes = e => {
		const minutes = e.target.value;
		setMinutesBetween(minutes);
		const newEndDate = addMinutes(new Date(form.startAt), minutes);
		setInForm('endAt', newEndDate);
		const value = { start_at: form.startAt, end_at: newEndDate };
		onChangeData(value, sectionIndex, fieldIndex);
	};
	return (
		<div className="mt-20">
			<span className={clsx(classes.label)}>{field.verbose_name}</span>
			<div className={dateRangeClassName}>
				<DateTimePickerField
					className={classes.datePicker}
					inputVariant="outlined"
					label="Дата начала"
					value={form.startAt}
					onChange={date => setStartDate(date)}
					readOnly={isReadOnly}
				/>
				<DateTimePickerField
					className={classes.datePicker}
					inputVariant="outlined"
					label="Дата окончания"
					value={form.endAt}
					onChange={calcBetweenDay}
					readOnly={isReadOnly}
				/>

				<TextField
					className={classes.daysInput}
					label="Минуты"
					value={isNaN(minutesBetween) ? 0 : minutesBetween}
					onChange={calcMinutes}
					variant="outlined"
					InputProps={{
						readOnly: isReadOnly
					}}
					onKeyPress={normalizeNumberType}
				/>

				<TextField
					className={classes.daysInput}
					label="Дни"
					value={isNaN(daysBetween) ? 0 : daysBetween}
					onChange={calcEndDate}
					variant="outlined"
					InputProps={{
						readOnly: isReadOnly
					}}
					onKeyPress={normalizeNumberType}
				/>
			</div>
		</div>
	);
}

function CurrencyComponent({ field, onChangeData, sectionIndex, fieldIndex, isReadOnly, fullWidth }) {
	const classes = useStyles();
	const [number, setNumber] = useState(field.value);
	const changeValue = e => {
		const { value } = e.target;
		if (!isNaN(value)) {
			setNumber(value);
		}
	};
	return (
		<TextField
			className={classes.input}
			label={field.verbose_name}
			type="text"
			value={number}
			onChange={changeValue}
			variant="outlined"
			fullWidth={fullWidth}
			inputProps={{
				onBlur: e => onChangeData(e.target.value, sectionIndex, fieldIndex)
			}}
			// eslint-disable-next-line react/jsx-no-duplicate-props
			InputProps={{
				endAdornment: <InputAdornment position="end">&#8376;</InputAdornment>,
				readOnly: isReadOnly
			}}
		/>
	);
}

function FieldTypes({
	type,
	field,
	fieldIndex,
	sectionIndex,
	onChangeData,
	isReadOnly,
	fullWidth,
	dateRangeClassName
}) {
	const classes = useStyles();

	return (
		<>
			{type === 'text' && (
				<TextField
					className={classes.input}
					label={field.verbose_name}
					type="text"
					defaultValue={field.value}
					variant="outlined"
					fullWidth={fullWidth}
					inputProps={{
						onBlur: e => onChangeData(e.target.value, sectionIndex, fieldIndex),
						readOnly: isReadOnly
					}}
				/>
			)}
			{type === 'textarea' && (
				<TextField
					className={classes.input}
					id="outlined-multiline-static"
					label={field.verbose_name}
					multiline
					rows={3}
					name="description"
					defaultValue={field.value}
					variant="outlined"
					fullWidth={fullWidth}
					inputProps={{
						onBlur: e => onChangeData(e.target.value, sectionIndex, fieldIndex),
						readOnly: isReadOnly
					}}
				/>
			)}
			{type === 'number' && (
				<NumberComponent
					field={field}
					fullWidth={fullWidth}
					sectionIndex={sectionIndex}
					onChangeData={onChangeData}
					fieldIndex={fieldIndex}
					isReadOnly={isReadOnly}
				/>
			)}

			{type === 'list' && (
				<TextField
					className={classes.input}
					label={field.verbose_name}
					type="text"
					defaultValue={field.value}
					variant="outlined"
					fullWidth={fullWidth}
					InputProps={{
						readOnly: isReadOnly,
						onBlur: e => onChangeData(e.target.value, sectionIndex, fieldIndex)
					}}
					select
				>
					{field.source &&
						field.source.list.map(item => (
							<MenuItem key={item} value={item}>
								{item}
							</MenuItem>
						))}
				</TextField>
			)}

			{type === 'switch' && (
				<SwitchComponent
					field={field}
					sectionIndex={sectionIndex}
					onChangeData={onChangeData}
					fieldIndex={fieldIndex}
				/>
			)}
			{(type === 'checkbox' || type === 'radio') && (
				<CheckboxComponent
					field={field}
					sectionIndex={sectionIndex}
					onChangeData={onChangeData}
					fieldIndex={fieldIndex}
				/>
			)}

			{type === 'dateRange' && (
				<DateRangeComponent
					dateRangeClassName={dateRangeClassName}
					field={field}
					sectionIndex={sectionIndex}
					onChangeData={onChangeData}
					fieldIndex={fieldIndex}
					isReadOnly={isReadOnly}
					fullWidth={fullWidth}
				/>
			)}
			{type === 'dateTime' && (
				<DateTimeComponent
					field={field}
					sectionIndex={sectionIndex}
					onChangeData={onChangeData}
					fieldIndex={fieldIndex}
					isReadOnly={isReadOnly}
				/>
			)}
			{type === 'date' && (
				<DateComponent
					field={field}
					sectionIndex={sectionIndex}
					onChangeData={onChangeData}
					fieldIndex={fieldIndex}
					isReadOnly={isReadOnly}
				/>
			)}
			{type === 'money' && (
				<CurrencyComponent
					fullWidth={fullWidth}
					field={field}
					sectionIndex={sectionIndex}
					onChangeData={onChangeData}
					fieldIndex={fieldIndex}
					isReadOnly={isReadOnly}
				/>
			)}
			{type === 'link' && (
				<div className={classes.linkWrapper}>
					<Link href={field.source ? field.source.url : '/'}>{field.verbose_name}</Link>
				</div>
			)}
			{type === undefined && (
				<TextField
					className={classes.input}
					label={field.verbose_name}
					type="text"
					defaultValue={field.value}
					variant="outlined"
					fullWidth={fullWidth}
					inputProps={{
						readOnly: isReadOnly,
						onBlur: e => onChangeData(e.target.value, sectionIndex, fieldIndex)
					}}
				/>
			)}
		</>
	);
}

export function FormDisplayCustomFields({
	onChangeData,
	fields,
	isReadOnly,
	TypographyComponent,
	FieldsContainerComponent,
	showSectionTitle,
	ContainerComponent,
	fieldsFullWidth,
	dateRangeClassName
}) {
	return (
		<>
			{fields?.map((section, sectionIndex) => (
				// <Grid key={`section-${sectionIndex}`} item sm={section.fields.length === 1 ? 12 : 6} xs={12}>

				// 	<Paper>
				// 		<Accordion
				// 			title={<span className="text-dark-blue"> {section.name}</span>}
				// 			expansionPanelSummary={false}
				// 			divider
				// 		>
				// 			<Grid container spacing={2}>
				<ContainerComponent
					fieldsLength={section.fields.length}
					sectionName={section.name}
					key={`section-${sectionIndex}`}
				>
					{showSectionTitle && (
						<div className={clsx('flex justify-between items-center', { 'mt-20': sectionIndex > 0 })}>
							<TypographyComponent>{section.name}</TypographyComponent>
						</div>
					)}
					<FieldsContainerComponent fieldsLength={section.fields.length}>
						{section.fields.map((field, fieldIndex) => (
							<FieldTypes
								key={field.key}
								dateRangeClassName={dateRangeClassName}
								key={`field-${fieldIndex}`}
								type={field.type}
								field={field}
								fieldIndex={fieldIndex}
								sectionIndex={sectionIndex}
								fields={fields}
								onChangeData={onChangeData}
								isReadOnly={isReadOnly}
								fullWidth={fieldsFullWidth}
							/>
						))}
					</FieldsContainerComponent>
				</ContainerComponent>
				// 			</Grid>
				// 		</Accordion>
				// 	</Paper>
				// </Grid>
			))}
		</>
	);
}

FormDisplayCustomFields.defaultProps = {
	TypographyComponent: TypographyComponentDefault,
	ContainerComponent: ContainerComponentDefault,
	FieldsContainerComponent: FieldsContainerComponentDefault,
	dateRangeClassName: 'inline-flex items-center mt-20',
	fieldsFullWidth: false,
	isReadOnly: false,
	showSectionTitle: true
};

FormDisplayCustomFields.propTypes = {
	ContainerComponent: PropTypes.func,
	TypographyComponent: PropTypes.func,
	FieldsContainerComponent: PropTypes.func,
	dateRangeClassName: PropTypes.string,
	fieldsFullWidth: PropTypes.bool,
	showSectionTitle: PropTypes.bool,
	fields: PropTypes.arrayOf.isRequired,
	onChangeData: PropTypes.func.isRequired,
	isReadOnly: PropTypes.bool
};
