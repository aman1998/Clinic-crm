import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import {
	STATUS_TREATMENT_COMPLETED,
	STATUS_TREATMENT_IN_PROGRESS,
	STATUS_TREATMENT_WAITING,
	STATUS_TREATMENT_CANCELED,
	STATUS_TREATMENT_NOT_STARTED
} from '../../services/treatment/constants';

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
	statusBoxIsNotStarted: {
		borderColor: theme.palette.grey,
		color: theme.palette.grey
	},
	statusBoxIsConfirmed: {
		borderColor: theme.palette.warning.main,
		backgroundColor: theme.palette.warning.main,
		color: theme.palette.background.default
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

export function BlockTreatmentStatus({ status, text }) {
	const classes = useStyles();

	const classList = clsx(
		{
			[classes.statusBoxIsAppointed]: status === STATUS_TREATMENT_WAITING,
			[classes.statusBoxIsNotStarted]: status === STATUS_TREATMENT_NOT_STARTED,
			[classes.statusBoxIsPaid]: status === STATUS_TREATMENT_IN_PROGRESS,
			[classes.statusBoxIsCancel]: status === STATUS_TREATMENT_CANCELED,
			[classes.statusBoxIsConfirmed]: status === STATUS_TREATMENT_COMPLETED
		},
		classes.statusBox
	);
	const title = {
		[STATUS_TREATMENT_WAITING]: 'Ожидание лечении',
		[STATUS_TREATMENT_NOT_STARTED]: 'Отсутствует дата начала',
		[STATUS_TREATMENT_IN_PROGRESS]: 'Лечение в прогресса',
		[STATUS_TREATMENT_CANCELED]: 'Лечение отменено',
		[STATUS_TREATMENT_COMPLETED]: 'Лечение закончено'
	}[status];

	return <div className={`${classList} truncate`}>{text ?? title}</div>;
}
BlockTreatmentStatus.defaultProps = {
	status: null,
	text: null
};
BlockTreatmentStatus.propTypes = {
	status: PropTypes.oneOf([
		STATUS_TREATMENT_COMPLETED,
		STATUS_TREATMENT_IN_PROGRESS,
		STATUS_TREATMENT_WAITING,
		STATUS_TREATMENT_CANCELED,
		STATUS_TREATMENT_NOT_STARTED
	]),
	text: PropTypes.string
};
