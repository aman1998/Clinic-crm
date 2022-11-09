import React from 'react';
import PropTypes from 'prop-types';
import { useMutation } from 'react-query';
import { IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Call as CallIcon } from '@material-ui/icons';
import { telephonyService } from '../../services';
import { useAlert } from '../../hooks';

const useStyles = makeStyles(theme => ({
	callIcon: {
		color: theme.palette.success.main
	},
	callIconDisabled: {
		color: theme.palette.grey[300]
	}
}));

export function CallButton({ phoneNumber, ...props }) {
	const classes = useStyles();
	const { alertSuccess, alertError } = useAlert();

	const makeCall = useMutation(number => telephonyService.makeCall({ phone_number: number }));
	const handleCall = event => {
		event.stopPropagation();
		makeCall
			.mutateAsync(phoneNumber)
			.then(() => {
				alertSuccess('Соединяем');
			})
			.catch(() => {
				alertError('Не удалось соединить');
			});
	};

	return (
		<IconButton edge="end" disabled={!phoneNumber} aria-label="Позвонить" onClick={handleCall} {...props}>
			<CallIcon className={phoneNumber ? classes.callIcon : classes.callIconDisabled} />
		</IconButton>
	);
}

CallButton.defaultProps = {
	phoneNumber: null
};
CallButton.propTypes = {
	phoneNumber: PropTypes.string
};
