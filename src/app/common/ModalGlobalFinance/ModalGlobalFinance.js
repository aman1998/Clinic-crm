import React, { useState, useEffect, useMemo } from 'react';
import { MenuItem, Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { useForm, FormProvider } from 'react-hook-form';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useMutation, useQueries, useQueryClient } from 'react-query';
import { ENTITY, globalFinanceService, currenciesService, ENTITY_DEPS, authService } from '../../services';
import { DialogTemplate, Button, DropzoneArea, Popover } from '../../bizKITUi';
import { Comments } from '../Comments';
import { CardFinanceComment } from './CardFinanceComment';
import { ModalAcceptFinance } from './ModalAcceptFinance';
import { ModalCloseFinance } from './ModalCloseFinance';
import { ModalReworkFinance } from './ModalReworkFinance';
import { HistoryStatuses } from '../HistoryStatuses';
import { useConfirm, useAlert } from '../../hooks';
import { ModalGlobalFinanceState } from '../ModalGlobalFinanceState';
import * as globalAuthSelectors from '../../auth/store/selectors/auth';
import { removeEmptyValuesFromObject } from '../../utils';
import { ErrorMessage } from '../ErrorMessage';
import { FormFinance } from './FormFinance';
import {
	STATUS_PLAN,
	STATUS_DONE,
	STATUS_CLOSED,
	STATUS_CONTROL,
	STATUS_REWORK,
	STATUS_ACCEPTED,
	HISTORY_TYPE_APPROVED_FINANCE_PAYMENT,
	HISTORY_TYPE_FINANCE_PAYMENT_FAILURE,
	HISTORY_TYPE_RETURNED_FINANCE_PAYMENT,
	GROUP_TYPE_COMING
} from '../../services/globalFinance/constants';
import { ModalMoneyAccount } from '../ModalMoneyAccount';

const useStyles = makeStyles(theme => ({
	total: {
		display: 'flex',
		alignItems: 'center',
		fontSize: '1.4rem',
		color: theme.palette.success.main
	},
	title: {
		[theme.breakpoints.down(768)]: {
			fontSize: '18px'
		}
	},
	totalCurrency: {
		marginRight: 6,
		padding: '3px 4px 0px',
		border: '1px solid currentColor',
		borderRadius: 2,
		fontSize: '.9rem'
	},
	totalText: {
		marginBottom: '-2px'
	},
	accent: {
		color: theme.palette.error.main
	}
}));

const defaultValues = {
	type: '',
	currency: '',
	plan_rate: '',
	plan_value: '',
	responsible: '',
	executor: '',
	global_finance_state: '',
	money_account: '',
	counterparty: null,
	description: '',
	plan_payment_date: null,
	fact_value: '',
	fact_rate: '',
	plan_value_kzt: '',
	fact_value_kzt: '',
	sender_money_account: '',
	recipient_money_account: ''
};

