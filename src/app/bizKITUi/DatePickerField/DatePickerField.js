import React from 'react';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import ruLocale from 'date-fns/locale/ru';
import DateFnsUtils from '@date-io/date-fns';
import PropTypes from 'prop-types';
import moment from 'moment';

import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { HttpsOutlined as HttpsOutlinedIcon } from '@material-ui/icons';

const useStyles = makeStyles(() => ({
	fullWidth: {
		width: '100%'
	},
	datePicker: {
		'& input': {
			lineHeight: '1.6em'
		}
	}
}));

function Label({ label, readOnly }) {
	return readOnly ? (
		<>
			{label} <HttpsOutlinedIcon fontSize="inherit" />
		</>
	) : (
		label
	);
}

export function DatePickerField({ fullWidth, label, className, onChange, onlyValid, readOnly, InputProps, ...props }) {
	const classes = useStyles();

	const handleOnChange = date => {
		if (!date) {
			onChange(date);

			return;
		}

		if (onlyValid && !moment(date).isValid()) {
			return;
		}

		onChange(date);
	};

	return (
		<MuiPickersUtilsProvider utils={DateFnsUtils} locale={ruLocale}>
			<KeyboardDatePicker
				label={label && <Label label={label} readOnly={readOnly} />}
				className={clsx(classes.datePicker, { [classes.fullWidth]: fullWidth }, className)}
				variant="inline"
				format="dd.MM.yyyy"
				inputVariant="outlined"
				readOnly={readOnly}
				InputProps={{ readOnly, ...InputProps }}
				onChange={handleOnChange}
				autoOk
				{...props}
			/>
		</MuiPickersUtilsProvider>
	);
}
DatePickerField.defaultProps = {
	fullWidth: false,
	label: null,
	className: '',
	onlyValid: false,
	readOnly: false,
	InputProps: null,
	onChange: () => {}
};
DatePickerField.propTypes = {
	fullWidth: PropTypes.bool,
	label: PropTypes.node,
	className: PropTypes.string,
	onlyValid: PropTypes.bool,
	readOnly: PropTypes.bool,
	InputProps: PropTypes.object,
	onChange: PropTypes.func
};
