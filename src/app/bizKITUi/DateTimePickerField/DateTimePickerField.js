import React from 'react';
import { KeyboardDateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import ruLocale from 'date-fns/locale/ru';
import DateFnsUtils from '@date-io/date-fns';
import PropTypes from 'prop-types';
import moment from 'moment';

import clsx from 'clsx';

import { HttpsOutlined as HttpsOutlinedIcon } from '@material-ui/icons';
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';

function Label({ label, readOnly }) {
	return readOnly ? (
		<>
			{label} <HttpsOutlinedIcon fontSize="inherit" />
		</>
	) : (
		label
	);
}

const materialTheme = theme =>
	createMuiTheme({
		...theme,
		overrides: {
			MuiPickersToolbarText: {
				toolbarTxt: {
					fontSize: '20px'
				}
			},
			MuiPickersToolbar: {
				toolbar: {
					height: 70
				}
			},
			MuiOutlinedInput: {
				root: {
					'&:hover:not($disabled):not($focused):not($error) $notchedOutline': {
						borderColor: '#007bff7a'
					}
				},
				adornedEnd: {
					paddingRight: 0
				}
			}
		}
	});

const useStyles = makeStyles(theme => ({
	fullWidth: {
		width: '100%'
	}
}));

export function DateTimePickerField({
	fullWidth,
	label,
	className,
	onChange,
	onlyValid,
	readOnly,
	InputProps,
	...props
}) {
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
		<ThemeProvider theme={materialTheme}>
			<MuiPickersUtilsProvider utils={DateFnsUtils} locale={ruLocale}>
				<KeyboardDateTimePicker
					ampm={false}
					label={label && <Label label={label} readOnly={readOnly} />}
					className={clsx({ [classes.fullWidth]: fullWidth }, className)}
					variant="inline"
					format="dd.MM.yyyy HH:mm"
					inputVariant="outlined"
					readOnly={readOnly}
					InputProps={{ readOnly, ...InputProps }}
					onChange={handleOnChange}
					autoOk
					{...props}
				/>
			</MuiPickersUtilsProvider>
		</ThemeProvider>
	);
}
DateTimePickerField.defaultProps = {
	fullWidth: false,
	label: null,
	className: '',
	onlyValid: false,
	readOnly: false,
	InputProps: null,
	onChange: () => {}
};
DateTimePickerField.propTypes = {
	fullWidth: PropTypes.bool,
	label: PropTypes.node,
	className: PropTypes.string,
	onlyValid: PropTypes.bool,
	readOnly: PropTypes.bool,
	InputProps: PropTypes.object,
	onChange: PropTypes.func
};
