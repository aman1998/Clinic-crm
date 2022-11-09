import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { CardComment, CardHistory, Comments } from '../../../../common/Comments';
import * as globalAuthSelectors from '../../../../auth/store/selectors/auth';
import { qualityControlService, ENTITY, ENTITY_DEPS } from '../../../../services';
import { Button, DropzoneArea, DialogTemplate, Checklist } from '../../../../bizKITUi';
import { FormQualityControl } from './FormQualityControl';
import { useAlert } from '../../../../hooks';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { getFullName, defaults } from '../../../../utils';
import { useUniqueId } from '../../../../hooks/useUniqueId/useUniqueId';

const defaultValues = {
	name: '',
	type: '',
	description: '',
	further_actions: [],
	solutions: [],
	sender: null,
	date: null,
	responsible: null,
	status: ''
};

export function ModalQualityControl({ isOpen, onClose, qualityControlUuid }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();
	const uniqueIdForm = useUniqueId();

	const [currentQualityControlUuid, setCurrentQualityControlUuid] = useState(qualityControlUuid);
	const { isLoading, isFetching, isError, data } = useQuery(
		[ENTITY.QUALITY_CONTROL, currentQualityControlUuid],
		({ queryKey }) => qualityControlService.getQualityControl(queryKey[1]),
		{ enabled: !!currentQualityControlUuid }
	);

	const [isEdit, setIsEdit] = useState(false);
	const isNew = !currentQualityControlUuid;

	const currentUser = useSelector(globalAuthSelectors.currentUser);
	const isResponsible = currentUser.data.uuid === data?.responsible?.uuid;

	const [attachmentsToUpload, setAttachmentsToUpload] = useState([]);
	const [attachmentsToDelete, setAttachmentsToDelete] = useState([]);
	const qualityControlAttachments = data?.attachment ?? [];

	const formMethods = useForm({ defaultValues });
	const { setError, reset, clearErrors, getValues, control } = formMethods;

	useEffect(() => {
		if (!data) {
			return;
		}

		setAttachmentsToUpload([]);
		setAttachmentsToDelete([]);
		reset(defaults(data, defaultValues));
	}, [data, reset]);

	const handleOnSubmit = event => {
		event.preventDefault();

		if (currentQualityControlUuid) {
			handleOnUpdateQualityControl();
		} else {
			handleOnCreateQualityControl();
		}
	};

	const getPreparedValues = () => {
		const values = getValues();

		return {
			...values,
			responsible: values.responsible?.uuid,
			sender: values.sender?.uuid
		};
	};

	const currentAttachments = useMemo(() => qualityControlAttachments.map(item => item.file), [
		qualityControlAttachments
	]);

	const addAttachments = useMutation(({ uuid, payload }) => qualityControlService.addAttachmentFiles(uuid, payload));
	const deleteAttachments = useMutation(({ uuid, payload }) =>
		qualityControlService.deleteAttachmentFiles(uuid, payload)
	);
	const handleOnUpdateAttachments = async uuid => {
		try {
			const list = [];

			if (attachmentsToUpload.length > 0) {
				list.push(addAttachments.mutateAsync({ uuid, payload: attachmentsToUpload }));
			}
			if (attachmentsToDelete.length > 0) {
				list.push(deleteAttachments.mutateAsync({ uuid, payload: attachmentsToDelete }));
			}

			await Promise.all(list);
		} catch (error) {
			alertError('Не удалось добавить/удалить определённые файлы');
		}
	};

	const updateQualityControl = useMutation(({ uuid, payload }) =>
		qualityControlService.updateQualityControl(uuid, payload)
	);
	const handleOnUpdateQualityControl = async () => {
		clearErrors();

		try {
			await updateQualityControl.mutateAsync({ uuid: currentQualityControlUuid, payload: getPreparedValues() });

			await handleOnUpdateAttachments(currentQualityControlUuid);

			ENTITY_DEPS.QUALITY_CONTROL.forEach(dep => {
				queryClient.invalidateQueries(dep);
			});

			setIsEdit(false);
			alertSuccess('Обращение успешно обновлено');
		} catch (error) {
			error.fieldErrors.forEach(item => {
				setError(item.field, { message: item.message });
			});
			alertError('Не удалось обновить обращение');
		}
	};

	const createQualityControl = useMutation(qualityControlService.createQualityControl);
	const handleOnCreateQualityControl = async () => {
		clearErrors();

		try {
			const { uuid } = await createQualityControl.mutateAsync(getPreparedValues());

			await handleOnUpdateAttachments(uuid);

			ENTITY_DEPS.QUALITY_CONTROL.forEach(dep => {
				queryClient.invalidateQueries(dep);
			});

			setCurrentQualityControlUuid(uuid);
			setIsEdit(false);

			alertSuccess('Новое обращение успешно создано');
		} catch (error) {
			error.fieldErrors.forEach(item => {
				setError(item.field, { message: item.message });
			});

			alertError('Не удалось создать новое обращение');
		}
	};

	const addComment = useMutation(({ uuid, payload }) => qualityControlService.addComment(uuid, payload));
	const handleOnAddComment = text => {
		addComment
			.mutateAsync({ uuid: currentQualityControlUuid, payload: { text } })
			.then(response => {
				queryClient.setQueryData([ENTITY.QUALITY_CONTROL, currentQualityControlUuid], {
					...data,
					comments: [...data.comments, response]
				});
			})
			.catch(() => alertError('Не удалось добавить комментарий'));
	};

	const isDisabledSaveButton =
		isFetching ||
		updateQualityControl.isLoading ||
		createQualityControl.isLoading ||
		addAttachments.isLoading ||
		deleteAttachments.isLoading;

	return (
		<DialogTemplate
			isOpen={isOpen}
			onClose={onClose}
			isLoading={isLoading}
			fullWidth
			fullScreen={false}
			maxWidth="lg"
			headerFull
			header={
				<div className="flex">
					<Typography color="secondary" className="flex items-center sm:text-xl text-lg font-bold">
						<span className="whitespace-no-wrap">Обращение</span>
					</Typography>
				</div>
			}
			leftContent={
				isError ? (
					<ErrorMessage />
				) : isLoading ? (
					<></>
				) : (
					<form id={uniqueIdForm} onSubmit={handleOnSubmit}>
						<FormProvider {...formMethods}>
							<FormQualityControl isReadOnly={!(isEdit || isNew)} />
						</FormProvider>
						<div className="mt-32">
							<div className="mt-32">
								<Typography color="secondary" className="text-base font-semibold mb-8">
									Последующие действия
								</Typography>
								<Controller
									control={control}
									name="further_actions"
									render={({ value, onChange }) => (
										<Checklist
											onChange={onChange}
											list={value}
											isShowStat
											isDisableEdit={!(isEdit || isNew)}
											isDisableCheck={!(isEdit || isNew)}
										/>
									)}
								/>
							</div>
							<div className="mt-32">
								<Typography color="secondary" className="text-base font-semibold mb-8">
									Решения
								</Typography>
								<Controller
									control={control}
									name="solutions"
									render={({ value, onChange }) => {
										return (
											<Checklist
												onChange={onChange}
												list={value}
												isShowStat
												isDisableEdit={!(isEdit || isNew)}
												isDisableCheck={!(isEdit || isNew)}
											/>
										);
									}}
								/>
							</div>
						</div>
						<>
							<Typography color="secondary" className="text-base font-semibold mt-20">
								Прикрепленные файлы
							</Typography>
							<DropzoneArea
								dropzoneText="Перетащите файл сюда или нажмите для загрузки"
								disabled={!(isNew || isEdit)}
								files={attachmentsToUpload}
								serverFiles={currentAttachments}
								onAddFiles={setAttachmentsToUpload}
								onDeleteFile={setAttachmentsToUpload}
								onDeleteServerFile={index =>
									setAttachmentsToDelete([...attachmentsToDelete, qualityControlAttachments[index]])
								}
							/>
						</>
					</form>
				)
			}
			rightContent={
				<Comments
					comments={
						<>
							{data?.comments.map(item => (
								<div key={item.uuid} className="mb-20">
									<CardComment
										comment={{
											...item,
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
							{data?.history.map(item => (
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
					isDisableAdd={isNew}
					addComment={handleOnAddComment}
				/>
			}
			footer={
				<>
					{isResponsible && !isEdit && (
						<Button textNormal className="mr-8" onClick={() => setIsEdit(true)}>
							Изменить
						</Button>
					)}
					{(isNew || isEdit) && (
						<Button
							form={uniqueIdForm}
							textNormal
							type="submit"
							className="mr-8"
							disabled={isDisabledSaveButton}
						>
							Сохранить обращение
						</Button>
					)}
				</>
			}
		/>
	);
}

ModalQualityControl.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	qualityControlUuid: PropTypes.string
};
