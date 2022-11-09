import React, { useState, useEffect } from 'react';
import { makeStyles, Tabs } from '@material-ui/core';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { TabsLinkItem } from './TabsLinkItem';
import { usePermissions } from '../../hooks';

function removeTrailingSlash(url) {
	return String(url).replace(/\/$/, '');
}

const useStyles = makeStyles(theme => ({
	root: {
		width: '100%',
		backgroundColor: 'transparent'
	},
	scroller: {
		paddingLeft: theme.spacing(2),
		paddingRight: theme.spacing(2)
	}
}));

export function TabsLink({ config }) {
	const classes = useStyles();
	const history = useHistory();
	const { hasPermission } = usePermissions();
	const [tab, setTab] = useState(null);

	useEffect(() => {
		const currentTab = removeTrailingSlash(history.location.pathname);
		// if we have access - just set tab
		for (const item of config) {
			if (currentTab === item.url && hasPermission(item.auth ?? [])) {
				setTab(item.url);
				return;
			}
		}

		// Try to redirect to first permitted tab
		for (const item of config) {
			if (hasPermission(item.auth ?? [])) {
				if (currentTab !== item.url) {
					history.replace(item.url);
				}
				setTab(item.url);
				return;
			}
		}

		// Otherwise redirect to 404
		history.push('/error-404');
	}, [config, history, hasPermission]);

	const handleOnChangeTab = (_, value) => {
		history.push(removeTrailingSlash(value));
		setTab(value);
	};

	const permittedTabs = config.filter(item => hasPermission(item.auth ?? []));

	if (!tab) {
		return null;
	}
	return (
		<Tabs
			value={tab}
			onChange={handleOnChangeTab}
			indicatorColor="primary"
			textColor="primary"
			variant="scrollable"
			scrollButtons="auto"
			classes={{ root: classes.root, scroller: classes.scroller }}
		>
			{permittedTabs.map(item => (
				<TabsLinkItem key={item.url} label={item.label} value={item.url} />
			))}
		</Tabs>
	);
}
TabsLink.propTypes = {
	config: PropTypes.arrayOf(
		PropTypes.shape({
			label: PropTypes.string.isRequired,
			url: PropTypes.string.isRequired,
			auth: PropTypes.arrayOf(PropTypes.string)
		}).isRequired
	)
};
