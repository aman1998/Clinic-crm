import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
	Notifications as NotificationsIcon,
	ShoppingCart as ShoppingCartIcon,
	Remove as RemoveIcon,
	Add as AddIcon
} from '@material-ui/icons';
import moment from 'moment';
import PropTypes from 'prop-types';
import {
	NOTIFICATION_TYPE_WAYBILL_ACCEPT,
	NOTIFICATION_TYPE_WAYBILL_FINISH,
	NOTIFICATION_TYPE_WAYBILL_CANCEL,
	NOTIFICATION_TYPE_RETURNED_WAYBILL,
	NOTIFICATION_TYPE_CHECK_CONTROL_WAYBILL,
	NOTIFICATION_TYPE_PRODUCT_OUT_OF_STOCK,
	NOTIFICATION_TYPE_GLOBAL_FINANCE_ECONOMY,
	NOTIFICATION_TYPE_GLOBAL_FINANCE_OVERSPEND,
	NOTIFICATION_TYPE_GLOBAL_FINANCE_CANCEL,
	NOTIFICATION_TYPE_GLOBAL_FINANCE_COMMENT,
	NOTIFICATION_TYPE_GLOBAL_FINANCE_ACCEPT,
	NOTIFICATION_TYPE_GLOBAL_FINANCE_REWORK,
	NOTIFICATION_TYPE_GLOBAL_FINANCE_CONTROL,
	NOTIFICATION_TYPE_GLOBAL_FINANCE_FAILURE,
	NOTIFICATION_TYPE_GLOBAL_FINANCE_RESPONSIBLE,
	NOTIFICATION_TYPE_REMINDER_START_GLOBAL_FINANCE,
	NOTIFICATION_TYPE_REMINDER_END_GLOBAL_FINANCE,
	NOTIFICATION_TYPE_TASK_END_FAILURE,
	NOTIFICATION_TYPE_TASK_STARTED,
	NOTIFICATION_TYPE_TASK_ENDED
} from '../../services/notifications/constants';
import { waybillsService } from '../../services';
import { numberFormat, getFullName } from '../../utils';

const useStyles = makeStyles({
	container: {
		position: 'relative',
		display: 'flex',
		fontSize: '1.4rem',
		color: '#3D5170'
	},
	message: {
		fontWeight: 600,
		overflowWrap: 'break-word'
	},
	content: {
		marginTop: '4px'
	},
	createAt: {
		marginTop: '6px'
	},
	button: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%'
	},
	wrapIcon: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		width: '40px',
		height: '40px',
		borderRadius: '50%'
	},
	kztIcon: {
		fontSize: 22,
		paddingTop: 3
	}
});

function KztIcon(props) {
	const classes = useStyles();

	return (
		<div {...props} className={classes.kztIcon}>
			₸
		</div>
	);
}

function WrapIcon({ Icon, color }) {
	const theme = useTheme();
	const classes = useStyles();

	return (
		<div className={classes.wrapIcon} style={{ backgroundColor: color }}>
			<Icon style={{ color: theme.palette.background.default }} />
		</div>
	);
}
WrapIcon.propTypes = {
	Icon: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
	color: PropTypes.string.isRequired
};

function ContentItem({ title, message, colorMessage }) {
	return (
		<div className="flex">
			<div className="mr-6">{title}</div>

			<div className="break-words min-w-0" style={{ color: colorMessage }}>
				{message}
			</div>
		</div>
	);
}

ContentItem.defaultProps = {
	colorMessage: ''
};

ContentItem.propTypes = {
	title: PropTypes.string.isRequired,
	message: PropTypes.string.isRequired,
	colorMessage: PropTypes.string
};

