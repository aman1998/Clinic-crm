import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { FormHelperText } from '@material-ui/core';
import {
	RemoveTwoTone as RemoveTwoToneIcon,
	AddTwoTone as AddTwoToneIcon,
	ArrowForward as ArrowForwardIcon,
	HttpsOutlined as HttpsOutlinedIcon
} from '@material-ui/icons';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const useStyles = makeStyles(theme => ({
	container: {
		display: 'flex',
		[theme.breakpoints.down(767)]: {
			flexDirection: 'column'
		}
	},
	item: {
		display: 'flex',
		alignItems: 'center',
		padding: '12px'
	},
	fuelItem: {
		[theme.breakpoints.down(767)]: {
			margin: '10px 0'
		}
	},
	icon: {
		display: 'inline-flex',
		justifyContent: 'center',
		alignItems: 'center',
		width: '30px',
		height: '30px',
		marginRight: '10px',
		borderRadius: '50%',
		color: theme.palette.background.default
	},
	input: {
		width: '100%',
		cursor: 'pointer'
	},
	inputComing: {
		'& > input': {
			'& ~ span': {
				border: `1px solid ${theme.palette.success.main}`,
				borderRadius: '6px',
				borderTopRightRadius: 0,
				borderBottomRightRadius: 0,
				color: theme.palette.success.main
			},

			'& ~ span > span': {
				backgroundColor: theme.palette.success.main
			},

			'&:checked ~ span': {
				backgroundColor: theme.palette.success.main,
				color: theme.palette.background.default
			},

			'&:checked ~ span > span': {
				backgroundColor: theme.palette.background.default,
				color: theme.palette.success.main
			}
		}
	},
	inputSpending: {
		'& > input': {
			'& ~ span': {
				border: `1px solid ${theme.palette.error.main}`,
				color: theme.palette.error.main
			},

			'& ~ span > span': {
				backgroundColor: theme.palette.error.main
			},

			'&:checked ~ span': {
				backgroundColor: theme.palette.error.main,
				color: theme.palette.background.default
			},

			'&:checked ~ span > span': {
				backgroundColor: theme.palette.background.default,
				color: theme.palette.error.main
			}
		}
	},
	inputMoving: {
		'& > input': {
			'& ~ span': {
				border: `1px solid ${theme.palette.warning.main}`,
				borderRadius: '6px',
				borderTopLeftRadius: 0,
				borderBottomLeftRadius: 0,
				color: theme.palette.warning.main
			},

			'& ~ span > span': {
				backgroundColor: theme.palette.warning.main
			},

			'&:checked ~ span': {
				backgroundColor: theme.palette.warning.main,
				color: theme.palette.background.default
			},

			'&:checked ~ span > span': {
				backgroundColor: theme.palette.background.default,
				color: theme.palette.warning.main
			}
		}
	}
}));

export function SelectFinanceType({
	onChange,
	onBlur,
	disabled,
	name,
	valueSpending,
	valueComing,
	valueMoving,
	checked,
	errorMessage
}) {
	const classes = useStyles();

	return (
		<>
			<div className={classes.container}>
				<label className={clsx(classes.input, classes.inputComing)}>
					<input
						type="radio"
						className="srOnly"
						disabled={disabled}
						name={name}
						value={valueComing}
						checked={checked === valueComing}
						onChange={onChange}
						onBlur={onBlur}
					/>

					<span className={classes.item}>
						<span className={classes.icon}>
							<AddTwoToneIcon />
						</span>
						Приход {disabled && <HttpsOutlinedIcon fontSize="inherit" className="ml-4" />}
					</span>
				</label>

				<label className={clsx(classes.input, classes.inputSpending, classes.fuelItem)}>
					<input
						type="radio"
						className="srOnly"
						disabled={disabled}
						name={name}
						value={valueSpending}
						checked={checked === valueSpending}
						onChange={onChange}
						onBlur={onBlur}
					/>

					<span className={classes.item}>
						<span className={classes.icon}>
							<RemoveTwoToneIcon />
						</span>
						Расход {disabled && <HttpsOutlinedIcon fontSize="inherit" className="ml-4" />}
					</span>
				</label>

				<label className={clsx(classes.input, classes.inputMoving)}>
					<input
						type="radio"
						className="srOnly"
						disabled={disabled}
						name={name}
						value={valueMoving}
						checked={checked === valueMoving}
						onChange={onChange}
						onBlur={onBlur}
					/>

					<span className={classes.item}>
						<span className={classes.icon}>
							<ArrowForwardIcon />
						</span>
						Перемещение {disabled && <HttpsOutlinedIcon fontSize="inherit" className="ml-4" />}
					</span>
				</label>
			</div>
			{errorMessage && <FormHelperText error>{errorMessage}</FormHelperText>}
		</>
	);
}
SelectFinanceType.defaultProps = {
	onChange: () => {},
	onBlur: () => {},
	disabled: false,
	checked: '',
	errorMessage: null
};
SelectFinanceType.propTypes = {
	onChange: PropTypes.func,
	onBlur: PropTypes.func,
	disabled: PropTypes.bool,
	name: PropTypes.string.isRequired,
	valueSpending: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	valueComing: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	valueMoving: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	checked: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	errorMessage: PropTypes.string
};
