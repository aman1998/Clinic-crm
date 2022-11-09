import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { Button, DrawerTemplate, TextField } from '../../../../bizKITUi';
import { useUniqueId } from '../../../../hooks/useUniqueId/useUniqueId';
import { documentsService, ENTITY_DEPS } from '../../../../services';
import { useAlert } from '../../../../hooks';

export function ModalDocumentTemplate({ isOpen, onClose }) {
	const uniqueIdForm = useUniqueId();
	const { alertError, alertSuccess } = useAlert();
	const queryClient = useQueryClient();

	const { control, clearErrors, errors, setError, getValues } = useForm({
		defaultValues: {
			name: ''
		}
	});

	const { mutateAsync: createNewDocumentTemplate, isLoading } = useMutation(payload =>
		documentsService.createDocumentTemplate(payload)
	);
	const handleOnCreateDocumentTemplate = event => {
		event.preventDefault();
		clearErrors();

		createNewDocumentTemplate(getValues())
			.then(() => {
				ENTITY_DEPS.DOCUMENT_TEMPLATE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});

				onClose();
				alertSuccess('Новый шаблон документа успешно создано');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать новый шаблон документа');
			});
	};

	return (
		<>
			<DrawerTemplate
				isOpen={isOpen}
				close={onClose}
				width="sm"
				header={
					<Typography color="secondary" className="text-xl font-bold text-center">
						Добавить новый шаблон
					</Typography>
				}
				content={
					<form id={uniqueIdForm} onSubmit={handleOnCreateDocumentTemplate}>
						<Controller
							as={<TextField />}
							control={control}
							name="name"
							label="Наименование документа"
							fullWidth
							variant="outlined"
							error={!!errors.name}
							helperText={errors.name?.message}
						/>
					</form>
				}
				footer={
					<Button form={uniqueIdForm} textNormal type="submit" className="mr-8" disabled={isLoading}>
						Создать
					</Button>
				}
			/>
		</>
	);
}
ModalDocumentTemplate.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired
};