function getMap(notify, palette) {
	const map = {
		message: notify.message,
		icon: <WrapIcon color={palette.primary.main} Icon={NotificationsIcon} />,
		Button: props => <button type="button" aria-label={notify.message} {...props} />,
		content: [],
		createAt: moment(notify.created_at).format('HH:mm — dd, DD MMMM YYYY')
	};

	if (!notify.parent) {
		return map;
	}

	const { parent } = notify;

	// Waybill
	if (
		[
			NOTIFICATION_TYPE_WAYBILL_ACCEPT,
			NOTIFICATION_TYPE_WAYBILL_FINISH,
			NOTIFICATION_TYPE_WAYBILL_CANCEL,
			NOTIFICATION_TYPE_RETURNED_WAYBILL,
			NOTIFICATION_TYPE_CHECK_CONTROL_WAYBILL
		].includes(notify.type)
	) {
		const { responsible } = parent;
		const waybillTypeName = waybillsService.getWaybillType(parent.type)?.name;
		map.content = [
			<ContentItem
				key="waybill"
				title="Накладная:"
				message={waybillTypeName ? `${waybillTypeName} №${parent.number}` : ''}
			/>
		];

		if ([NOTIFICATION_TYPE_CHECK_CONTROL_WAYBILL].includes(notify.type)) {
			map.content = [
				...map.content,
				<ContentItem key="sender" title="Отправитель:" message={notify.sender.full_name} />,
				<ContentItem key="sum" title="Сумма:" message={`${numberFormat.currency(parent.sum)} ₸`} />
			];
			map.icon = <WrapIcon color={palette.warning.main} Icon={ShoppingCartIcon} />;
		}

		if (
			[
				NOTIFICATION_TYPE_WAYBILL_ACCEPT,
				NOTIFICATION_TYPE_WAYBILL_FINISH,
				NOTIFICATION_TYPE_WAYBILL_CANCEL,
				NOTIFICATION_TYPE_RETURNED_WAYBILL
			].includes(notify.type)
		) {
			map.content = [
				...map.content,
				<ContentItem
					key="responsible"
					title="Проверяющий:"
					message={getFullName({ lastName: responsible.last_name, firstName: responsible.first_name })}
				/>,
				<ContentItem key="sum" title="Сумма:" message={`${numberFormat.currency(parent.sum)} ₸`} />
			];
		}

		if ([NOTIFICATION_TYPE_WAYBILL_CANCEL, NOTIFICATION_TYPE_RETURNED_WAYBILL].includes(notify.type)) {
			map.icon = <WrapIcon color={palette.error.main} Icon={ShoppingCartIcon} />;
		}

		if ([NOTIFICATION_TYPE_WAYBILL_ACCEPT, NOTIFICATION_TYPE_WAYBILL_FINISH].includes(notify.type)) {
			map.icon = <WrapIcon color={palette.success.main} Icon={ShoppingCartIcon} />;
		}
	}

	// Product
	if ([NOTIFICATION_TYPE_PRODUCT_OUT_OF_STOCK].includes(notify.type)) {
		map.content = [
			<ContentItem key="warehouse" title="Склад:" message={parent.warehouse.name} />,
			<ContentItem key="product" title="Товар:" message={parent.product.name} />,
			<ContentItem key="remainder" title="Остаток:" message="0 шт." />
		];
		map.icon = <WrapIcon color={palette.error.main} Icon={ShoppingCartIcon} />;
	}

	// Global finance
	if (
		[
			NOTIFICATION_TYPE_GLOBAL_FINANCE_ECONOMY,
			NOTIFICATION_TYPE_GLOBAL_FINANCE_OVERSPEND,
			NOTIFICATION_TYPE_GLOBAL_FINANCE_CANCEL,
			NOTIFICATION_TYPE_GLOBAL_FINANCE_COMMENT,
			NOTIFICATION_TYPE_GLOBAL_FINANCE_ACCEPT,
			NOTIFICATION_TYPE_GLOBAL_FINANCE_CONTROL,
			NOTIFICATION_TYPE_GLOBAL_FINANCE_REWORK,
			NOTIFICATION_TYPE_GLOBAL_FINANCE_FAILURE,
			NOTIFICATION_TYPE_GLOBAL_FINANCE_RESPONSIBLE,
			NOTIFICATION_TYPE_REMINDER_START_GLOBAL_FINANCE,
			NOTIFICATION_TYPE_REMINDER_END_GLOBAL_FINANCE
		].includes(notify.type)
	) {
		map.Link = props => <button type="button" aria-label={notify.message} {...props} />;

		if (
			[
				NOTIFICATION_TYPE_GLOBAL_FINANCE_CANCEL,
				NOTIFICATION_TYPE_GLOBAL_FINANCE_COMMENT,
				NOTIFICATION_TYPE_GLOBAL_FINANCE_ACCEPT,
				NOTIFICATION_TYPE_GLOBAL_FINANCE_CONTROL,
				NOTIFICATION_TYPE_GLOBAL_FINANCE_REWORK,
				NOTIFICATION_TYPE_GLOBAL_FINANCE_FAILURE,
				NOTIFICATION_TYPE_GLOBAL_FINANCE_RESPONSIBLE,
				NOTIFICATION_TYPE_REMINDER_START_GLOBAL_FINANCE,
				NOTIFICATION_TYPE_REMINDER_END_GLOBAL_FINANCE
			].includes(notify.type)
		) {
			const counterparty = parent.counterparty ?? {};
			map.content = [
				...map.content,
				<ContentItem
					key="counterparty"
					title="Контрагент:"
					message={
						counterparty.name ??
						getFullName({
							lastName: counterparty.last_name,
							firstName: counterparty.first_name
						})
					}
				/>,
				<ContentItem key="state" title="Статья:" message={parent.global_finance_state} />,
				<ContentItem key="sum" title="Сумма:" message={`${numberFormat.currency(parent.value)} ₸`} />
			];
		}

		if ([NOTIFICATION_TYPE_GLOBAL_FINANCE_OVERSPEND].includes(notify.type)) {
			map.content = [
				...map.content,
				<ContentItem
					key="sum"
					title="Сумма:"
					message={`${numberFormat.currency(parent.value)} ₸`}
					colorMessage={palette.error.main}
				/>
			];
		}

		if ([NOTIFICATION_TYPE_GLOBAL_FINANCE_ECONOMY].includes(notify.type)) {
			map.content = [
				...map.content,
				<ContentItem
					key="sum"
					title="Сумма:"
					message={`${numberFormat.currency(parent.value)} ₸`}
					colorMessage={palette.success.main}
				/>
			];
		}

		if ([NOTIFICATION_TYPE_REMINDER_START_GLOBAL_FINANCE].includes(notify.type)) {
			map.icon = <WrapIcon color={palette.error.main} Icon={RemoveIcon} />;
		}

		map.icon = <WrapIcon color="#8954BA" Icon={KztIcon} />;

		if ([NOTIFICATION_TYPE_REMINDER_END_GLOBAL_FINANCE].includes(notify.type)) {
			map.icon = <WrapIcon color={palette.success.main} Icon={AddIcon} />;
		}

		if ([NOTIFICATION_TYPE_GLOBAL_FINANCE_RESPONSIBLE].includes(notify.type)) {
			map.icon = <WrapIcon color="#8954BA" Icon={KztIcon} />;
		}

		if (
			[
				NOTIFICATION_TYPE_GLOBAL_FINANCE_FAILURE,
				NOTIFICATION_TYPE_GLOBAL_FINANCE_CANCEL,
				NOTIFICATION_TYPE_GLOBAL_FINANCE_OVERSPEND
			].includes(notify.type)
		) {
			map.icon = <WrapIcon color={palette.error.main} Icon={KztIcon} />;
		}

		if (
			[
				NOTIFICATION_TYPE_GLOBAL_FINANCE_CONTROL,
				NOTIFICATION_TYPE_GLOBAL_FINANCE_ACCEPT,
				NOTIFICATION_TYPE_GLOBAL_FINANCE_REWORK
			].includes(notify.type)
		) {
			map.icon = <WrapIcon color={palette.warning.main} Icon={KztIcon} />;
		}

		if ([NOTIFICATION_TYPE_GLOBAL_FINANCE_COMMENT].includes(notify.type)) {
			map.icon = <WrapIcon color={palette.primary.main} Icon={KztIcon} />;
		}

		if ([NOTIFICATION_TYPE_GLOBAL_FINANCE_ECONOMY].includes(notify.type)) {
			map.icon = <WrapIcon color={palette.success.main} Icon={KztIcon} />;
		}
	}

	// Task

	if (
		[NOTIFICATION_TYPE_TASK_END_FAILURE, NOTIFICATION_TYPE_TASK_STARTED, NOTIFICATION_TYPE_TASK_ENDED].includes(
			notify.type
		)
	) {
		if ([NOTIFICATION_TYPE_TASK_END_FAILURE].includes(notify.type)) {
			map.content = [...map.content, <ContentItem key="taskName" title="Задача:" message={parent.name} />];
		}

		if ([NOTIFICATION_TYPE_TASK_STARTED].includes(notify.type)) {
			map.content = [...map.content, <ContentItem key="taskName" title="Задача:" message={parent.name} />];
		}

		if ([NOTIFICATION_TYPE_TASK_ENDED].includes(notify.type)) {
			map.content = [...map.content, <ContentItem key="taskName" title="Задача:" message={parent.name} />];
		}
	}

	return map;
}

export function NotificationItem({ notify, onView }) {
	const theme = useTheme();
	const map = getMap(notify, theme.palette);
	const classes = useStyles();

	return (
		<div className={classes.container}>
			<div className="mr-6">{map.icon}</div>

			<div className="ml-12 min-w-0">
				<div className={classes.message}>{map.message}</div>
				<div className={classes.content}>
					{map.content.map((item, index) => (
						<div key={index}>{item}</div>
					))}
				</div>
				<div className={classes.createAt}>{map.createAt}</div>
			</div>

			<map.Button className={classes.button} onClick={() => onView(notify)} />
		</div>
	);
}

NotificationItem.defaultProps = {
	onView: () => {}
};

NotificationItem.propTypes = {
	notify: PropTypes.shape({
		uuid: PropTypes.string.isRequired,
		message: PropTypes.string.isRequired,
		type: PropTypes.string.isRequired,
		sender: PropTypes.shape({
			uuid: PropTypes.string.isRequired,
			full_name: PropTypes.string.isRequired
		}).isRequired,
		parent: PropTypes.shape({
			uuid: PropTypes.string.isRequired
		}).isRequired
	}).isRequired,
	onView: PropTypes.func
};
