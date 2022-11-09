import React from 'react';
import PropTypes from 'prop-types';
import AutoNumeric from 'autonumeric';
import { InputAdornment } from '@material-ui/core';
import { TextField } from '../TextField';
import { normalizeNumberType } from '../../utils/normalizeNumber';

export class CurrencyTextField extends React.Component {
	constructor(props) {
		super(props);
		this.getValue = this.getValue.bind(this);
		this.callEventHandler = this.callEventHandler.bind(this);
	}

	componentDidMount() {
		const { currencySymbol, ...others } = this.props;
		this.autonumeric = new AutoNumeric(this.input, this.props.value, {
			...this.props.preDefined,
			...others,
			onChange: undefined,
			onFocus: undefined,
			onBlur: undefined,
			onKeyPress: undefined,
			onKeyUp: undefined,
			onKeyDown: undefined,
			watchExternalChanges: false
		});
	}

	componentDidUpdate(prevProps) {
		if (prevProps.value === '' && this.props.value === 0) {
			this.autonumeric.set(this.props.value);

			return;
		}

		const isValueChanged = prevProps.value !== this.props.value && this.getValue() !== this.props.value;

		if (isValueChanged) {
			this.autonumeric.set(this.props.value);
		}
	}

	componentWillUnmount() {
		this.autonumeric.remove();
	}

	onBlur(e) {
		this.callEventHandler(e, 'onBlur');
		if (e.target.value === '') {
			this.autonumeric.set(0);
		}
	}

	getValue() {
		if (!this.autonumeric) return '';
		const valueMapper = {
			string: numeric => numeric.getNumericString(),
			number: numeric => numeric.getNumber()
		};
		return valueMapper[this.props.outputFormat](this.autonumeric);
	}

	callEventHandler(event, eventName) {
		normalizeNumberType(event);
		if (!this.props[eventName]) return;
		this.props[eventName](event, this.getValue());
	}

	render() {
		const { currencySymbol, InputProps, showSymbol } = this.props;

		const otherProps = {};
		[
			'id',
			'label',
			'className',
			'autoFocus',
			'variant',
			'style',
			'error',
			'disabled',
			'type',
			'name',
			'defaultValue',
			'tabIndex',
			'fullWidth',
			'rows',
			'rowsMax',
			'select',
			'required',
			'helperText',
			'unselectable',
			'margin',
			'SelectProps',
			'multiline',
			'size',
			'FormHelperTextProps',
			'placeholder'
		].forEach(prop => {
			otherProps[prop] = this.props[prop];
		});

		return (
			<TextField
				inputRef={ref => {
					this.input = ref;
				}}
				onChange={e => this.callEventHandler(e, 'onChange')}
				onFocus={e => this.callEventHandler(e, 'onFocus')}
				onBlur={e => this.onBlur(e)}
				onKeyPress={e => this.callEventHandler(e, 'onKeyPress')}
				onKeyUp={e => this.callEventHandler(e, 'onKeyUp')}
				onKeyDown={e => this.callEventHandler(e, 'onKeyDown')}
				InputLabelProps={{ shrink: true }}
				InputProps={{
					endAdornment: <InputAdornment position="end">{showSymbol && currencySymbol}</InputAdornment>,
					...InputProps
				}}
				{...otherProps}
			/>
		);
	}
}

CurrencyTextField.propTypes = {
	type: PropTypes.oneOf(['text', 'tel', 'hidden']),
	variant: PropTypes.string,
	id: PropTypes.string,
	className: PropTypes.string,
	style: PropTypes.objectOf(PropTypes.object),
	disabled: PropTypes.bool,
	label: PropTypes.string,
	textAlign: PropTypes.oneOf(['right', 'left', 'center']),
	tabIndex: PropTypes.number,
	autoFocus: PropTypes.bool,
	placeholder: PropTypes.string,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	onChange: PropTypes.func,
	onFocus: PropTypes.func,
	onBlur: PropTypes.func,
	onKeyPress: PropTypes.func,
	onKeyUp: PropTypes.func,
	onKeyDown: PropTypes.func,
	currencySymbol: PropTypes.string,
	decimalCharacter: PropTypes.string,
	decimalCharacterAlternative: PropTypes.string,
	decimalPlaces: PropTypes.number,
	decimalPlacesShownOnBlur: PropTypes.number,
	decimalPlacesShownOnFocus: PropTypes.number,
	digitGroupSeparator: PropTypes.string,
	leadingZero: PropTypes.oneOf(['allow', 'deny', 'keep']),
	maximumValue: PropTypes.string,
	minimumValue: PropTypes.string,
	negativePositiveSignPlacement: PropTypes.oneOf(['l', 'r', 'p', 's']),
	negativeSignCharacter: PropTypes.string,
	outputFormat: PropTypes.oneOf(['string', 'number']),
	selectOnFocus: PropTypes.bool,
	positiveSignCharacter: PropTypes.string,
	readOnly: PropTypes.bool,
	preDefined: PropTypes.objectOf(PropTypes.object),
	showSymbol: PropTypes.bool
};

CurrencyTextField.defaultProps = {
	type: 'text',
	variant: 'standard',
	currencySymbol: '₸',
	decimalPlaces: 0,
	outputFormat: 'number',
	textAlign: 'right',
	maximumValue: '10000000000000',
	minimumValue: '-10000000000000',
	digitGroupSeparator: ' ',
	decimalCharacter: ',',
	showSymbol: true
};
