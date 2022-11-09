import React from 'react';
import { useSelector } from 'react-redux';
import AppBar from '@material-ui/core/AppBar';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Typography from '@material-ui/core/Typography';
import Hidden from '@material-ui/core/Hidden';
import { makeStyles, ThemeProvider, useTheme } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import NavbarMobileToggleButton from 'app/fuse-layouts/shared-components/NavbarMobileToggleButton';
import UserMenu from 'app/fuse-layouts/shared-components/UserMenu';
import { NotificationListPopover } from '../../../common/Notifications/NotificationListPopover';
import { SelectBranch } from '../../../common/SelectBranch';

const useStyles = makeStyles(theme => ({
	separator: {
		width: 1,
		height: 64,
		backgroundColor: theme.palette.divider
	},

	title: {
		marginLeft: '32px',
		fontSize: '24px',
		fontWeight: 'bold',
		[theme.breakpoints.down('xs')]: {
			marginLeft: '16px',
			fontSize: '16px'
		}
	}
}));

function ToolbarLayout1(props) {
	const config = useSelector(({ fuse }) => fuse.settings.current.layout.config);
	const toolbarTheme = useSelector(({ fuse }) => fuse.settings.toolbarTheme);

	const classes = useStyles(props);
	const theme = useTheme();
	const matches = useMediaQuery(theme.breakpoints.down(768));

	const title = useSelector(({ fuse }) => fuse.toolbar.title);
	const isObjectTitle = typeof title === 'object';

	return (
		<ThemeProvider theme={toolbarTheme}>
			<AppBar
				id="fuse-toolbar"
				className="flex relative z-10"
				color="default"
				style={{ backgroundColor: toolbarTheme.palette.background.default }}
			>
				<Toolbar className="p-0">
					{config.navbar.display && config.navbar.position === 'left' && (
						<Hidden lgUp>
							<NavbarMobileToggleButton className="w-64 h-64 p-0" />
							<div className={classes.separator} />
						</Hidden>
					)}
					<div className="flex justify-between items-center flex-1 w-64 pr-20">
						<Typography noWrap variant="h4" className={classes.title} color="secondary">
							{isObjectTitle ? title.name : title}
						</Typography>

						{title.content}
					</div>

					{!matches && (
						<div className="ml-10 mr-10">
							<SelectBranch />
						</div>
					)}

					<div className={classes.separator} />

					<div className="ml-10 mr-10">
						<NotificationListPopover />
					</div>

					{/* <div className={classes.separator} /> */}

					{/* <div className="ml-10 mr-10"> <NotificationChat /> </div> */}

					<div className={classes.separator} />

					<UserMenu />
					{config.navbar.display && config.navbar.position === 'right' && (
						<Hidden lgUp>
							<NavbarMobileToggleButton />
						</Hidden>
					)}
				</Toolbar>
			</AppBar>
		</ThemeProvider>
	);
}

export default React.memo(ToolbarLayout1);
