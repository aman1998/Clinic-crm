import React from 'react';
import PropTypes from 'prop-types';
import {
	Done as DoneIcon,
	DoneAll as DoneAllIcon,
	ErrorOutline as ErrorOutlineIcon,
	HourglassEmpty as HourglassEmptyIcon
} from '@material-ui/icons';
import { MESSAGE_STATUS } from './constants';

export function Status({ status }) {
	const StatusIcon = {
		[MESSAGE_STATUS.IS_WAIT]: <HourglassEmptyIcon fontSize="inherit" titleAccess="Отправляется" />,
		[MESSAGE_STATUS.IS_FAIL]: <ErrorOutlineIcon fontSize="inherit" titleAccess="Ошибка при отправке" />,
		[MESSAGE_STATUS.IS_SENT]: <DoneIcon fontSize="inherit" titleAccess="Отправлено" />,
		[MESSAGE_STATUS.IS_DELIVERED]: <DoneIcon fontSize="inherit" titleAccess="Доставлено" />,
		[MESSAGE_STATUS.IS_READ]: <DoneAllIcon fontSize="inherit" titleAccess="Прочитано" />
	};

	return StatusIcon[status];
}
Status.propTypes = {
	status: PropTypes.oneOf(Object.entries(MESSAGE_STATUS).map(([_, messageStatus]) => messageStatus)).isRequired
};
