import React from 'react';
import PropTypes from 'prop-types';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import * as Actions from 'app/store/fuse/actions';
import { useDispatch } from 'react-redux';

function NavbarMobileToggleButton({ className, children }) {
	const dispatch = useDispatch();

	return (
		<IconButton
			className={className}
			onClick={ev => dispatch(Actions.navbarToggleMobile())}
			color="inherit"
			disableRipple
		>
			{children}
		</IconButton>
	);
}

NavbarMobileToggleButton.defaultProps = {
	className: null,
	children: <Icon>menu</Icon>
};
NavbarMobileToggleButton.propTypes = {
	className: PropTypes.string,
	children: PropTypes.node
};

export default NavbarMobileToggleButton;
