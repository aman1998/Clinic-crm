import React from 'react';
import PropTypes from 'prop-types';
import { DialogSimpleTemplate } from '../../bizKITUi';
import { FormOpenCashierShift } from '../FormOpenCashierShift';

export function ModalOpenCashierShift({ isOpen, onClose }) {
	return (
		<DialogSimpleTemplate
			isOpen={isOpen}
			onClose={onClose}
			header={<>Открытие кассовой смены</>}
			fullWidth
			maxWidth="sm"
		>
			<FormOpenCashierShift onSuccess={onClose} />
		</DialogSimpleTemplate>
	);
}
ModalOpenCashierShift.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired
};
