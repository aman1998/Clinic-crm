import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import { DrawerTemplate } from '../../../../bizKITUi';
import { FormDoctor } from '../FormDoctor';

export function ModalDoctor({ isOpen, onClose, uuid }) {
	return (
		<>
			<DrawerTemplate
				isOpen={isOpen}
				close={onClose}
				width="sm"
				header={
					<Typography color="secondary" className="text-xl font-bold text-center">
						{uuid ? 'Редактирование врача' : 'Создание врача'}
					</Typography>
				}
				content={<FormDoctor uuid={uuid} />}
			/>
		</>
	);
}
ModalDoctor.defaultProps = {
	isOpen: false,
	onClose: () => {}
};
ModalDoctor.propTypes = {
	isOpen: PropTypes.bool,
	onClose: PropTypes.func,
	uuid: PropTypes.string
};
