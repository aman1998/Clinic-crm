import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
	tab: {
		width: 110,
		minWidth: 110
	}
});

export function HeaderTabs({ onChange }) {
	const classes = useStyles();

	const [currentTab, setCurrentTab] = useState(0);

	const handleOnChangeCurrentTab = (_, newTab) => {
		setCurrentTab(newTab);
		onChange(newTab);
	};

	return (
		<Tabs value={currentTab} indicatorColor="primary" textColor="primary" onChange={handleOnChangeCurrentTab}>
			<Tab classes={{ root: classes.tab }} label="Новые" />
			<Tab classes={{ root: classes.tab }} label="Все" />
		</Tabs>
	);
}
HeaderTabs.propTypes = {
	onChange: PropTypes.func.isRequired
};
