import React from 'react';
import { Tab } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
	tabRoot: {
		height: '60px',
		paddingRight: 15,
		paddingLeft: 15,
		textTransform: 'uppercase',
		fontWeight: 'normal',
		minWidth: 'fit-content'
	},
	textColorSecondary: {
		color: theme.palette.secondary.main
	}
}));

export function TabsLinkItem(props) {
	const classes = useStyles();

	return <Tab classes={{ root: classes.tabRoot, textColorSecondary: classes.textColorSecondary }} {...props} />;
}
