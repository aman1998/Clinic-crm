import React, { useCallback, useEffect, useLayoutEffect, useState, useMemo, forwardRef, useRef } from 'react';
import PropTypes from 'prop-types';
import { Autocomplete } from '@material-ui/lab';
import { CircularProgress, debounce, Divider, IconButton, InputAdornment, List } from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { TextField } from '../TextField';
import { useObserverElement } from '../../hooks';

const useStyles = makeStyles({
	selectDivider: {
		height: '2em',
		marginRight: 3,
		marginLeft: 3
	},
	inputAdornment: {
		width: 46
	},
	scroll: {
		maxHeight: 'calc(40vh - 16px)',
		overflow: 'auto'
	}
});

const INCREMENT_LIMIT = 10;

export function ServerAutocomplete({
	value,
	InputProps,
	getOptionLabel,
	getOptionSelected,
	renderOption,
	className,
	label,
	readOnly,
	fullWidth,
	disabled,
	onFetchList,
	onFetchItem,
	onChange,
	onBlur,
	onAdd,
	defaultUuid,
	freeSolo,
	autoSelect
}) {
	const classes = useStyles();

	const [textSearch, setTextSearch] = useState('');
	const [limit, setLimit] = useState(10);
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [list, setList] = useState([]);
	const [count, setCount] = useState(0);
	const [selectedValue, setSelectedValue] = useState(null);
	const [fetchUuid, setFetchUuid] = useState(null);

	const options = useMemo(() => {
		if (!selectedValue) {
			return list;
		}

		const listWithoutSelectedValue = list.filter(item => !getOptionSelected(item, selectedValue));

		return [selectedValue, ...listWithoutSelectedValue];
	}, [getOptionSelected, list, selectedValue]);

	const callbackDebounce = useCallback(
		debounce(fn => fn(), 250),
		[]
	);

	const fetchList = (keyword, newLimit) => {
		setIsLoading(true);

		onFetchList(keyword, newLimit)
			.then(newList => {
				if (Array.isArray(newList)) {
					setList(newList);

					return;
				}

				setList(newList.results);
				setCount(newList.count);
			})
			.finally(() => setIsLoading(false));
	};

	useEffect(() => {
		if (!fetchUuid && defaultUuid) {
			setIsLoading(true);
			onFetchItem(defaultUuid)
				.then(data => {
					setSelectedValue(data);
					onChange(data);
				})
				.finally(() => setIsLoading(false));
		}

		if (typeof value === 'object') {
			setSelectedValue(value);
			setFetchUuid(null);
			return;
		}

		setFetchUuid(value);

		if (value === fetchUuid) {
			return;
		}

		const itemInList = value ? options.find(option => getOptionSelected(option, value)) : null;

		if (itemInList) {
			setSelectedValue(itemInList);

			return;
		}

		if (!onFetchItem) {
			return;
		}

		setIsLoading(true);

		onFetchItem(value)
			.then(data => {
				setSelectedValue(data);
				onChange(data);
			})
			.finally(() => setIsLoading(false));
	}, [fetchUuid, getOptionSelected, onChange, onFetchItem, options, defaultUuid, value]);

	const ObserverElement = useObserverElement(() => {
		if (isLoading || count <= limit) {
			return;
		}

		const newLimit = limit + INCREMENT_LIMIT;
		setLimit(newLimit);
		fetchList(textSearch, newLimit);
	});

	const handleOnInputChange = (_, keyword) => {
		setTextSearch(keyword);

		if (!isOpen) {
			return;
		}

		callbackDebounce(() => fetchList(keyword, limit));
	};

	const handleOnChange = (_, newValue) => {
		onChange(newValue);
	};

	const handleOnOpen = () => {
		setList([]);
		setCount(0);
		setIsOpen(true);
		fetchList('', limit);
	};

	const scrollPosition = useRef(0);
	const listRef = useRef(null);
	useLayoutEffect(() => {
		if (!listRef.current) {
			return;
		}

		listRef.current.scrollTo(0, scrollPosition.current);
	});
	useLayoutEffect(() => {
		scrollPosition.current = 0;
	}, [textSearch]);
	const handleOnChangeScroll = event => {
		scrollPosition.current = event.target.scrollTop;
	};

	return (
		<Autocomplete
			open={isOpen}
			options={options}
			value={selectedValue}
			getOptionLabel={getOptionLabel}
			getOptionSelected={getOptionSelected}
			renderOption={renderOption}
			className={className}
			clearText="Очистить"
			closeText="Закрыть"
			loading={isLoading}
			loadingText="...Загрузка"
			filterOptions={values => values}
			noOptionsText="Нет вариантов"
			fullWidth={fullWidth}
			disabled={readOnly || disabled}
			onInputChange={handleOnInputChange}
			onChange={handleOnChange}
			onBlur={onBlur}
			freeSolo={freeSolo}
			onOpen={handleOnOpen}
			autoSelect={autoSelect}
			onClose={() => setIsOpen(false)}
			renderInput={params => (
				<TextField
					variant="outlined"
					label={label}
					fullWidth
					{...params}
					InputProps={{
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
										<IconButton edge="end" disabled={readOnly} onClick={() => onAdd()}>
											<AddIcon color="secondary" />
										</IconButton>
									</InputAdornment>
								)}
								{!onAdd && params.InputProps.endAdornment}
							</>
						)
					}}
					{...InputProps}
				/>
			)}
			ListboxComponent={forwardRef((props, ref) => (
				<List ref={ref} {...props} onScroll={handleOnChangeScroll} style={{ overflow: 'hidden' }}>
					<div ref={listRef} className={classes.scroll}>
						{/* eslint-disable-next-line react/prop-types */}
						{props.children}
						<ObserverElement />
						<div className="pb-2" />
					</div>
				</List>
			))}
		/>
	);
}
ServerAutocomplete.defaultProps = {
	value: null,
	InputProps: {},
	renderOption: null,
	readOnly: false,
	disabled: false,
	fullWidth: false,
	className: '',
	getOptionSelected: (option, value) => option.uuid === (value?.uuid ?? value),
	onFetchItem: null,
	onBlur: () => {},
	onAdd: null,
	defaultUuid: null,
	freeSolo: false,
	autoSelect: false
};
ServerAutocomplete.propTypes = {
	value: PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.number]),
	// eslint-disable-next-line react/forbid-prop-types
	InputProps: PropTypes.object,
	getOptionLabel: PropTypes.func.isRequired,
	getOptionSelected: PropTypes.func,
	className: PropTypes.string,
	renderOption: PropTypes.func,
	label: PropTypes.string.isRequired,
	readOnly: PropTypes.bool,
	fullWidth: PropTypes.bool,
	disabled: PropTypes.bool,
	onFetchList: PropTypes.func.isRequired,
	onFetchItem: PropTypes.func,
	onChange: PropTypes.func.isRequired,
	onBlur: PropTypes.func,
	onAdd: PropTypes.func,
	defaultUuid: PropTypes.string,
	freeSolo: PropTypes.bool,
	autoSelect: PropTypes.bool
};
