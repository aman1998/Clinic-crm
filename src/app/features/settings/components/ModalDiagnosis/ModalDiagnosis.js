import React from 'react';
import { Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import { FormDiagnosis } from './FormDiagnosis';
import { DrawerTemplate } from '../../../../bizKITUi';

export function ModalDiagnosis({ diagnosisUuid, initialValues, onClose, isCancelModal, isOpen }) {
	const modalTitle = diagnosisUuid ? 'Изменить диагноз' : 'Создать диагноз';
	return (
		<DrawerTemplate
			close={onClose}
			isOpen={isOpen}
			width="sm"
			header={
				<Typography variant="h6" component="h2">
					{modalTitle}
				</Typography>
			}
			content={<FormDiagnosis diagnosisUuid={diagnosisUuid} initialValues={initialValues} />}
		/>
	);
}

ModalDiagnosis.defaultProps = {
	diagnosisUuid: null,
	initialValues: null,
	isCancelModal: false
};

ModalDiagnosis.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	diagnosisUuid: PropTypes.string,
	isCancelModal: PropTypes.bool,
	initialValues: PropTypes.shape({
		name: PropTypes.string,
		medicaments: PropTypes.arrayOf,
		services: PropTypes.arrayOf
	}),
	onClose: PropTypes.func.isRequired
};
