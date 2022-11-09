import React from 'react';
import { Autocomplete as AutocompleteLib } from '@material-ui/lab';
import PropTypes from 'prop-types';
import { InputAdornment, Divider, IconButton, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Add as AddIcon } from '@material-ui/icons';
import { TextField } from '../TextField';

const useStyles = makeStyles({
	selectDivider: {
		height: 44
	},
	inputAdornment: {
		width: 40
	}
});

export function Autocomplete({
	onAdd,
	getOptionLabel,
	findSelectedLabel,
	options,
	value,
	isLoading,
	renderInput,
	addDisabled,
	readOnly,
	disabled,
	InputProps,
	...props
}) {
	const classes = useStyles();

	const wrapRenderInput = params => {
		return renderInput({
			...params,
			variant: 'outlined',
			fullWidth: true,
			disabled: readOnly ? false : params.disabled,
			InputProps: {
				...params.InputProps,
				readOnly,
				disabled: readOnly ? false : params.disabled,
				endAdornment: (
					<>
						{isLoading && <CircularProgress color="inherit" size={20} />}
						{onAdd && (
							<InputAdornment className={classes.inputAdornment} position="end">
								{params.InputProps?.endAdornment?.props?.children}
								<Divider className={classes.selectDivider} orientation="vertical" />
								<IconButton edge="end" disabled={addDisabled} onClick={() => onAdd()}>
									<AddIcon color="secondary" />
								</IconButton>
							</InputAdornment>
						)}
						{!onAdd && params.InputProps.endAdornment}
					</>
				)
			},
			...InputProps
		});
	};

	const wrapGetOptionLabel = option => {
		if (findSelectedLabel && option === value) {
			if (!value) {
				return '';
			}

			return getOptionLabel(options.find(item => findSelectedLabel(item)) ?? null);
		}

		return getOptionLabel(option);
	};

	const getValue = () => {
		if (value && !options.some(item => props.getOptionSelected(item, value))) {
			return null;
		}

		return value;
	};

	return (
		<AutocompleteLib
			options={options}
			value={getValue()}
			getOptionLabel={wrapGetOptionLabel}
			clearText="Очистить"
			closeText="Закрыть"
			loading={isLoading}
			loadingText="...Загрузка"
			noOptionsText="Нет вариантов"
			disabled={readOnly || disabled}
			renderInput={wrapRenderInput}
			{...props}
		/>
	);
}
Autocomplete.defaultProps = {
	InputProps: {},
	isLoading: false,
	findSelectedLabel: null,
	value: null,
	readOnly: false,
	disabled: false,
	addDisabled: false,
	onAdd: null,
	renderInput: params => <TextField {...params} />,
	getOptionLabel: value => value
};
Autocomplete.propTypes = {
	InputProps: PropTypes.object,
	onAdd: PropTypes.func,
	value: PropTypes.any,
	addDisabled: PropTypes.bool,
	disabled: PropTypes.bool,
	readOnly: PropTypes.bool,
	renderInput: PropTypes.func,
	isLoading: PropTypes.bool,
	getOptionLabel: PropTypes.func,
	findSelectedLabel: PropTypes.func,
	options: PropTypes.array.isRequired
};
