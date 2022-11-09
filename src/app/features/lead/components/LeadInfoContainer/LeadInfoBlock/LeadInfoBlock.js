import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useHistory } from 'react-router';
import { makeStyles } from '@material-ui/core';
import { LeadInfoRow } from '../LeadInfoRow/LeadInfoRow';

const useStyles = makeStyles(theme => ({
	container: {
		minWidth: 366,
		marginRight: 28,
		marginBottom: 20
	},
	taskOver: {
		paddingTop: 30
	},
	header: {
		width: '100%',
		padding: '18px 0',
		display: 'flex',
		justifyContent: 'space-between'
	},
	icon: {
		borderRadius: '50%',
		padding: '2px 6px',
		fontSize: 12,
		color: '#fff',
		fontWeight: 700
	},
	body: {
		margin: '20px 0',
		display: 'grid',
		gap: '16px',
		transition: '.5s'
	},
	headerTitle: {
		color: '#3D5170',
		fontWeight: 700
	},
	dataLength: {
		color: '#646971',
		backgroundColor: 'rgba(224, 224, 224, 0.51)',
		padding: '6px 8px',
		fontSize: 12,
		marginLeft: 8
	}
}));

export const LeadInfoBlock = ({ leadBlockData, dragStartHandler, dropHandler }) => {
	const classes = useStyles();
	const history = useHistory();
	const [isTaskOver, setIsTaskOver] = useState(false);
	const leads = leadBlockData?.leads.sort((a, b) => moment(b.created_at) - moment(a.created_at));

	const dragOverHandler = e => {
		e.preventDefault();
		setIsTaskOver(true);
	};

	const dragLeaveHandler = () => {
		setIsTaskOver(false);
	};

	const onDropHandler = e => {
		e.preventDefault();
		dropHandler(leadBlockData);
		setIsTaskOver(false);
	};

	const handleAddLead = () => {
		history.push(`leads/${leadBlockData.uuid}/lead`);
	};

	return (
		<div
			className={classes.container}
			onDragOver={dragOverHandler}
			onDragLeave={dragLeaveHandler}
			onDrop={onDropHandler}
		>
			<div className={`${classes.header} border-b-2 border-blue`}>
				<span className={classes.headerTitle}>
					{leadBlockData?.name}
					<span className={classes.dataLength}>{leadBlockData?.leads.length}</span>
				</span>
				<button type="button" onClick={handleAddLead} className={`${classes.icon} bg-blue`}>
					+
				</button>
			</div>
			<div onDragOver={dragOverHandler} className={`${classes.body} ${isTaskOver ? classes.taskOver : ''}`}>
				{leads.map(lead => {
					if (lead.stage === leadBlockData.uuid) {
						return (
							<LeadInfoRow
								key={lead.uuid}
								dragStartHandler={e => dragStartHandler(e, lead, leadBlockData)}
								dragEndHandler={dragLeaveHandler}
								dragOverHandler={dragOverHandler}
								filterByName={leadBlockData?.name}
								stageUuid={leadBlockData.uuid}
								leadRowData={lead}
							/>
						);
					}
					return <></>;
				})}
			</div>
			<button type="button" className="text-blue cursor-pointer" onClick={handleAddLead}>
				+ Добавить лид
			</button>
		</div>
	);
};

LeadInfoBlock.propTypes = {
	leadBlockData: PropTypes.shape({
		name: PropTypes.string.isRequired,
		leads: PropTypes.arrayOf().isRequired,
		uuid: PropTypes.string
	}),
	dragStartHandler: PropTypes.func.isRequired,
	dropHandler: PropTypes.func.isRequired
};

LeadInfoBlock.defaultProps = {
	leadBlockData: PropTypes.shape({
		name: '',
		leads: [],
		uuid: PropTypes.string
	})
};
