import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import {
	STATUS_RECEPTION_APPOINTED,
	STATUS_RECEPTION_CONFIRMED,
	STATUS_RECEPTION_CASH,
	STATUS_RECEPTION_PAID,
	STATUS_RECEPTION_CANCEL,
	STATUS_RECEPTION_FAILED,
	STATUS_RECEPTION_NOT_PAID,
	STATUS_RECEPTION_WAITING
} from '../../services/clinic/constants';

const useStyles = makeStyles(theme => ({
	statusBox: {
		display: 'inline-block',
		padding: '5px 10px 2px',
		border: '1px solid transparent',
		borderRadius: 30,
		fontWeight: 700,
		textAlign: 'center',
		whiteSpace: 'nowrap',
		borderColor: theme.palette.grey[700],
		color: theme.palette.grey[700]
	},
	statusBoxIsAppointed: {
		borderColor: theme.palette.warning.main,
		color: theme.palette.warning.main
	},
	statusBoxIsConfirmed: {
		borderColor: theme.palette.warning.main,
		backgroundColor: theme.palette.warning.main,
		color: theme.palette.background.default
	},
	statusBoxIsWaiting: {
		borderColor: theme.palette.grey,
		backgroundColor: theme.palette.grey
	},
	statusBoxIsCash: {
		borderColor: theme.palette.success.main,
		color: theme.palette.success.main
	},
	statusBoxIsPaid: {
		borderColor: theme.palette.success.main,
		backgroundColor: theme.palette.success.main,
		color: theme.palette.background.default
	},
	statusBoxIsCancel: {
		borderColor: theme.palette.error.main,
		backgroundColor: theme.palette.error.main,
		color: theme.palette.background.default
	}
}));

export function BlockReceptionStatus({ status, text }) {
	const classes = useStyles();

	const classList = clsx(
		{
			[classes.statusBoxIsAppointed]: status === STATUS_RECEPTION_APPOINTED,
			[classes.statusBoxIsConfirmed]: status === STATUS_RECEPTION_CONFIRMED,
			[classes.statusBoxIsCash]: status === STATUS_RECEPTION_CASH,
			[classes.statusBoxIsPaid]: status === STATUS_RECEPTION_PAID,
			[classes.statusBoxIsWaiting]: status === STATUS_RECEPTION_WAITING,
			[classes.statusBoxIsCancel]: [
				STATUS_RECEPTION_CANCEL,
				STATUS_RECEPTION_FAILED,
				STATUS_RECEPTION_NOT_PAID
			].includes(status)
		},
		classes.statusBox
	);
	const title = {
		[STATUS_RECEPTION_APPOINTED]: 'Прием назначен',
		[STATUS_RECEPTION_CONFIRMED]: 'Прием подтвержден',
		[STATUS_RECEPTION_CASH]: 'Отправлено на кассу',
		[STATUS_RECEPTION_PAID]: 'Оплачено пациентом',
		[STATUS_RECEPTION_CANCEL]: 'Прием отменён',
		[STATUS_RECEPTION_FAILED]: 'Прием не состоялся',
		[STATUS_RECEPTION_WAITING]: 'В ожидании',
		[STATUS_RECEPTION_NOT_PAID]: 'Прием не оплатили'
	}[status];

	return <div className={`${classList} w-full truncate`}>{text ?? title}</div>;
}
BlockReceptionStatus.defaultProps = {
	status: null,
	text: null
};
BlockReceptionStatus.propTypes = {
	status: PropTypes.oneOf([
		STATUS_RECEPTION_APPOINTED,
		STATUS_RECEPTION_CONFIRMED,
		STATUS_RECEPTION_CASH,
		STATUS_RECEPTION_PAID,
		STATUS_RECEPTION_CANCEL,
		STATUS_RECEPTION_FAILED,
		STATUS_RECEPTION_NOT_PAID
	]),
	text: PropTypes.string
};
