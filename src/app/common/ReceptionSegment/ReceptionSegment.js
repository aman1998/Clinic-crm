import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { CardSegment } from '../CardSegment';
import {
	STATUS_RECEPTION_APPOINTED,
	STATUS_RECEPTION_CONFIRMED,
	STATUS_RECEPTION_CASH,
	STATUS_RECEPTION_PAID,
	STATUS_RECEPTION_CANCEL,
	STATUS_RECEPTION_FAILED,
	STATUS_RECEPTION_NOT_PAID
} from '../../services/clinic/constants';

const useStyles = makeStyles(theme => ({
	segment: {
		position: 'relative',
		width: '100%',
		height: '100%',
		border: '2px solid transparent',
		borderRadius: 15,
		fontWeight: 700,
		whiteSpace: 'nowrap',
		borderColor: theme.palette.grey[700],
		backgroundColor: theme.palette.background.default,
		fontSize: 13,
		color: theme.palette.grey[700]
	},
	segmentIsAppointed: {
		borderColor: theme.palette.warning.main,
		color: theme.palette.warning.main
	},
	segmentIsConfirmed: {
		borderColor: theme.palette.warning.main,
		backgroundColor: theme.palette.warning.main,
		color: theme.palette.background.default
	},
	segmentIsCash: {
		borderColor: theme.palette.success.main,
		color: theme.palette.success.main
	},
	segmentIsPaid: {
		borderColor: theme.palette.success.main,
		backgroundColor: theme.palette.success.main,
		color: theme.palette.background.default
	},
	segmentIsCancel: {
		borderColor: theme.palette.error.main,
		backgroundColor: theme.palette.error.main,
		color: theme.palette.background.default
	}
}));

export function ReceptionSegment({ reception, onClick }) {
	const classes = useStyles();

	const classList = clsx(
		{
			[classes.segmentIsAppointed]: reception.status === STATUS_RECEPTION_APPOINTED,
			[classes.segmentIsConfirmed]: reception.status === STATUS_RECEPTION_CONFIRMED,
			[classes.segmentIsCash]: reception.status === STATUS_RECEPTION_CASH,
			[classes.segmentIsPaid]: reception.status === STATUS_RECEPTION_PAID,
			[classes.segmentIsCancel]: [
				STATUS_RECEPTION_CANCEL,
				STATUS_RECEPTION_FAILED,
				STATUS_RECEPTION_NOT_PAID
			].includes(reception.status)
		},
		classes.segment
	);

	return (
		<div className={classList} title="Приём">
			<CardSegment
				patient={reception.patient}
				duration={reception.duration}
				date_time={reception.date_time}
				onClick={() => onClick(reception)}
			/>
		</div>
	);
}
ReceptionSegment.defaultProps = {
	onClick: () => {}
};
ReceptionSegment.propTypes = {
	reception: PropTypes.shape({
		status: PropTypes.oneOf([
			STATUS_RECEPTION_APPOINTED,
			STATUS_RECEPTION_CONFIRMED,
			STATUS_RECEPTION_CASH,
			STATUS_RECEPTION_PAID,
			STATUS_RECEPTION_CANCEL,
			STATUS_RECEPTION_FAILED,
			STATUS_RECEPTION_NOT_PAID
		]).isRequired,
		date_time: PropTypes.string.isRequired,
		duration: PropTypes.number.isRequired,
		patient: PropTypes.shape({
			last_name: PropTypes.string.isRequired,
			first_name: PropTypes.string.isRequired
		}).isRequired
	}).isRequired,
	onClick: PropTypes.func
};
