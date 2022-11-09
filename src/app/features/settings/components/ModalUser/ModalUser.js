import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import { DrawerTemplate } from '../../../../bizKITUi';
import { FormUser } from '../FormUser';

export function ModalUser({ userUuid, isOpen, initialValues, onClose }) {
	return (
		<>
			<DrawerTemplate
				isOpen={isOpen}
				close={onClose}
				width="sm"
				header={
					<Typography color="secondary" className="text-xl font-bold text-center">
						{userUuid ? 'Редактирование пользователя' : 'Новый пользователь'}
					</Typography>
				}
				content={<FormUser uuid={userUuid} initialValues={initialValues} />}
			/>
		</>
	);
}
ModalUser.defaultProps = {
	userUuid: null,
	initialValues: {}
};
ModalUser.propTypes = {
	userUuid: PropTypes.string,
	isOpen: PropTypes.bool.isRequired,
	initialValues: PropTypes.object,
	onClose: PropTypes.func.isRequired
};
