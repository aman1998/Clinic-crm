import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Grid, Typography } from '@material-ui/core';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useMutation, useQueries, useQueryClient } from 'react-query';
import { CardComment, CardHistory, Comments } from '../Comments';
import { clinicService, documentsService, operationService, ENTITY, ENTITY_DEPS } from '../../services';
import { Button, DatePickerField, DialogTemplate, ServerAutocomplete, TextField } from '../../bizKITUi';
import { useAlert } from '../../hooks';
import { ErrorMessage } from '../ErrorMessage';
import { getFullName, defaults } from '../../utils';
import { useUniqueId } from '../../hooks/useUniqueId/useUniqueId';
import { FormDocument } from './FormDocument';
import { FormDisplayCustomFields } from '../FormDisplayCustomFields';
import { ServicesTable } from './ServicesTable';
import { GuardCheckPermission } from '../GuardCheckPermission';
import { PERMISSION } from '../../services/auth/constants';

const defaultValues = {
	bank: '',
	bic: '',
	bin: '',
	clinic_address: '',
	clinic_name: '',
	head_full_name: '',
	head_position: '',
	iic: '',
	name: '',
	template: null,
	patient: null
};

export function ModalDocumentContract({
	isOpen,
	onClose,
	documentUuid,
	receptionUuid,
	operationStageUuid,
	initialValues
}) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();
	const uniqueIdForm = useUniqueId();

	const [currentDocumentUuid, setCurrentDocumentUuid] = useState(documentUuid);
	const [customFields, setCustomFields] = useState(null);
	const [isEdit, setIsEdit] = useState(!documentUuid);
	const [services, setServices] = useState([]);

	const [
		{ isLoading: isLoadingContractDocument, isError: isErrorContractDocument, data: contractDocument },
		{ isLoading: isLoadingClinicInfo, isError: isErrorClinicInfo, data: requisite },
		{ isLoading: isLoadingReception, isError: isErrorReception, data: reception },
		{ isLoading: isLoadingOperationStage, isError: isErrorOperationStage, data: operationStage }
	] = useQueries([
		{
			queryKey: [ENTITY.DOCUMENT_CONTRACT, currentDocumentUuid],
			queryFn: ({ queryKey }) => documentsService.getContractDocument(queryKey[1]),
			enabled: !!currentDocumentUuid
		},
		{
			queryKey: [ENTITY.CLINIC_REQUISITE],
			queryFn: () => clinicService.getRequisiteInfo(),
			enabled: !currentDocumentUuid
		},
		{
			queryKey: [ENTITY.CLINIC_RECEPTION, receptionUuid],
			queryFn: () => clinicService.getReceptionById(receptionUuid).then(res => res.data),
			enabled: !!receptionUuid && !currentDocumentUuid
		},
		{
			queryKey: [ENTITY.OPERATION_CREATED_STAGE, operationStageUuid],
			queryFn: () => operationService.getOperationCreatedStage(operationStageUuid),
			enabled: !!operationStageUuid && !currentDocumentUuid
		}
	]);

	const isNewDocument = !currentDocumentUuid;
	const isNotNumber = !contractDocument?.number;

	const formMethods = useForm({ defaultValues: defaults(initialValues, defaultValues) });
	const { setError, watch, errors, reset, clearErrors, getValues, control } = formMethods;

	useEffect(() => {
		if (contractDocument) {
			setCustomFields(contractDocument.additional_fields ?? null);
			setServices([contractDocument.service]);
			reset(
				defaults(
					{ ...contractDocument, ...contractDocument.clinic_requisites },
					{ ...defaultValues, ...initialValues }
				)
			);

			return;
		}

		if (!currentDocumentUuid && reception && requisite) {
			setServices([reception.service]);
			reset(defaults({ ...requisite, patient: reception.patient }, { ...defaultValues, ...initialValues }));

			return;
		}

		if (!currentDocumentUuid && operationStage && requisite) {
			setServices([operationStage.operation.service]);
			reset(
				defaults(
					{ ...requisite, patient: operationStage.operation.patient.uuid },
					{ ...defaultValues, ...initialValues }
				)
			);
		}
	}, [contractDocument, currentDocumentUuid, initialValues, operationStage, reception, requisite, reset]);

	const handleOnSubmit = event => {
		event.preventDefault();
		clearErrors();

		if (currentDocumentUuid) {
			handleUpdateContractDocument();

			return;
		}

		handleCreateContractDocument();
	};

	const getPreparedValues = () => {
		const values = getValues();

		return {
			patient: values.patient,
			template: values.template?.uuid,
			clinic_requisites: {
				bank: values.bank,
				bic: values.bic,
				bin: values.bin,
				clinic_address: values.clinic_address,
				clinic_name: values.clinic_name,
				head_full_name: values.head_full_name,
				head_position: values.head_position,
				iic: values.iic
			},
			name: values.name ?? values.template?.name,
			reception: contractDocument?.reception ?? receptionUuid,
			stage: contractDocument?.stage ?? operationStageUuid,
			service: services[0]?.uuid,
			total_cost: services.reduce((sum, item) => sum + item.cost, 0),
			additional_fields: customFields ?? {
				sections: []
			}
		};
	};

	const createContractDocument = useMutation(({ payload }) => documentsService.createContractDocument(payload));
	const handleCreateContractDocument = () => {
		createContractDocument
			.mutateAsync({ payload: getPreparedValues() })
			.then(({ uuid }) => {
				ENTITY_DEPS.DOCUMENT_CONTRACT.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				setCurrentDocumentUuid(uuid);
				setIsEdit(false);

				alertSuccess('Документ успешно создан!');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать документ!');
			});
	};

	const updateContractDocument = useMutation(({ uuid, payload }) =>
		documentsService.updateContractDocument(uuid, payload)
	);
	const handleUpdateContractDocument = () => {
		updateContractDocument
			.mutateAsync({ uuid: currentDocumentUuid, payload: getPreparedValues() })
			.then(() => {
				ENTITY_DEPS.DOCUMENT_CONTRACT.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				setIsEdit(false);

				alertSuccess('Документ успешно обновлен!');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось обновить документ!');
			});
	};

	const assignNumberForContractDocument = useMutation(uuid => documentsService.assignNumberForContractDocument(uuid));
	const handleAssignNumberForContractDocument = () => {
		assignNumberForContractDocument
			.mutateAsync(currentDocumentUuid)
			.then(() => {
				ENTITY_DEPS.DOCUMENT_CONTRACT.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});

				alertSuccess('Номер успешно присвоен документу!');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось присвоить номер документу!');
			});
	};

	const addComment = useMutation(({ uuid, payload }) => documentsService.addCommentInContractDocument(uuid, payload));
	const handleOnAddComment = text => {
		addComment
			.mutateAsync({ uuid: currentDocumentUuid, payload: { text } })
			.then(response => {
				queryClient.setQueryData([ENTITY.DOCUMENT_CONTRACT, currentDocumentUuid], {
					...contractDocument,
					comments: [...contractDocument.comments, response]
				});
			})
			.catch(() => alertError('Не удалось добавить комментарий'));
	};

	const handleOnChangeCustomFields = (currentValue, sectionIndex, fieldIndex) => {
		if (!customFields) {
			return;
		}

		const oldValue = customFields.sections[sectionIndex].fields[fieldIndex].value;

		if (oldValue === currentValue) {
			return;
		}

		setCustomFields(prevState => {
			const copyFields = [...prevState.sections];
			copyFields[sectionIndex].fields[fieldIndex].value = currentValue;

			return {
				sections: copyFields
			};
		});
	};

	const downloadReport = useMutation(uuid => documentsService.exportContractDocument(uuid));
	const handleDownloadReport = () => {
		downloadReport.mutateAsync(currentDocumentUuid).catch(() => alertError('Не удалось скачать документ'));
	};

	const watchFields = watch(['name']);
	const titleDocument = watchFields.name || 'Создание нового документа';

	const isLoading = isLoadingClinicInfo || isLoadingReception || isLoadingContractDocument || isLoadingOperationStage;
	const isError = isErrorClinicInfo || isErrorReception || isErrorContractDocument || isErrorOperationStage;
	const isDisabledSaveButton = updateContractDocument.isLoading || createContractDocument.isLoading;

	return (
		<DialogTemplate
			isOpen={isOpen}
			onClose={onClose}
			isLoading={isLoading}
			fullWidth
			fullScreen
			headerFull
			header={
				<div className="flex flex-wrap gap-10">
					<Typography color="secondary" className="flex items-center sm:text-xl text-lg font-bold">
						<span className="whitespace-no-wrap">{titleDocument}</span>
					</Typography>

					<div className="flex flex-col sm3:flex-row sm3:text-center">
						<TextField
							className="sm3:mr-8"
							label="Номер"
							variant="outlined"
							size="small"
							name="number"
							value={contractDocument?.number ?? ''}
							InputProps={{
								readOnly: true
							}}
						/>
						<DatePickerField
							value={contractDocument?.date ?? null}
							inputVariant="outlined"
							className="mt-16 sm3:mr-24 sm3:mt-0"
							label="Дата"
							size="small"
							readOnly
						/>
					</div>
				</div>
			}
			leftContent={
				isError ? (
					<ErrorMessage />
				) : (
					<form id={uniqueIdForm} onSubmit={handleOnSubmit}>
						<Grid item md={12} xs={12}>
							<Typography color="secondary" className="text-lg font-bold mb-10">
								Основная информация
							</Typography>

							{isNewDocument ? (
								<Controller
									control={control}
									name="template"
									render={({ onChange, ...props }) => (
										<ServerAutocomplete
											{...props}
											getOptionLabel={option => option.name}
											fullWidth
											label="Наименование"
											InputProps={{
												error: !!errors.template,
												helperText: errors.template?.message
											}}
											onChange={value => {
												onChange(value);
												setCustomFields(value?.custom_fields ?? null);
											}}
											onFetchList={(name, limit) =>
												documentsService.getDocumentsTemplates({ name, limit })
											}
											onFetchItem={fetchUuid => documentsService.getDocumentTemplate(fetchUuid)}
										/>
									)}
								/>
							) : (
								<Controller
									as={<TextField />}
									control={control}
									name="name"
									label="Наименование"
									variant="outlined"
									fullWidth
									error={!!errors.name}
									helperText={errors.name?.message}
									InputProps={{
										readOnly: !isEdit
									}}
								/>
							)}
						</Grid>

						<FormProvider {...formMethods}>
							<FormDocument isReadOnly={!isEdit} />
						</FormProvider>

						<ServicesTable services={services} />

						{customFields?.sections && (
							<FormDisplayCustomFields
								fields={customFields.sections}
								onChangeData={handleOnChangeCustomFields}
								isReadOnly={!(isNewDocument || isEdit)}
							/>
						)}
					</form>
				)
			}
			rightContent={
				<Comments
					comments={
						<>
							{contractDocument?.comments?.map(item => (
								<div key={item.uuid} className="mb-20">
									<CardComment
										comment={{
											text: item.text,
											createdAt: item.created_at,
											fullName: getFullName(item.created_by)
										}}
									/>
								</div>
							))}
						</>
					}
					history={
						<>
							{contractDocument?.history?.map(item => (
								<div key={item.created_at} className="mb-20">
									<CardHistory
										fullName={item.user.full_name}
										message={item.message}
										date={item.created_at}
									/>
								</div>
							))}
						</>
					}
					isDisableAdd={isNewDocument}
					addComment={handleOnAddComment}
				/>
			}
			footer={
				!isError && (
					<>
						<GuardCheckPermission permission={PERMISSION.DOCUMENTS.CHANGE_DOCUMENT_CONTRACT}>
							{() => (
								<>
									{!isEdit && (
										<Button
											type="button"
											onClick={() => setIsEdit(true)}
											textNormal
											className="mr-8"
										>
											Изменить
										</Button>
									)}
									{(isEdit || isNewDocument) && (
										<Button
											form={uniqueIdForm}
											textNormal
											type="submit"
											className="mr-8"
											disabled={isDisabledSaveButton}
										>
											Сохранить
										</Button>
									)}
									{isNotNumber && !isNewDocument && (
										<Button
											textNormal
											className="mr-8 px-16"
											disabled={assignNumberForContractDocument.isLoading}
											onClick={handleAssignNumberForContractDocument}
										>
											Присвоить номер
										</Button>
									)}
								</>
							)}
						</GuardCheckPermission>
						{!isNewDocument && (
							<Button onClick={handleDownloadReport} textNormal className="mr-8">
								Скачать
							</Button>
						)}
					</>
				)
			}
		/>
	);
}

ModalDocumentContract.defaultProps = {
	documentUuid: null,
	receptionUuid: null,
	operationStageUuid: null,
	initialValues: {}
};

ModalDocumentContract.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	documentUuid: PropTypes.string,
	receptionUuid: PropTypes.string,
	operationStageUuid: PropTypes.string,
	initialValues: PropTypes.shape({
		template: PropTypes.string
	})
};
