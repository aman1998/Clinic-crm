import React from 'react';
import PropTypes from 'prop-types';
import { Controller, useForm } from 'react-hook-form';
import { DialogSimpleTemplate, Button, TextField } from '../../bizKITUi';

const defaultValues = {
	name: null
};

export function ModalLeadStage({ isOpen, onClose, handleOnSubmit }) {
	const { errors, control, clearErrors, getValues, setError } = useForm({
		mode: 'onBlur',
		defaultValues
	});

	return (
		<>
			<DialogSimpleTemplate isOpen={isOpen} onClose={onClose} header={<>Добавить этап</>} maxWidth="xs">
				<form onSubmit={event => handleOnSubmit(event, getValues(), clearErrors, onClose, setError)}>
					<Controller
						as={<TextField />}
						control={control}
						label="Название"
						variant="outlined"
						fullWidth
						name="name"
						error={!!errors.name}
						helperText={errors.name?.message}
					/>

					<Button fullWidth type="submit" className="mt-20" textNormal>
						Добавить этап
					</Button>
				</form>
			</DialogSimpleTemplate>
		</>
	);
}
ModalLeadStage.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	handleOnSubmit: PropTypes.func.isRequired
};
