import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { CallOut as CallOutIcon, CallIn as CallInIcon } from 'app/bizKITUi/Icons';
import { telephonyService } from '../../services';
import {
	CALL_TYPE_IN,
	CALL_TYPE_OUT,
	CALL_STATUS_SUCCESS,
	CALL_STATUS_BUSY,
	CALL_STATUS_NOT_AVAILABLE,
	CALL_STATUS_NOT_ALLOWED,
	CALL_STATUS_MISSED,
	CALL_STATUS_ERROR
} from '../../services/telephony/constants';

const useStyles = makeStyles(theme => ({
	iconSizeXS: {
		fontSize: '1.75rem'
	},
	iconSizeSM: {
		fontSize: '2.25rem'
	},
	iconSizeLG: {
		fontSize: '3rem'
	},
	text: {
		marginLeft: theme.spacing(1)
	},
	success: {
		color: theme.palette.success.main
	},
	error: {
		color: theme.palette.error.main
	}
}));

const IN_SUCCESS = telephonyService.getCallVariant(CALL_TYPE_IN, CALL_STATUS_SUCCESS);
const IN_MISSED = telephonyService.getCallVariant(CALL_TYPE_IN, CALL_STATUS_MISSED);
const OUT_SUCCESS = telephonyService.getCallVariant(CALL_TYPE_OUT, CALL_STATUS_SUCCESS);
const OUT_MISSED = telephonyService.getCallVariant(CALL_TYPE_OUT, CALL_STATUS_BUSY);

/**
 * Component renders Icon that indicates call status, and text with status description
 * @param {object} params
 * @param {string} params.type
 * @param {string} params.status
 * @param {boolean} params.iconOnly hides text and leave only icon
 * @param {('xs'|'sm'|'lg')} params.iconSize defines icon size
 */
export function CallStatusIndicator({ type, status, iconOnly, iconSize }) {
	const classes = useStyles();

	const size = {
		xs: classes.iconSizeXS,
		sm: classes.iconSizeSM,
		lg: classes.iconSizeLG
	}[iconSize];
	const IconVariants = useMemo(() => {
		const variants = new Map();
		variants.set(IN_SUCCESS, <CallInIcon title={IN_SUCCESS.name} className={`${size} ${classes.success}`} />);
		variants.set(IN_MISSED, <CallInIcon title={IN_MISSED.name} className={`${size} ${classes.error}`} />);
		variants.set(OUT_SUCCESS, <CallOutIcon title={OUT_SUCCESS.name} className={`${size} ${classes.success}`} />);
		variants.set(OUT_MISSED, <CallOutIcon title={OUT_MISSED.name} className={`${size} ${classes.error}`} />);
		return variants;
	}, [classes, size]);

	const variant = telephonyService.getCallVariant(type, status);
	const Icon = IconVariants.get(variant);

	return (
		<>
			{Icon}
			{!iconOnly && <span className={classes.text}> {variant.name}</span>}
		</>
	);
}

CallStatusIndicator.defaultProps = {
	iconOnly: false,
	iconSize: 'sm'
};
CallStatusIndicator.propTypes = {
	iconOnly: PropTypes.bool,
	iconSize: PropTypes.oneOf(['xs', 'sm', 'lg']),
	type: PropTypes.oneOf([CALL_TYPE_IN, CALL_TYPE_OUT]).isRequired,
	// eslint-disable-next-line react/require-default-props
	status(props, propName) {
		const valid = {
			[CALL_TYPE_IN]: [CALL_STATUS_SUCCESS, CALL_STATUS_MISSED],
			[CALL_TYPE_OUT]: [
				CALL_STATUS_SUCCESS,
				CALL_STATUS_BUSY,
				CALL_STATUS_NOT_AVAILABLE,
				CALL_STATUS_NOT_ALLOWED,
				CALL_STATUS_ERROR
			]
		};
		if (String(props[propName]).trim() === '') {
			return new Error(`Prop ${propName} is required`);
		}
		if (![...valid.IN, ...valid.OUT].includes(props[propName])) {
			return new Error(`Invalid value '${props[propName]}' for ${propName}`);
		}
		if (!valid[props.type].includes(props[propName])) {
			return new Error(`Status '${props[propName]}' could not be used with type '${props.type}'`);
		}
		return undefined;
	}
};
