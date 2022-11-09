import React from 'react';
import PropTypes from 'prop-types';
import _ from '@lodash';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import * as Actions from 'app/store/fuse/actions';
import { useDispatch, useSelector } from 'react-redux';

function NavbarFoldedToggleButton({ className, children }) {
	const dispatch = useDispatch();
	const settings = useSelector(({ fuse }) => fuse.settings.current);

	return (
		<IconButton
			className={className}
			onClick={() => {
				dispatch(
					Actions.setDefaultSettings(
						_.set({}, 'layout.config.navbar.folded', !settings.layout.config.navbar.folded)
					)
				);
			}}
			color="secondary"
		>
			{children}
		</IconButton>
	);
}

NavbarFoldedToggleButton.defaultProps = {
	className: null,
	children: <Icon>menu</Icon>
};
NavbarFoldedToggleButton.propTypes = {
	className: PropTypes.string,
	children: PropTypes.node
};

export default NavbarFoldedToggleButton;
