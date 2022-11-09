import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles, Paper } from '@material-ui/core';
import { useHistory } from 'react-router';
import moment from 'moment';
import { getFirstLetter, getFullName } from 'app/utils';
import { STATUS } from '../../constants';
import { Deadline } from './Deadline';

const useStyles = makeStyles(theme => ({
	container: {
		width: 366,
		display: 'flex',
		justifyContent: 'space-between',
		padding: 13,
		cursor: 'pointer'
	},
	name: {
		fontWeight: 700,
		fontSize: 14
	},
	taskManager: {
		fontSize: 7
	},
	date: {
		fontWeight: 400,
		fontSize: 10
	},
	initials: {
		backgroundColor: '#818181',
		color: '#fff',
		borderRadius: '50%',
		marginRight: 6,
		padding: '6px 3px'
	},
	phoneNumber: {
		fontSize: 12,
		margin: '5px 0',
		color: '#007BFF',
		fontWeight: 700
	}
}));

export const LeadInfoRow = ({
	leadRowData,
	filterByName,
	dragStartHandler,
	dragEndHandler,
	dragOverHandler,
	stageUuid
}) => {
	const [leadData, setLeadData] = useState(null);
	const classes = useStyles();
	const history = useHistory();

	const fullName = getFullName(leadRowData);
	const fullNameOfResponsibleUser = getFullName(leadRowData?.responsible_user);
	const shortName = `${getFirstLetter(leadRowData?.responsible_user.last_name)} ${getFirstLetter(
		leadRowData?.responsible_user.first_name
	)}`;

	const createdDate = moment(leadRowData.created_at).format('DD MMMM YYYY');

	const handleClick = () => {
		history.push(`leads/${stageUuid}/lead/${leadRowData.uuid}`);
	};

	useEffect(() => {
		if (filterByName === STATUS.SUCCESS && leadRowData.status !== 'SUCCESS') {
			setLeadData(null);
		}
		setLeadData(leadRowData);
	}, [leadRowData, filterByName]);

	if (!leadData) {
		return <></>;
	}

	return (
		<Paper
			elevation={3}
			className={classes.container}
			onClick={handleClick}
			onDragStart={dragStartHandler}
			onDragEnd={dragEndHandler}
			onDragOver={dragOverHandler}
			draggable
		>
			<div>
				<div className={classes.name}>{fullName}</div>
				<div className={`${classes.phoneNumber}`}>{leadRowData.phone_number && leadRowData.phone_number}</div>
				<div className={classes.taskManager}>
					{leadRowData?.responsible_user.first_name && (
						<>
							<span className={classes.initials}>{shortName}</span>
							{fullNameOfResponsibleUser}
						</>
					)}
				</div>
			</div>
			<div className="flex flex-col justify-between">
				<div className={classes.date}> {createdDate}</div>
				<Deadline tasks={leadRowData?.tasks} />
			</div>
		</Paper>
	);
};

LeadInfoRow.propTypes = {
	leadRowData: PropTypes.arrayOf(
		PropTypes.shape({
			last_name: PropTypes.string,
			patronymic: PropTypes.string,
			first_name: PropTypes.string,
			created_at: PropTypes.string,
			status: PropTypes.string,
			responsible_user: PropTypes.string,
			tasks: PropTypes.arrayOf()
		})
	).isRequired,
	filterByName: PropTypes.string,
	dragStartHandler: PropTypes.func.isRequired,
	dragEndHandler: PropTypes.func.isRequired,
	dragOverHandler: PropTypes.func.isRequired,
	stageUuid: PropTypes.string.isRequired
};

LeadInfoRow.defaultProps = {
	filterByName: ''
};
