import React from 'react';
import { Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import { DrawerTemplate } from '../../bizKITUi';
import { FormService } from '../FormService';

export function ModalClinicService({ isOpen, serviceUuid, initialValues, onClose }) {
	const title = serviceUuid ? 'Изменить услугу' : 'Добавить новую услугу';

	return (
		<DrawerTemplate
			isOpen={isOpen}
			close={onClose}
			width="md"
			header={
				<Typography color="secondary" className="text-base md:text-xl font-bold text-center">
					{title}
				</Typography>
			}
			content={<FormService initialValues={initialValues} uuid={serviceUuid} onSave={onClose} />}
		/>
	);
}
ModalClinicService.defaultProps = {
	serviceUuid: null,
	initialValues: {}
};
ModalClinicService.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	initialValues: PropTypes.objectOf(PropTypes.object),
	serviceUuid: PropTypes.string,
	onClose: PropTypes.func.isRequired
};
