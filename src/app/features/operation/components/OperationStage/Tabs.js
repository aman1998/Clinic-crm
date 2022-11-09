import { withStyles, Tabs, Tab } from '@material-ui/core';

export const StyledTabs = withStyles({
	root: {
		marginLeft: 'auto',
		minHeight: 'auto',
		height: '25px'
	}
})(Tabs);

export const StyledTab = withStyles({
	root: {
		margin: '0 10px',
		minWidth: '50px',
		minHeight: 'auto',
		padding: 0,
		fontSize: '14px',
		fontWeight: 'normal',
		textTransform: 'none'
	}
})(Tab);
