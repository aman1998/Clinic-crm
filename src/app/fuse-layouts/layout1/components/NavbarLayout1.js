import FuseScrollbars from '@fuse/core/FuseScrollbars';
import AppBar from '@material-ui/core/AppBar';
import Hidden from '@material-ui/core/Hidden';
import Icon from '@material-ui/core/Icon';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Logo from 'app/fuse-layouts/shared-components/Logo';
import NavbarFoldedToggleButton from 'app/fuse-layouts/shared-components/NavbarFoldedToggleButton';
import NavbarMobileToggleButton from 'app/fuse-layouts/shared-components/NavbarMobileToggleButton';
import Navigation from 'app/fuse-layouts/shared-components/Navigation';
import clsx from 'clsx';
import React from 'react';
import { Divider } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { ListReceptionsStatus } from './ListReceptionsStatus';

const useStyles = makeStyles({
	content: {
		overflowX: 'hidden',
		overflowY: 'auto',
		'-webkit-overflow-scrolling': 'touch',
		background: 'secondary',
		backgroundRepeat: 'no-repeat',
		backgroundSize: '100% 40px, 100% 10px',
		backgroundAttachment: 'local, scroll'
	},
	items: {
		color: 'secondary'
	}
});

function NavbarLayout1(props) {
	const classes = useStyles();
	const theme = useTheme();

	const config = useSelector(({ fuse }) => fuse.settings.current.layout.config);
	const navbar = useSelector(({ fuse }) => fuse.navbar);
	const foldedAndClosed = config.navbar.folded && !navbar.foldedOpen;

	return (
		<div className={clsx('flex flex-col overflow-hidden h-full', props.className)}>
			<AppBar
				position="static"
				elevation={0}
				className="flex flex-row items-center flex-shrink h-64 min-h-64 px-12"
				style={{ backgroundColor: theme.palette.background.default }}
			>
				<div className="flex flex-1 mx-8">
					<Logo />
				</div>

				<Hidden mdDown>
					<NavbarFoldedToggleButton className="w-40 h-40 p-0" />
				</Hidden>

				<Hidden lgUp>
					<NavbarMobileToggleButton className="w-40 h-40 p-0">
						<Icon>{theme.direction === 'ltr' ? 'arrow_back' : 'arrow_forward'}"</Icon>
					</NavbarMobileToggleButton>
				</Hidden>
			</AppBar>

			<FuseScrollbars className={clsx(classes.content)} option={{ suppressScrollX: true }}>
				<Navigation layout="vertical" />
			</FuseScrollbars>

			{!foldedAndClosed && (
				<>
					<Divider className="mt-auto" />
					<div className="py-20 px-24">
						<ListReceptionsStatus />
					</div>
				</>
			)}
		</div>
	);
}

export default React.memo(NavbarLayout1);
