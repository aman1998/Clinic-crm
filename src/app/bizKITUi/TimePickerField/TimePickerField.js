import React from 'react';
import { MuiPickersUtilsProvider, KeyboardTimePicker } from '@material-ui/pickers';
import { QueryBuilder as QueryBuilderIcon } from '@material-ui/icons';
import DateFnsUtils from '@date-io/date-fns';
import ruLocale from 'date-fns/locale/ru';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Label } from '../Label';

export function TimePickerField({ onlyValid, label, readOnly, InputProps, onChange, ...props }) {
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
			<KeyboardTimePicker
				ampm={false}
				label={label && <Label label={label} readOnly={readOnly} />}
				variant="inline"
				format="HH:mm"
				inputVariant="outlined"
				readOnly={readOnly}
				InputProps={{ readOnly, ...InputProps }}
				onChange={handleOnChange}
				autoOk
				keyboardIcon={<QueryBuilderIcon />}
				{...props}
			/>
		</MuiPickersUtilsProvider>
	);
}
TimePickerField.defaultProps = {
	label: null,
	onlyValid: false,
	readOnly: false,
	InputProps: null,
	onChange: () => {}
};
TimePickerField.propTypes = {
	label: PropTypes.node,
	onlyValid: PropTypes.bool,
	readOnly: PropTypes.bool,
	InputProps: PropTypes.object,
	onChange: PropTypes.func
};
