import React from 'react';
import PropTypes from 'prop-types';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import { useDispatch } from 'react-redux';
import * as quickPanelActions from './store/actions';

function QuickPanelToggleButton({ children }) {
	const dispatch = useDispatch();

	return (
		<IconButton className="w-64 h-64" onClick={ev => dispatch(quickPanelActions.toggleQuickPanel())}>
			{children}
		</IconButton>
	);
}

QuickPanelToggleButton.defaultProps = {
	children: <Icon>format_list_bulleted</Icon>
};
QuickPanelToggleButton.propTypes = {
	children: PropTypes.node
};

export default QuickPanelToggleButton;
