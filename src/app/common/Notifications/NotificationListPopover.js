import React, { useState } from 'react';
import { ButtonBase, IconButton, Badge, Popover, Box } from '@material-ui/core';
import { Notifications as NotificationsIcon } from '@material-ui/icons';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { NotificationItem } from './NotificationItem';
import { ModalNotificationDetails } from './ModalNotificationDetails';
import * as globalNotificationsSelectors from '../../store/notifications/selectors';
import * as globalNotificationsActions from '../../store/notifications/actions';

const useStyles = makeStyles({
	list: {
		width: '400px',
		maxWidth: '100%'
	},
	tabHeader: {
		display: 'flex',
		alignItems: 'center',
		padding: '20px'
	},
	tabButton: {
		marginRight: '15px',
		fontSize: '1.4rem'
	},
	tabButtonActive: {
		fontWeight: 600,
		color: '#007BFF'
	},
	linkAll: {
		marginLeft: 'auto',
		fontSize: '1.4rem'
	},
	item: {
		padding: '20px',
		borderTop: '1px solid #E0E0E0'
	}
});

export function NotificationListPopover() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const seenNewNotifications = useSelector(globalNotificationsSelectors.seenNewNotifications);
	const notSeenNewNotifications = useSelector(globalNotificationsSelectors.notSeenNewNotifications);
	const countNewNotifications = useSelector(globalNotificationsSelectors.countNewNotifications);
	const [anchorEl, setAnchorEl] = React.useState(null);
	const [tabNumber, setTabNumber] = React.useState(0);
	const [selectedNotify, setSelectedNotify] = useState(null);

	const handleOnViewNotify = notify => {
		setAnchorEl(null);
		setSelectedNotify(notify);

		if (notify.seen) {
			return;
		}

		dispatch(globalNotificationsActions.viewNewNotifications(notify.uuid));
	};

	return (
		<>
			<IconButton onClick={event => setAnchorEl(event.currentTarget)}>
				<Badge badgeContent={countNewNotifications} color="error">
					<NotificationsIcon color="primary" />
				</Badge>
			</IconButton>

			<Popover
				open={!!anchorEl}
				anchorEl={anchorEl}
				onClose={() => setAnchorEl(null)}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right'
				}}
			>
				<div className={classes.list}>
					<div className={classes.tabHeader}>
						<ButtonBase
							className={clsx(classes.tabButton, { [classes.tabButtonActive]: tabNumber === 0 })}
							type="button"
							onClick={() => setTabNumber(0)}
						>
							Новые ({notSeenNewNotifications.length})
						</ButtonBase>
						<ButtonBase
							className={clsx(classes.tabButton, { [classes.tabButtonActive]: tabNumber === 1 })}
							type="button"
							onClick={() => setTabNumber(1)}
						>
							Прочитанные ({seenNewNotifications.length})
						</ButtonBase>

						{/* <a className={classes.linkAll} href="/">
							Все
						</a> */}
					</div>

					{tabNumber === 0 && (
						<div>
							{notSeenNewNotifications.length === 0 && (
								<div className={classes.item}>Новых уведомлений нет</div>
							)}

							{notSeenNewNotifications.map(item => (
								<div key={item.uuid} className={classes.item}>
									<NotificationItem notify={item} onView={handleOnViewNotify} />
									<Box marginBottom={1} />
								</div>
							))}
						</div>
					)}

					{tabNumber === 1 && (
						<div>
							{seenNewNotifications.length === 0 && (
								<div className={classes.item}>Прочитанных уведомлений нет</div>
							)}

							{seenNewNotifications.map(item => (
								<div key={item.uuid} className={classes.item}>
									<NotificationItem notify={item} onView={handleOnViewNotify} />
									<Box marginBottom={1} />
								</div>
							))}
						</div>
					)}
				</div>
			</Popover>

			{selectedNotify && (
				<ModalNotificationDetails onClose={() => setSelectedNotify(null)} notify={selectedNotify} />
			)}
		</>
	);
}
