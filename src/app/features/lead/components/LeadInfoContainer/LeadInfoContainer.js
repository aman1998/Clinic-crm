import { makeStyles } from '@material-ui/core';
import React from 'react';
import PropTypes from 'prop-types';
import { LeadInfoBlock } from './LeadInfoBlock/LeadInfoBlock';

const useStyles = makeStyles(() => ({
	btn: {
		minWidth: 366,
		marginRight: 28,
		padding: '0px 110px',
		backgroundColor: '#E7E7E7',
		height: 56,
		borderRadius: 5,
		fontWeight: 700
	}
}));

export const LeadInfoContainer = ({ leadsTableData, dragStartHandler, dropHandler, setIsStageModalOpen }) => {
	const classes = useStyles();

	return (
		<div className="flex overflow-x-scroll ">
			{leadsTableData.map(leadBlock => (
				<LeadInfoBlock
					dragStartHandler={dragStartHandler}
					dropHandler={dropHandler}
					key={leadBlock.uuid}
					leadBlockData={leadBlock}
				/>
			))}
			{/* <LeadInfoBlock /> */}
			<button type="button" className={`${classes.btn} text-dark-blue`} onClick={() => setIsStageModalOpen(true)}>
				+ Добавить этап
			</button>
		</div>
	);
};

LeadInfoContainer.propTypes = {
	leadsTableData: PropTypes.arrayOf(),
	dragStartHandler: PropTypes.func.isRequired,
	dropHandler: PropTypes.func.isRequired,
	setIsStageModalOpen: PropTypes.func
};

LeadInfoContainer.defaultProps = {
	leadsTableData: [],
	setIsStageModalOpen: () => {}
};
