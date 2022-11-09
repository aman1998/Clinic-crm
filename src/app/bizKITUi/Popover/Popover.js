import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { MoreVert as MoreVertIcon } from '@material-ui/icons';
import { IconButton, Popover as PopoverLib } from '@material-ui/core';

export function Popover({ icon, closeOnClick, children }) {
	const [anchorMenu, setAnchorMenu] = useState(null);

	const handleOnCloseOnClick = () => {
		if (!closeOnClick) {
			return;
		}

		setAnchorMenu(null);
	};

	return (
		<>
			<IconButton color="inherit" onClick={event => setAnchorMenu(event.currentTarget)}>
				{icon}
			</IconButton>
			<PopoverLib
				anchorEl={anchorMenu}
				open={Boolean(anchorMenu)}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center'
				}}
				onClick={handleOnCloseOnClick}
				onClose={() => setAnchorMenu(null)}
			>
				{children}
			</PopoverLib>
		</>
	);
}

Popover.defaultProps = {
	icon: <MoreVertIcon />,
	closeOnClick: true
};

Popover.propTypes = {
	icon: PropTypes.element,
	closeOnClick: PropTypes.bool
};
