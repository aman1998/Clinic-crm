import { Typography, Divider, Switch, FormLabel, FormHelperText } from '@material-ui/core';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { Button, DrawerTemplate, MenuItem, ServerAutocomplete, TextField } from '../../../../bizKITUi';
import { defaults, getFullName } from '../../../../utils';
import { useAlert } from '../../../../hooks';
import { useUniqueId } from '../../../../hooks/useUniqueId/useUniqueId';
import { authService, ENTITY, ENTITY_DEPS, operationService, documentsService } from '../../../../services';
import { CustomFields } from '../CustomFields';
import { normalizeNumberType } from '../../../../utils/normalizeNumber';

const defaultValues = {
	name: '',
	number: '',
	responsible: null,
	duration: '',
	type: '',
	show_receptions: false,
	show_tasks: false,
	show_files: false,
	show_custom_fields: false,
	documents: [],
	custom_fields: {}
};

const typesOperationStage = operationService.getTypesOperationStage();

export function ModalOperationStage({ isOpen, onClose, stageUuid }) {
	const queryClient = useQueryClient();
	const uniqueId = useUniqueId();

	const { alertSuccess, alertError } = useAlert();

	const { isLoading: isLoadingOperationStage, isError: isErrorOperationStage, data: operationStage } = useQuery(
		[ENTITY.OPERATION_STAGE, stageUuid],
		({ queryKey }) => operationService.getOperationStage(queryKey[1]),
		{ enabled: !!stageUuid }
	);

	const {
		isError: isErrorDocumentsTemplates,
		isLoading: isLoadingDocumentsTemplates,
		data: documentsTemplates
	} = useQuery([ENTITY.DOCUMENT_TEMPLATE, { limit: Number.MAX_SAFE_INTEGER }], ({ queryKey }) =>
		documentsService.getDocumentsTemplates(queryKey[1])
	);

	const { reset, getValues, setError, control, errors, clearErrors, watch } = useForm({
		mode: 'onBlur',
		defaultValues
	});
	const watchFields = watch('show_custom_fields');

	useEffect(() => {
		if (!operationStage) {
			return;
		}
		reset(defaults(operationStage, defaultValues));
	}, [operationStage, reset]);

	const getPreparedValues = () => {
		const values = getValues();
		return {
			...values,
			service: values.service?.uuid,
			responsible: values.responsible?.uuid
		};
	};

	const createOperationStage = useMutation(payload => operationService.createOperationStage(payload));
	const handleOnCreateOperationStage = () => {
		clearErrors();

		createOperationStage
			.mutateAsync(getPreparedValues())
			.then(() => {
				ENTITY_DEPS.OPERATION_STAGE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});

				onClose();

				alertSuccess('Этап успешно создан');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать этап');
			});
	};

	const updateOperationStage = useMutation(({ uuid, payload }) =>
		operationService.updateOperationStage(uuid, payload)
	);
	const handleOnUpdateOperationStage = () => {
		clearErrors();

		updateOperationStage
			.mutateAsync({ uuid: stageUuid, payload: getPreparedValues() })
			.then(() => {
				ENTITY_DEPS.OPERATION_STAGE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});

				onClose();

				alertSuccess('Этап сохранён');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось сохранить этап');
			});
	};

	const handleOnSave = stageUuid ? handleOnUpdateOperationStage : handleOnCreateOperationStage;

	const isError = isErrorOperationStage || isErrorDocumentsTemplates;
	const isLoading = isLoadingOperationStage || isLoadingDocumentsTemplates;
	const isDisableSaveButton =
		isErrorOperationStage || createOperationStage.isLoading || updateOperationStage.isLoading;

	return (
		<DrawerTemplate
			isOpen={isOpen}
			close={onClose}
			isLoading={isLoading}
			width="md"
			header={
				<Typography color="secondary" className="text-xl font-bold text-center">
					Добавление этапа
				</Typography>
			}
			content={
				isError ? (
					<ErrorMessage />
				) : (
					<form id={uniqueId}>
						<Typography color="secondary" className="text-base font-bold">
							Информация об этапе
						</Typography>

						<Controller
							as={<TextField />}
							control={control}
							fullWidth
							label="Наименование"
							name="name"
							type="text"
							variant="outlined"
							margin="normal"
							error={!!errors.name}
							helperText={errors.name?.message}
						/>

						<Controller
							as={<TextField />}
							control={control}
							fullWidth
							margin="normal"
							label="Порядковый номер"
							name="number"
							type="text"
							variant="outlined"
							error={!!errors.number}
							helperText={errors.number?.message}
						/>

						<Controller
							control={control}
							name="responsible"
							render={({ value, onChange, onBlur }) => (
								<ServerAutocomplete
									value={value}
									getOptionLabel={option => getFullName(option)}
									fullWidth
									label="Ответственный"
									InputProps={{
										error: !!errors.responsible,
										helperText: errors.responsible?.message,
										margin: 'normal'
									}}
									onBlur={onBlur}
									onChange={onChange}
									onFetchList={(search, limit) => authService.getUsers({ search, limit })}
									onFetchItem={fetchUuid => authService.getUser(fetchUuid).then(res => res.data)}
								/>
							)}
						/>

						<Controller
							as={<TextField />}
							control={control}
							fullWidth
							margin="normal"
							label="Длительность этапа"
							name="duration"
							variant="outlined"
							error={!!errors.duration}
							helperText={errors.duration?.message}
							onKeyPress={normalizeNumberType}
						/>

						<Controller
							as={<TextField />}
							control={control}
							select
							fullWidth
							margin="normal"
							label="Тип этапа"
							name="type"
							variant="outlined"
							error={!!errors.type}
							helperText={errors.type?.message}
							onKeyPress={normalizeNumberType}
						>
							<MenuItem disabled value="">
								Не выбрано
							</MenuItem>
							{typesOperationStage.map(item => (
								<MenuItem key={item.type} value={item.type}>
									{item.name}
								</MenuItem>
							))}
						</Controller>

						<Controller
							as={<TextField />}
							control={control}
							select
							fullWidth
							margin="normal"
							label="Документы"
							name="documents"
							SelectProps={{ multiple: true }}
							variant="outlined"
							error={!!errors.documents}
							helperText={errors.documents?.message}
						>
							<MenuItem disabled value="">
								Не выбрано
							</MenuItem>
							{documentsTemplates?.results.map(template => (
								<MenuItem key={template.uuid} value={template.uuid}>
									{template.name}
								</MenuItem>
							))}
						</Controller>

						<Typography color="secondary" className="text-base font-bold mt-20 mb-10">
							Отображение блоков
						</Typography>

						<Controller
							control={control}
							name="show_files"
							render={({ value, onChange, onBlur }) => (
								<>
									<FormLabel className="flex justify-between items-center mb-10">
										<Typography variant="subtitle2" color="secondary" component="span">
											Прикрепленные файлы
										</Typography>
										<Switch
											checked={value}
											edge="end"
											onBlur={onBlur}
											onChange={event => onChange(event.target.checked)}
										/>
									</FormLabel>
									<FormHelperText error>{errors.show_files?.message}</FormHelperText>
								</>
							)}
						/>
						<Divider />
						<Controller
							control={control}
							name="show_tasks"
							render={({ value, onChange, onBlur }) => (
								<>
									<FormLabel className="flex justify-between items-center mb-10">
										<Typography variant="subtitle2" color="secondary" component="span">
											Задачи
										</Typography>
										<Switch
											checked={value}
											edge="end"
											onBlur={onBlur}
											onChange={event => onChange(event.target.checked)}
										/>
									</FormLabel>
									<FormHelperText error>{errors.show_tasks?.message}</FormHelperText>
								</>
							)}
						/>
						<Divider />
						<Controller
							control={control}
							name="show_receptions"
							render={({ value, onChange, onBlur }) => (
								<>
									<FormLabel className="flex justify-between items-center mb-10">
										<Typography variant="subtitle2" color="secondary" component="span">
											Приемы
										</Typography>
										<Switch
											checked={value}
											edge="end"
											onBlur={onBlur}
											onChange={event => onChange(event.target.checked)}
										/>
									</FormLabel>
									<FormHelperText error>{errors.show_receptions?.message}</FormHelperText>
								</>
							)}
						/>
						<Divider />
						<Controller
							control={control}
							name="show_custom_fields"
							render={({ value, onChange, onBlur }) => (
								<>
									<FormLabel className="flex justify-between items-center mb-10">
										<Typography variant="subtitle2" color="secondary" component="span">
											Дополнительные поля
										</Typography>
										<Switch
											checked={value}
											edge="end"
											onBlur={onBlur}
											onChange={event => onChange(event.target.checked)}
										/>
									</FormLabel>
									<FormHelperText error>{errors.show_custom_fields?.message}</FormHelperText>
								</>
							)}
						/>
						{watchFields && (
							<Controller
								control={control}
								name="custom_fields"
								render={({ value, onChange }) => (
									<CustomFields
										initialValues={value?.sections ?? []}
										onSave={({ custom_fields }) => onChange(custom_fields)}
									/>
								)}
							/>
						)}
					</form>
				)
			}
			footer={
				<>
					<Button form={uniqueId} textNormal onClick={handleOnSave} disabled={isDisableSaveButton}>
						Сохранить
					</Button>
				</>
			}
		/>
	);
}
ModalOperationStage.defaultProps = {
	stageUuid: null
};
ModalOperationStage.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	stageUuid: PropTypes.string
};
