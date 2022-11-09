import React from 'react';
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
	NOTIFICATION_TYPE_GLOBAL_FINANCE_CONTROL,
	NOTIFICATION_TYPE_GLOBAL_FINANCE_FAILURE,
	NOTIFICATION_TYPE_GLOBAL_FINANCE_REWORK,
	NOTIFICATION_TYPE_GLOBAL_FINANCE_RESPONSIBLE,
	NOTIFICATION_TYPE_REMINDER_START_GLOBAL_FINANCE,
	NOTIFICATION_TYPE_REMINDER_END_GLOBAL_FINANCE,
	NOTIFICATION_TYPE_TASK_END_FAILURE,
	NOTIFICATION_TYPE_TASK_STARTED,
	NOTIFICATION_TYPE_TASK_ENDED
} from '../../services/notifications/constants';
import { ModalWaybill } from '../ModalWaybill';
import { ModalProductDetailInfo } from '../ModalProductDetailInfo';
import { ModalGlobalFinance } from '../ModalGlobalFinance';
import { ModalTask } from '../ModalTask';

export function ModalNotificationDetails({ onClose, notify }) {
	const isWaybill = [
		NOTIFICATION_TYPE_WAYBILL_ACCEPT,
		NOTIFICATION_TYPE_WAYBILL_FINISH,
		NOTIFICATION_TYPE_WAYBILL_CANCEL,
		NOTIFICATION_TYPE_RETURNED_WAYBILL,
		NOTIFICATION_TYPE_CHECK_CONTROL_WAYBILL
	].includes(notify.type);

	const isProduct = [NOTIFICATION_TYPE_PRODUCT_OUT_OF_STOCK].includes(notify.type);

	const isGlobalFinance = [
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
		NOTIFICATION_TYPE_REMINDER_END_GLOBAL_FINANCE
	].includes(notify.type);

	const isTask = [
		NOTIFICATION_TYPE_TASK_END_FAILURE,
		NOTIFICATION_TYPE_TASK_STARTED,
		NOTIFICATION_TYPE_TASK_ENDED
	].includes(notify.type);

	return (
		<>
			{isWaybill && <ModalWaybill isOpen onClose={onClose} waybillUuid={notify.parent.uuid} />}
			{isProduct && <ModalProductDetailInfo isOpen onClose={onClose} productUuid={notify.parent.product.uuid} />}
			{isGlobalFinance && <ModalGlobalFinance isOpen onClose={onClose} globalFinanceUuid={notify.parent.uuid} />}
			{isTask && <ModalTask isOpen onClose={onClose} taskUuid={notify.parent.uuid} />}
		</>
	);
}
ModalNotificationDetails.propTypes = {
	onClose: PropTypes.func.isRequired,
	notify: PropTypes.shape({
		parent: PropTypes.shape({
			uuid: PropTypes.string,
			product: PropTypes.shape({
				uuid: PropTypes.string.isRequired
			})
		}).isRequired,
		type: PropTypes.string.isRequired
	}).isRequired
};