export function ModalGlobalFinance({ isOpen, globalFinanceUuid, type, onClose }) {
	const queryClient = useQueryClient();
	const theme = useTheme();
	const classes = useStyles();
	const [openModalConfirm] = useConfirm();
	const { alertError, alertSuccess } = useAlert();

	const form = useForm({
		mode: 'onBlur',
		defaultValues: {
			...defaultValues,
			type,
			currency: 'kzt'
		}
	});
	const { reset, watch, clearErrors, getValues, setError } = form;
	const watchFields = watch(['type']);
	const setErrorFromData = error => {
		error.fieldErrors.forEach(item => {
			setError(item.field, { message: item.message });
		});
	};

	const [currentFinanceUuid, setCurrentFinanceUuid] = useState(globalFinanceUuid);
	const [
		{
			isLoading: isLoadingFinanceAction,
			isFetching: isFetchingFinanceAction,
			isError: isErrorFinanceAction,
			data: financeAction
		},
		{
			isLoading: isLoadingFinanceActionAttachments,
			isError: isErrorFinanceActionAttachments,
			data: financeActionAttachments
		},
		{ isLoading: isLoadingGroups, isError: isErrorGroups, data: groups },
		{ isLoading: isLoadingCurrencies, isError: isErrorCurrencies, data: currencies },
		{ isLoading: isLoadingUsers, isError: isErrorUsers, data: users }
	] = useQueries([
		{
			queryKey: [ENTITY.GLOBAL_FINANCE_ACTION, currentFinanceUuid],
			queryFn: () => {
				if (currentFinanceUuid) {
					return globalFinanceService.getAction(currentFinanceUuid);
				}
				return Promise.resolve();
			}
		},
		{
			queryKey: [
				ENTITY.GLOBAL_FINANCE_ACTION_ATTACHMENTS,
				currentFinanceUuid,
				{ limit: Number.MAX_SAFE_INTEGER }
			],
			queryFn: ({ queryKey }) => {
				if (currentFinanceUuid) {
					return globalFinanceService.getActionAttachments(currentFinanceUuid, queryKey[2]);
				}
				return Promise.resolve([]);
			}
		},
		{
			queryKey: [ENTITY.GLOBAL_FINANCE_GROUP, { limit: Number.MAX_SAFE_INTEGER }],
			queryFn: ({ queryKey }) => globalFinanceService.getGroups(queryKey[1])
		},
		{
			queryKey: [ENTITY.CURRENCY],
			queryFn: () => currenciesService.getCurrencies()
		},
		{
			queryKey: [ENTITY.USER, { limit: Number.MAX_SAFE_INTEGER }],
			queryFn: ({ queryKey }) => authService.getUsers(queryKey[1])
		}
	]);

	useEffect(() => {
		if (!financeAction) {
			return;
		}

		reset({
			...defaultValues,
			...removeEmptyValuesFromObject({
				type: financeAction.type,
				currency: financeAction.currency,
				plan_rate: financeAction.plan_rate,
				plan_value: financeAction.plan_value,
				responsible: financeAction.responsible?.uuid,
				executor: financeAction.executor?.uuid,
				counterparty: financeAction.counterparty,
				global_finance_state: financeAction.global_finance_state?.uuid,
				money_account: financeAction.money_account?.uuid,
				description: financeAction.description,
				plan_payment_date: financeAction.plan_payment_date,
				fact_value: financeAction.fact_value,
				fact_rate: financeAction.fact_rate,
				plan_value_kzt: financeAction.plan_value_kzt,
				fact_value_kzt: financeAction.fact_value_kzt,
				sender_money_account: financeAction.sender_money_account?.uuid,
				recipient_money_account: financeAction.recipient_money_account?.uuid
			})
		});
	}, [reset, financeAction]);

	const currentUser = useSelector(globalAuthSelectors.currentUser);
	const currentUserIsExecutor = financeAction?.executor?.uuid === currentUser.data.uuid;
	const currentUserIsResponsible = financeAction?.responsible?.uuid === currentUser.data.uuid;

	const [isShowModalGlobalFinanceState, setIsShowModalGlobalFinanceState] = useState(false);
	const [isShowModalMoneyAccount, setIsShowModalMoneyAccount] = useState(false);
	const [isShowModalReworkFinance, setIsShowModalReworkFinance] = useState(false);
	const [isShowModalCloseFinance, setIsShowModalCloseFinance] = useState(false);
	const [isShowModalAcceptFinance, setIsShowModalAcceptFinance] = useState(false);

	const statusList = useMemo(
		() => ({
			NEW: 'NEW',
			PLAN: 'PLAN',
			IMPLEMENTATION: 'IMPLEMENTATION',
			CONTROL: 'CONTROL',
			RESULT: 'RESULT'
		}),
		[]
	);
	const status = useMemo(() => {
		const financeStatus = financeAction?.status;

		if ([STATUS_CONTROL].includes(financeStatus)) {
			return statusList.CONTROL;
		}

		if ([STATUS_CLOSED, STATUS_DONE].includes(financeStatus)) {
			return statusList.RESULT;
		}

		if ([STATUS_ACCEPTED].includes(financeStatus) || (financeAction && !financeAction.responsible)) {
			return statusList.IMPLEMENTATION;
		}

		if ([STATUS_PLAN, STATUS_REWORK].includes(financeStatus)) {
			return statusList.PLAN;
		}

		return statusList.NEW;
	}, [financeAction, statusList]);
	const isControl = status === statusList.CONTROL;
	const isImplementation = status === statusList.IMPLEMENTATION;
	const isResult = status === statusList.RESULT;
	const isPlan = status === statusList.PLAN;
	const isNew = status === statusList.NEW;
	const title = useMemo(() => {
		const map = {
			[statusList.NEW]: 'Новая финансовая операция',
			[statusList.PLAN]: 'Выполнение финансовой операции',
			[statusList.IMPLEMENTATION]: 'Выполнение финансовой операции',
			[statusList.CONTROL]: 'Контроль финансовой операции',
			[statusList.RESULT]: 'Результат финансовой операции'
		};

		return map[status];
	}, [statusList, status]);

	const historyStatusesList = useMemo(() => {
		if (!Array.isArray(financeAction?.history_statuses)) {
			return [];
		}

		const mapColors = {
			[HISTORY_TYPE_APPROVED_FINANCE_PAYMENT]: theme.palette.success.main,
			[HISTORY_TYPE_FINANCE_PAYMENT_FAILURE]: theme.palette.error.main,
			[HISTORY_TYPE_RETURNED_FINANCE_PAYMENT]: theme.palette.error.main,
			defaultColor: theme.palette.primary.main
		};

		return financeAction.history_statuses.map(item => ({
			name: item.name,
			color: mapColors[item.type]
		}));
	}, [financeAction, theme.palette.error.main, theme.palette.primary.main, theme.palette.success.main]);

	const getPreparedValues = () => {
		const values = getValues();

		return {
			...values,
			counterparty: values.counterparty?.uuid
		};
	};

	const [attachmentsToUpload, setAttachmentsToUpload] = useState([]);
	const [attachmentsToDelete, setAttachmentsToDelete] = useState([]);
	const currentAttachments = financeActionAttachments?.map(item => item.file);
	const createAttachments = useMutation(({ uuid, payload }) =>
		globalFinanceService.createActionAttachments(uuid, payload)
	);
	const deleteAttachments = useMutation(({ uuid, payload }) =>
		globalFinanceService.deleteActionAttachments(uuid, payload)
	);
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

			ENTITY_DEPS.GLOBAL_FINANCE_ACTION_ATTACHMENTS.forEach(dep => {
				queryClient.invalidateQueries(dep);
			});
		} catch (error) {
			alertError('Не удалось добавить/удалить определённые файлы');
		}
	};
	useEffect(() => {
		setAttachmentsToUpload([]);
		setAttachmentsToDelete([]);
	}, [financeActionAttachments]);

	const createFinance = useMutation(payload => globalFinanceService.createAction(payload));
	const handleOnCreateFinance = async () => {
		clearErrors();

		try {
			const { uuid } = await createFinance.mutateAsync(getPreparedValues());

			await handleOnUpdateAttachments(uuid);

			setCurrentFinanceUuid(uuid);
			alertSuccess('Новая финансовая операция успешно создана');

			ENTITY_DEPS.GLOBAL_FINANCE_ACTION.forEach(dep => {
				queryClient.invalidateQueries(dep);
			});
		} catch (error) {
			setErrorFromData(error);
			alertError('Не удалось создать новую финансовую операцию');
		}
	};

	const [isEdit, setIsEdit] = useState(false);
	const updateFinance = useMutation(({ uuid, payload }) => globalFinanceService.updateAction(uuid, payload));
	const handleOnUpdateFinance = async () => {
		clearErrors();

		try {
			await updateFinance.mutateAsync({ uuid: currentFinanceUuid, payload: getPreparedValues() });

			await handleOnUpdateAttachments(currentFinanceUuid);

			ENTITY_DEPS.GLOBAL_FINANCE_ACTION.forEach(dep => {
				queryClient.invalidateQueries(dep);
			});

			setIsEdit(false);
			alertSuccess('Данные финансовой операции успешно обновлены');
		} catch (error) {
			setErrorFromData(error);

			alertError('Не удалось обновить данные финансовой операции');
		}
	};

	const deleteFinance = useMutation(uuid => globalFinanceService.deleteAction(uuid));
	const handleOnDeleteFinance = uuid => {
		deleteFinance
			.mutateAsync(uuid)
			.then(() => {
				alertSuccess('Успешно удаленно');

				ENTITY_DEPS.GLOBAL_FINANCE_ACTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
			})
			.catch(() => {
				alertError('Не удалось удалить');
			});
	};

	const undeleteFinance = useMutation(uuid => globalFinanceService.undeleteAction(uuid));
	const handleOnUndeleteFinance = uuid => {
		undeleteFinance
			.mutateAsync(uuid)
			.then(() => {
				alertSuccess('Успешно восстановлено');

				ENTITY_DEPS.GLOBAL_FINANCE_ACTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
			})
			.catch(() => {
				alertError('Не удалось восстановить');
			});
	};

	const controlFinance = useMutation(uuid => globalFinanceService.controlAction(uuid));
	const handleOnControlFinance = uuid => {
		clearErrors();

		controlFinance
			.mutateAsync(uuid)
			.then(() => {
				alertSuccess('Успешно отправлено на контроль');

				ENTITY_DEPS.GLOBAL_FINANCE_ACTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
			})
			.catch(error => {
				setErrorFromData(error);

				alertError('Не удалось отправить на контроль');
			});
	};

	const finishFinance = useMutation(uuid => globalFinanceService.finishAction(uuid));
	const patchAction = useMutation(({ uuid, payload }) => globalFinanceService.patchAction(uuid, payload));
	const handleOnFinishFinance = async uuid => {
		clearErrors();

		const payload = getValues(['fact_value', 'fact_rate', 'fact_value_kzt']);

		try {
			await patchAction.mutateAsync({ uuid, payload });
			await finishFinance.mutateAsync(uuid);

			alertSuccess('Операция проведена успешно');

			ENTITY_DEPS.GLOBAL_FINANCE_ACTION.forEach(dep => {
				queryClient.invalidateQueries(dep);
			});
		} catch (error) {
			setErrorFromData(error);

			alertError('Не удалось провести операцию');
		}
	};

	const handleOnAddComment = message => {
		const params = {
			text: message
		};

		globalFinanceService
			.commentAction(currentFinanceUuid, params)
			.then(({ data }) => {
				queryClient.setQueryData([ENTITY.GLOBAL_FINANCE_ACTION, currentFinanceUuid], {
					...financeAction,
					comments: [...financeAction.comments, data]
				});
			})
			.catch(() => {
				alertError('Не удалось добавить комментарий');
			});
	};

	const isLoading =
		isLoadingFinanceAction ||
		isLoadingFinanceActionAttachments ||
		isLoadingGroups ||
		isLoadingUsers ||
		isLoadingCurrencies;

	const isError =
		isErrorFinanceAction || isErrorFinanceActionAttachments || isErrorGroups || isErrorUsers || isErrorCurrencies;

	return (
		<>
			<DialogTemplate
				isOpen={isOpen}
				onClose={onClose}
				isLoading={isLoading}
				fullScreen={false}
				maxWidth="lg"
				fullWidth
				headerFull
				header={
					<div className="flex">
						<Typography color="secondary" className="flex flex-wrap items-center text-xl font-bold">
							<span className={`mr-20 ${classes.title}`}>{title}</span>

							{isResult && (
								<span className={clsx({ [classes.accent]: financeAction.total < 1 }, classes.total)}>
									<span className={classes.totalCurrency}>KZT</span>
									<span className={classes.totalText}>{financeAction.total.toFixed(2)}</span>
								</span>
							)}
						</Typography>

						{financeAction && (
							<div className="ml-20">
								<HistoryStatuses list={historyStatusesList} maxItems={3} />
							</div>
						)}
					</div>
				}
				leftContent={
					isError ? (
						<ErrorMessage />
					) : isLoading ? (
						<></>
					) : (
						<>
							<FormProvider {...form}>
								<FormFinance
									currencies={currencies.results}
									users={users.results}
									companies={[]}
									financeGroups={groups.results}
									isCreated={!isNew}
									isEdit={isNew || isEdit}
									isShowFact={isImplementation || isResult}
									isEditFact={isImplementation}
									onAddCompany={() => {}}
									onAddFinanceState={() => setIsShowModalGlobalFinanceState(true)}
									onAddMoneyAccount={() => setIsShowModalMoneyAccount(true)}
								/>
							</FormProvider>

							<DropzoneArea
								dropzoneText="Перетащите файл сюда или нажмите для загрузки"
								disabled={!(isNew || isEdit)}
								files={attachmentsToUpload}
								serverFiles={currentAttachments}
								onAddFiles={setAttachmentsToUpload}
								onDeleteFile={setAttachmentsToUpload}
								onDeleteServerFile={index =>
									setAttachmentsToDelete([
										...attachmentsToDelete,
										financeActionAttachments[index].uuid
									])
								}
							/>
						</>
					)
				}
				rightContent={
					<Comments
						comments={
							<>
								{financeAction?.comments?.map(item => (
									<div key={item.uuid} className="mb-20">
										<CardFinanceComment comment={item} />
									</div>
								))}
							</>
						}
						isHideHistory
						isDisableAdd={isNew}
						addComment={handleOnAddComment}
					/>
				}
				footer={
					isEdit ? (
						<Button
							textNormal
							className="mr-8"
							disabled={
								updateFinance.isLoading ||
								createAttachments.isLoading ||
								deleteAttachments.isLoading ||
								isFetchingFinanceAction
							}
							onClick={() => handleOnUpdateFinance(currentFinanceUuid)}
						>
							Сохранить
						</Button>
					) : (
						<>
							{!financeAction?.deleted && (
								<>
									{isNew && (
										<Button
											textNormal
											className="mr-8"
											disabled={
												createFinance.isLoading ||
												createAttachments.isLoading ||
												deleteAttachments.isLoading
											}
											onClick={handleOnCreateFinance}
										>
											Сохранить
										</Button>
									)}

									{isPlan && (
										<Button
											textNormal
											className="mr-8"
											disabled={
												controlFinance.isLoading ||
												isFetchingFinanceAction ||
												!currentUserIsExecutor
											}
											onClick={() => handleOnControlFinance(currentFinanceUuid)}
										>
											Отправить на контроль
										</Button>
									)}

									{isControl && (
										<div className="flex flex-wrap">
											<Button
												textNormal
												className="mr-8"
												customColor="primary"
												disabled={!currentUserIsResponsible || isFetchingFinanceAction}
												onClick={() => setIsShowModalAcceptFinance(true)}
											>
												Утвердить операцию
											</Button>
											<Button
												textNormal
												className="mr-8"
												customColor="secondary"
												disabled={!currentUserIsResponsible || isFetchingFinanceAction}
												onClick={() => setIsShowModalCloseFinance(true)}
											>
												Отклонить операцию
											</Button>
											<Button
												textNormal
												className="mr-8"
												disabled={!currentUserIsResponsible || isFetchingFinanceAction}
												onClick={() => setIsShowModalReworkFinance(true)}
											>
												Вернуть на доработку
											</Button>
										</div>
									)}

									{isImplementation && (
										<Button
											textNormal
											className="mr-8"
											disabled={
												finishFinance.isLoading ||
												patchAction.isLoading ||
												isFetchingFinanceAction ||
												!currentUserIsExecutor
											}
											onClick={() => handleOnFinishFinance(financeAction.uuid)}
										>
											Провести операцию
										</Button>
									)}
								</>
							)}

							{financeAction && !isResult && (
								<div className="ml-auto">
									<Popover>
										<MenuItem>
											{financeAction.deleted ? (
												<Button
													customColor="accent"
													textNormal
													fullWidth
													onClick={() => handleOnUndeleteFinance(financeAction.uuid)}
													disabled={undeleteFinance.isLoading}
												>
													Восстановить
												</Button>
											) : (
												<Button
													customColor="accent"
													textNormal
													fullWidth
													disabled={deleteFinance.isLoading}
													onClick={() =>
														openModalConfirm({
															title: 'Архивировать финансовую операцию?',
															onSuccess: () => handleOnDeleteFinance(financeAction.uuid)
														})
													}
												>
													Архивировать
												</Button>
											)}
										</MenuItem>

										{(isPlan || isImplementation) && currentUserIsExecutor && (
											<MenuItem>
												<Button
													textNormal
													fullWidth
													onClick={() => {
														setIsEdit(true);
													}}
												>
													Изменить
												</Button>
											</MenuItem>
										)}
									</Popover>
								</div>
							)}
						</>
					)
				}
			/>
			{isShowModalGlobalFinanceState && (
				<ModalGlobalFinanceState
					isOpen
					type={watchFields.type}
					onClose={() => setIsShowModalGlobalFinanceState(false)}
				/>
			)}
			{isShowModalMoneyAccount && <ModalMoneyAccount isOpen onClose={() => setIsShowModalMoneyAccount(false)} />}
			{isShowModalAcceptFinance && (
				<ModalAcceptFinance
					isOpen
					globalFinanceUuid={currentFinanceUuid}
					onClose={() => setIsShowModalAcceptFinance(false)}
				/>
			)}
			{isShowModalCloseFinance && (
				<ModalCloseFinance
					isOpen
					globalFinanceUuid={currentFinanceUuid}
					onClose={() => setIsShowModalCloseFinance(false)}
				/>
			)}

			{isShowModalReworkFinance && (
				<ModalReworkFinance
					isOpen
					globalFinanceUuid={currentFinanceUuid}
					onClose={() => setIsShowModalReworkFinance(false)}
				/>
			)}
		</>
	);
}
ModalGlobalFinance.defaultProps = {
	globalFinanceUuid: null,
	type: GROUP_TYPE_COMING
};
ModalGlobalFinance.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	globalFinanceUuid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	type: PropTypes.oneOf(globalFinanceService.getGroupsTypeList().map(item => item.type)),
	onClose: PropTypes.func.isRequired
};
