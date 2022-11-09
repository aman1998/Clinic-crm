import React from 'react';
import PropTypes from 'prop-types';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import { useDispatch } from 'react-redux';
import * as Actions from './store/actions/state.actions';

function ChatPanelToggleButton ({ children }) {
	const dispatch = useDispatch();

	return (
		<IconButton className="w-64 h-64" onClick={ev => dispatch(Actions.toggleChatPanel())}>
			{children}
		</IconButton>
	);
}

ChatPanelToggleButton.defaultProps = {
	children: <Icon>chat</Icon>
};
ChatPanelToggleButton.propTypes = {
	children: PropTypes.node
};

export default ChatPanelToggleButton;
