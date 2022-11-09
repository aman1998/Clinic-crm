import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import { DrawerTemplate } from '../../bizKITUi';
import { FormPatient } from '../FormPatient';

export function ModalPatient({ isOpen, onClose, patientsUuid, initialValues, onUpdate, setPatientUuid }) {
	const title = patientsUuid ? 'Изменить информацию о пациенте' : 'Добавить нового пациента';

	const handleOnUpdate = data => {
		onUpdate(data);
		onClose();
	};

	return (
		<DrawerTemplate
			isOpen={isOpen}
			close={onClose}
			header={
				<Typography color="secondary" className="text-xl font-bold text-center">
					{title}
				</Typography>
			}
			width="sm"
			content={
				<>
					<Typography variant="subtitle1" className="font-bold">
						Общая информация
					</Typography>
					<FormPatient
						patientsUuid={patientsUuid}
						initialValues={initialValues}
						onUpdate={handleOnUpdate}
						setPatientUuid={setPatientUuid}
					/>
				</>
			}
		/>
	);
}
ModalPatient.defaultProps = {
	initialValues: {},
	patientsUuid: null,
	onUpdate: () => {},
	setPatientUuid: () => {}
};
ModalPatient.propTypes = {
	initialValues: PropTypes.shape({
		main_phone: PropTypes.string,
		instagram_username: PropTypes.string
	}),
	patientsUuid: PropTypes.string,
	onUpdate: PropTypes.func,
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	setPatientUuid: PropTypes.func
};
