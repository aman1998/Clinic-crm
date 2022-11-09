import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import PropTypes from 'prop-types';
import { NavigateNext as NavigateNextIcon } from '@material-ui/icons';
import { Typography, useMediaQuery, useTheme, MenuItem, Breadcrumbs, debounce } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { defaults, getFullName, getShortName } from '../../utils';
import { useAlert } from '../../hooks';
import { ENTITY, tasksService, ENTITY_DEPS } from '../../services';
import { Button, DialogTemplate, DropzoneArea, Popover } from '../../bizKITUi';
import { ErrorMessage } from '../ErrorMessage';
import { FormTask } from './FormTask';
import { Comments, CardComment } from '../Comments';
import { FormCheckLists } from './FormCheckLists';
import { TASK_STATUS_PLAN, TASK_STATUS_DONE, TASK_END_FAILURE } from '../../services/tasks/constants';
import { HistoryStatuses } from '../HistoryStatuses';
import * as globalAuthSelectors from '../../auth/store/selectors/auth';

export function ModalTask({ isOpen, taskUuid, initialValues, onClose }) {
	const theme = useTheme();
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	const currentUser = useSelector(globalAuthSelectors.currentUser);
	const defaultValues = useMemo(
		() => ({
			name: '',
			text: '',
			plan_end_at: null,
			assignee: currentUser.data.uuid,
			patient: null,
			reception: null,
			attachment: [],
			status: '',
			stage: null,
			checklist: [],
			...initialValues
		}),
		[currentUser, initialValues]
	);

	const isSmBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));

	const [attachmentsToUpload, setAttachmentsToUpload] = useState([]);
	const [attachmentsToDelete, setAttachmentsToDelete] = useState([]);

	const form = useForm({
		mode: 'onBlur',
		defaultValues: defaults(initialValues, defaultValues)
	});
	const { watch, reset, getValues, setError, control, setValue } = form;

	const watchFields = watch(['status', 'patient', 'stage']);

	useEffect(() => {
		if (!watchFields?.stage?.operation?.patient) {
			return;
		}

		setValue('patient', watchFields.stage.operation.patient);
	}, [setValue, watchFields.stage]);

	const [currentTaskUuid, setCurrentTaskUuid] = useState(taskUuid);
	const { isLoading, isFetching, isError, data: taskData } = useQuery(
		[ENTITY.TASK, currentTaskUuid],
		({ queryKey }) => tasksService.getTask(queryKey[1]),
		{ enabled: !!currentTaskUuid }
	);

	const [isEdit, setIsEdit] = useState(false);

	useEffect(() => {
		if (!taskData) {
			return;
		}

		setAttachmentsToUpload([]);
		setAttachmentsToDelete([]);
		reset(defaults({ ...taskData, reception: taskData.reception?.uuid }, defaultValues));
	}, [defaultValues, reset, taskData]);

	const isNew = !watchFields.status;
	const isPlan = watchFields.status === TASK_STATUS_PLAN;
	const isDone = watchFields.status === TASK_STATUS_DONE;

	const historyStatusesList = useMemo(() => {
		if (!taskData?.history) {
			return [];
		}

		const mapColors = {
			[TASK_END_FAILURE]: theme.palette.error.main,
			defaultColor: theme.palette.primary.main
		};

		return taskData.history.map(item => ({
			name: item.name,
			color: mapColors[item.type]
		}));
	}, [taskData, theme.palette.error.main, theme.palette.primary.main]);

	const currentAttachments = taskData?.attachment.map(item => item.file);

	const createAttachments = useMutation(({ uuid, payload }) => tasksService.createAttachments(uuid, payload));
	const deleteAttachments = useMutation(({ uuid, payload }) => tasksService.deleteAttachments(uuid, payload));
	const handleOnUpdateAttachments = async uuid => {
		try {
			const list = [];

			if (attachmentsToUpload.length > 0) {
				list.push(createAttachments.mutateAsync({ uuid, payload: attachmentsToUpload }));
			}
			if (attachmentsToDelete.length > 0) {
				list.push(deleteAttachments.mutateAsync({ uuid, payload: attachmentsToDelete }));
			}

			await Promise.all(list);
		} catch (error) {
			alertError('Не удалось добавить/удалить определённые файлы');
		}
	};

	const getPreparedValues = () => {
		const values = getValues();

		return {
			...values,
			assignee: values.assignee?.uuid,
			patient: values.patient?.uuid,
			reception: values.reception?.uuid,
			reception_type: values.reception?.base_type,
			stage: values.stage?.uuid
		};
	};

	const createTask = useMutation(payload => tasksService.createTask(payload));
	const handleOnCreateTask = async () => {
		try {
			const { uuid } = await createTask.mutateAsync(getPreparedValues());

			await handleOnUpdateAttachments(uuid);

			setCurrentTaskUuid(uuid);

			ENTITY_DEPS.TASK.forEach(dep => {
				queryClient.invalidateQueries(dep);
			});

			alertSuccess('Задача успешно создана');
		} catch (error) {
			error.fieldErrors.forEach(item => {
				setError(item.field, { message: item.message });
			});

			alertError('Не удалось создать задачу');
		}
	};

	const updateTask = useMutation(({ uuid, payload }) => tasksService.updateTask(uuid, payload));
	const handleOnUpdateTask = async () => {
		try {
			await updateTask.mutateAsync({ uuid: currentTaskUuid, payload: getPreparedValues() });

			await handleOnUpdateAttachments(currentTaskUuid);

			ENTITY_DEPS.TASK.forEach(dep => {
				queryClient.invalidateQueries(dep);
			});

			setIsEdit(false);

			alertSuccess('Задача успешно сохранена');
		} catch (error) {
			error.fieldErrors.forEach(item => {
				setError(item.field, { message: item.message });
			});

			alertError('Не удалось сохранить задачу');
		}
	};

	const completeTask = useMutation(({ uuid, payload }) => tasksService.completeTask(uuid, payload));
	const handleOnCompleteTask = async () => {
		try {
			await completeTask.mutateAsync({ uuid: currentTaskUuid, payload: getPreparedValues() });

			ENTITY_DEPS.TASK.forEach(dep => {
				queryClient.invalidateQueries(dep);
			});

			alertSuccess('Задача успешно завершена');
		} catch (error) {
			error.fieldErrors.forEach(item => {
				setError(item.field, { message: item.message });
			});

			alertError('Не удалось завершить задачу');
		}
	};

	const addTaskComment = useMutation(({ uuid, payload }) => tasksService.addTaskComment(uuid, payload));
	const addComment = text => {
		addTaskComment
			.mutateAsync({ uuid: currentTaskUuid, payload: { text } })
			.then(({ data }) => {
				queryClient.setQueryData([ENTITY.TASK, currentTaskUuid], {
					...taskData,
					comments: [...taskData.comments, data]
				});
			})
			.catch(() => {
				alertError('Не удалось добавить комментарий');
			});
	};

	const patchTask = useMutation(({ uuid, payload }) => tasksService.patchTask(uuid, payload));
	const callbackDebounce = useCallback(
		debounce(fn => fn(), 500),
		[]
	);
	const updateChecklist = checklist => {
		if (isNew) {
			return;
		}

		patchTask.mutateAsync({ uuid: currentTaskUuid, payload: { checklist } }).catch(() => {
			alertError('Не удалось обновить чеклисты');

			setValue('checklist', taskData.checklist);
		});
	};

	const isReadOnly = !isEdit && !isNew;
	const readOnlyFields = {
		name: isReadOnly,
		text: isReadOnly,
		plan_end_at: isReadOnly,
		assignee: isReadOnly,
		patient: isReadOnly || !!initialValues.patient || !!watchFields.stage,
		reception: isReadOnly || !!initialValues.reception || !watchFields.patient,
		stage: !!watchFields.stage
	};
	const handleOnSave = isNew ? handleOnCreateTask : handleOnUpdateTask;

	const isHavePatient = taskData?.patient;
	const isDisabledSaveButton =
		isFetching ||
		createTask.isLoading ||
		updateTask.isLoading ||
		(!isNew && !isEdit) ||
		createAttachments.isLoading ||
		deleteAttachments.isLoading;

	return (
		<DialogTemplate
			isOpen={isOpen}
			onClose={onClose}
			isLoading={isLoading}
			fullScreen={isSmBreakpoint}
			maxWidth="lg"
			fullWidth
			headerFull
			header={
				<div className="flex justify-between flex-col sm3:flex-row sm3:items-center">
					<Typography color="secondary" className="text-xl font-bold sm3:text-center">
						{isNew && 'Новая задача'}
						{isPlan && 'Задача'}
						{isDone && 'Задача завершена'}
					</Typography>
					<HistoryStatuses list={historyStatusesList} maxItems={3} widthItem="200px" />
				</div>
			}
			leftContent={
				isError ? (
					<ErrorMessage />
				) : (
					<>
						{isHavePatient && (
							<Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} className="mb-20">
								<Link to="/patients">Пациенты</Link>
								<Link to={`/patients/${taskData.patient.uuid}`}>{getShortName(taskData.patient)}</Link>
							</Breadcrumbs>
						)}

						<FormProvider {...form}>
							<FormTask readOnlyFields={readOnlyFields} />
						</FormProvider>

						<Typography className="font-bold mt-20 mb-10 text-base" color="secondary">
							Чек-листы
						</Typography>
						<Controller
							control={control}
							name="checklist"
							render={({ value, onChange }) => (
								<FormCheckLists
									lists={value}
									isDisableCheck={isNew || isDone}
									isDisableEdit={!isNew && isDone}
									onChange={newChecklists => {
										callbackDebounce(() => updateChecklist(newChecklists));
										onChange(newChecklists);
									}}
								/>
							)}
						/>

						<Typography className="font-bold mt-20 text-base" color="secondary">
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
								setAttachmentsToDelete([...attachmentsToDelete, taskData.attachment[index].uuid])
							}
						/>
					</>
				)
			}
			rightContent={
				<Comments
					isHideHistory
					comments={
						<>
							{taskData?.comments?.map(comment => (
								<div key={comment.uuid} className="mb-20">
									<CardComment
										comment={{
											fullName: getFullName(comment.created_by),
											text: comment.text,
											createdAt: comment.created_at
										}}
									/>
								</div>
							))}
						</>
					}
					addComment={addComment}
					isDisableAdd={isNew}
				/>
			}
			footer={
				<>
					<Button
						color="primary"
						onClick={handleOnSave}
						textNormal
						className="mr-20"
						disabled={isDisabledSaveButton}
					>
						Сохранить
					</Button>

					{isPlan && (
						<>
							<Button
								customColor="primary"
								onClick={handleOnCompleteTask}
								textNormal
								disabled={isEdit || completeTask.isLoading || isFetching}
							>
								Завершить
							</Button>
							<div className="ml-auto">
								<Popover>
									<MenuItem>
										<Button
											variant="contained"
											color="primary"
											textNormal
											onClick={() => setIsEdit(true)}
										>
											Изменить
										</Button>
									</MenuItem>
								</Popover>
							</div>
						</>
					)}
				</>
			}
		/>
	);
}

ModalTask.defaultProps = {
	taskUuid: null,
	initialValues: {}
};

ModalTask.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	taskUuid: PropTypes.string,
	initialValues: PropTypes.shape({
		name: PropTypes.string,
		text: PropTypes.string,
		plan_end_at: PropTypes.instanceOf(Date),
		assignee: PropTypes.string,
		patient: PropTypes.string,
		reception: PropTypes.string,
		stage: PropTypes.string
	}),
	onClose: PropTypes.func.isRequired
};
