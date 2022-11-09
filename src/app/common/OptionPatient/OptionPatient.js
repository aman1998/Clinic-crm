import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { getFullName } from '../../utils';

const useStyles = makeStyles(theme => ({
	container: {
		width: '100%'
	},
	info: {
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		width: '100%',
		marginTop: theme.spacing(1),
		wordBreak: 'break-word',
		fontSize: 14,
		color: theme.palette.grey[500]
	}
}));

export function OptionPatient({ patient }) {
	const classes = useStyles();

	return (
		<div className={classes.container}>
			{getFullName(patient)}
			<div className={classes.info}>
				{patient.main_phone && <div>{patient.main_phone}</div>}
				{patient.iin && <div>ИИН: {patient.iin}</div>}
			</div>
		</div>
	);
}
OptionPatient.propTypes = {
	patient: PropTypes.shape({
		first_name: PropTypes.string,
		middle_name: PropTypes.string,
		last_name: PropTypes.string,
		iin: PropTypes.string,
		main_phone: PropTypes.string
	}).isRequired
};
