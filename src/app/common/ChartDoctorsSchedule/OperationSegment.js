import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { CardSegment } from '../CardSegment';
import {
	OPERATION_STATUS_CANCELED,
	OPERATION_STATUS_COMPLETED,
	OPERATION_STATUS_IN_PROGRESS
} from '../../services/operation/constants';

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
	segmentIsCanceled: {
		borderColor: theme.palette.error.main,
		backgroundColor: theme.palette.error.main,
		color: theme.palette.background.default
	},
	segmentIsCompleted: {
		borderColor: theme.palette.success.main,
		backgroundColor: theme.palette.success.main,
		color: theme.palette.background.default
	},
	segmentIsInProgress: {
		borderColor: theme.palette.primary.main,
		backgroundColor: theme.palette.primary.main,
		color: theme.palette.background.default
	}
}));

export function OperationSegment({ operation, onClick }) {
	const classes = useStyles();

	const classList = clsx(
		{
			[classes.segmentIsCanceled]: operation.status === OPERATION_STATUS_CANCELED,
			[classes.segmentIsCompleted]: operation.status === OPERATION_STATUS_COMPLETED,
			[classes.segmentIsInProgress]: operation.status === OPERATION_STATUS_IN_PROGRESS
		},
		classes.segment
	);

	return (
		<div className={classList} title="Операция">
			<CardSegment
				patient={operation.patient}
				duration={operation.duration}
				date_time={operation.date_time}
				onClick={() => onClick(operation)}
			/>
		</div>
	);
}
OperationSegment.defaultProps = {
	onClick: () => {}
};
OperationSegment.propTypes = {
	operation: PropTypes.shape({
		status: PropTypes.oneOf([OPERATION_STATUS_CANCELED, OPERATION_STATUS_COMPLETED, OPERATION_STATUS_IN_PROGRESS])
			.isRequired,
		date_time: PropTypes.string.isRequired,
		duration: PropTypes.number.isRequired,
		patient: PropTypes.shape({
			last_name: PropTypes.string.isRequired,
			first_name: PropTypes.string.isRequired
		}).isRequired
	}).isRequired,
	onClick: PropTypes.func
};
