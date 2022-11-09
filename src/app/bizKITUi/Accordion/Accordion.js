import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MuiExpansionPanel from '@material-ui/core/ExpansionPanel';
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import MuiExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { makeStyles } from '@material-ui/core/styles';
import { Divider } from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles({
	expansionPanel: {
		boxShadow: 'none',
		backgroundColor: 'transparent'
	},
	expansionPanelSummary: {
		display: 'inline-flex',
		margin: 0,
		padding: 0
	},
	expansionPanelDetails: {
		padding: 0
	},
	bottomBtn: {
		marginBottom: 10
	}
});

export function Accordion({
	title,
	children,
	expansionPanelSummary,
	divider,
	setIsInitialExpanded,
	isInitialExpanded,
	bottomCloseBtn
}) {
	const classes = useStyles();

	const [isExpanded, setIsExpanded] = useState(isInitialExpanded);

	const toggleExpand = () => {
		setIsExpanded(prevState => !prevState);
		setIsInitialExpanded(prevState => !prevState);
	};
	return (
		<div>
			<MuiExpansionPanel className={classes.expansionPanel} square expanded={isExpanded} onChange={toggleExpand}>
				<MuiExpansionPanelSummary
					className={clsx(expansionPanelSummary && classes.expansionPanelSummary)}
					expandIcon={<ExpandMoreIcon />}
				>
					{title}
				</MuiExpansionPanelSummary>
				{divider && <Divider />}
				<MuiExpansionPanelDetails className={clsx(classes.expansionPanelDetails, bottomCloseBtn && 'flex-col')}>
					{children}
					{bottomCloseBtn && (
						<button type="button" className="text-grey-600 pb-20" onClick={() => setIsExpanded(false)}>
							<ExpandMoreIcon className="transform rotate-180" />
						</button>
					)}
				</MuiExpansionPanelDetails>
			</MuiExpansionPanel>
		</div>
	);
}

Accordion.defaultProps = {
	title: '',
	children: <></>,
	expansionPanelSummary: true,
	divider: false,
	isInitialExpanded: false,
	setIsInitialExpanded: () => {},
	bottomCloseBtn: false
};

Accordion.propTypes = {
	title: PropTypes.string,
	children: PropTypes.node,
	expansionPanelSummary: PropTypes.bool,
	divider: PropTypes.bool,
	isInitialExpanded: PropTypes.bool,
	setIsInitialExpanded: PropTypes.func,
	bottomCloseBtn: PropTypes.bool
};
