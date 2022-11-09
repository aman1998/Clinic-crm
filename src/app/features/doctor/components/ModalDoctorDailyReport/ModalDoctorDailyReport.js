import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import moment from 'moment';
import { MenuItem, Typography, makeStyles, useTheme, Grid } from '@material-ui/core';
import {
	TextField,
	DatePickerField,
	DialogTemplate,
	DataTable,
	Button,
	ServerAutocomplete
} from '../../../../bizKITUi';
import { CardComment, CardHistory, Comments } from '../../../../common/Comments';
import { useAlert } from '../../../../hooks';
import { ENTITY, ENTITY_DEPS, employeesService, authService } from '../../../../services';
import { getFullName } from '../../../../utils';
import { modalPromise } from '../../../../common/ModalPromise';
import { BlockInfo } from '../../../../common/BlockInfo';
import * as globalAuthSelectors from '../../../../auth/store/selectors/auth';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { ModalConfirmClose } from './ModalConfirmClose';
import { ModalConfirmRework } from './ModalConfirmRework';
import { ModalReceptionExpense } from '../ModalReceptionExpense';
import {
	DOCTOR_WORK_SHIFT_STATUS_OPEN,
	DOCTOR_WORK_SHIFT_STATUS_WAREHOUSE_ACCEPTED,
	DOCTOR_WORK_SHIFT_STATUS_WAREHOUSE_REWORK,
	DOCTOR_WORK_SHIFT_STATUS_RESPONSIBLE_REWORK,
	DOCTOR_WORK_SHIFT_STATUS_WAREHOUSE_CONTROL,
	DOCTOR_WORK_SHIFT_STATUS_RESPONSIBLE_CONTROL
} from '../../../../services/employees/constants';
import { ModalConfirmReworkWarehouse } from './ModalConfirmReworkWarehouse';
import { Amount } from '../../../../bizKITUi/Amount';
import { PERMISSION } from '../../../../services/auth/constants';

const useStyles = makeStyles(theme => ({
	headerWrapper: {
		display: 'flex',
		[theme.breakpoints.down(1200)]: {
			flexDirection: 'column'
		}
	},
	header: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 200px))',
		width: '100%',
		[theme.breakpoints.down(1200)]: {
			marginTop: '16px'
		}
	},
	headerItem: {
		minWidth: 170
	}
}));

function getHighlightColor(palette, value) {
	if (value < 0) {
		return palette.error.main;
	}
	if (value > 0) {
		return palette.success.main;
	}
	return palette.text.primary;
}

export function ModalDoctorDailyReport({ isOpen, onClose, reportUuid }) {
	const { palette } = useTheme();
	const classes = useStyles();
	const { alertSuccess, alertError } = useAlert();
	const queryClient = useQueryClient();

	const [pageReceptions, setPageReceptions] = useState(0);
	const [limitReceptions, setLimitReceptions] = useState(10);

	const { mutateAsync: patchWorkShift, isLoading: isPatchWorkShiftLoading } = useMutation(({ uuid, payload }) =>
		employeesService.patchDoctorWorkShift(reportUuid, payload)
	);
	const [selectedWarehouseKeeper, setSelectedWarehouseKeeper] = useState(null);
	const [selectedResponsible, setSelectedResponsible] = useState(null);
	const handleChangeWarehouseKeeper = warehouseKeeper => {
		patchWorkShift({ uuid: reportUuid, payload: { warehouse_keeper: warehouseKeeper?.uuid ?? null } })
			.then(() => {
				setSelectedWarehouseKeeper(warehouseKeeper);
				ENTITY_DEPS.DOCTOR_WORK_SHIFTS.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Складовщик изменён');
			})
			.catch(() => {
				alertError('Не удалось изменить складовщика');
			});
	};

	const handleChangeResponsible = responsible => {
		patchWorkShift({ uuid: reportUuid, payload: { responsible: responsible?.uuid ?? null } })
			.then(() => {
				setSelectedResponsible(responsible);
				ENTITY_DEPS.DOCTOR_WORK_SHIFTS.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Ответственный изменён');
			})
			.catch(() => {
				alertError('Не удалось изменить ответственного');
			});
	};

	const { isLoading: isLoadingReceptions, isError: isErrorReceptions, data: receptions } = useQuery({
		queryKey: [
			ENTITY.DOCTOR_WORK_SHIFT_RECEPTIONS,
			reportUuid,
			{
				offset: pageReceptions * limitReceptions,
				limit: limitReceptions
			}
		],
		queryFn: ({ queryKey }) => employeesService.getDoctorWorkShiftReceptions(reportUuid, queryKey[2]),
		keepPreviousData: true
	});
	const {
		isLoading: isLoadingWorkShift,
		isFetching: isFetchingWorkShift,
		isError: isErrorWorkShift,
		data: workShift
	} = useQuery([ENTITY.DOCTOR_WORK_SHIFTS, reportUuid], () => employeesService.getDoctorWorkShift(reportUuid));

	useEffect(() => {
		if (!workShift) {
			return;
		}

		if (workShift.warehouse_keeper) {
			setSelectedWarehouseKeeper(workShift.warehouse_keeper);
		}
		if (workShift.responsible) {
			setSelectedResponsible(workShift.responsible);
		}
	}, [workShift]);

	const columns = [
		{
			name: 'date_time',
			label: 'Время',
			options: {
				customBodyRender: value => {
					return moment(value).format('HH:mm');
				}
			}
		},
		{
			name: 'service',
			label: 'Услуга',
			options: {
				customBodyRender: value => {
					return value?.name ?? '—';
				}
			}
		},
		{
			name: 'plan_expense',
			label: 'План расходов',
			options: {
				customBodyRenderLite: dataIndex => {
					const current = receptions.results[dataIndex];
					return <Amount value={current.data.plan_expense} />;
				}
			}
		},
		{
			name: 'fact_expense',
			label: 'Факт расходов',
			options: {
				customBodyRenderLite: dataIndex => {
					const current = receptions.results[dataIndex];
					return <Amount value={current.data.fact_expense} />;
				}
			}
		},
		{
			name: 'diff_expense',
			label: 'Отклонение',
			options: {
				customBodyRenderLite: dataIndex => {
					const current = receptions.results[dataIndex];
					const diff = current.data.plan_expense - current.data.fact_expense;
					return <Amount value={diff} />;
				}
			}
		},
		{
			name: 'actions',
			label: 'Действия',
			options: {
				customBodyRenderLite: dataIndex => {
					const current = receptions.results[dataIndex];
					return (
						<Button
							onClick={() =>
								modalPromise.open(({ onClose: handleClose }) => (
									<ModalReceptionExpense isOpen onClose={handleClose} uuid={current.uuid} />
								))
							}
							textNormal
							variant="text"
						>
							Подробнее
						</Button>
					);
				}
			}
		}
	];

	const tableOptionsReceptions = useMemo(
		() => ({
			serverSide: true,
			rowsPerPage: limitReceptions,
			page: pageReceptions,
			count: receptions?.results?.count ?? 0,
			onChangePage: page => setPageReceptions(page),
			onChangeRowsPerPage: limit => setLimitReceptions(limit)
		}),
		[receptions, limitReceptions, pageReceptions]
	);

	const currentUser = useSelector(globalAuthSelectors.currentUser);
	const isCurrentUserDoctor = workShift?.doctor?.uuid === currentUser.data.doctor;
	const isCurrentUserResponsible = workShift?.responsible?.uuid === currentUser.data.uuid;
	const isCurrentUserWarehouseKeeper = workShift?.warehouse_keeper?.uuid === currentUser.data.uuid;

	const addComment = useMutation(text => employeesService.addDoctorWorkShiftComment(reportUuid, text));
	const handleAddComment = text => {
		addComment
			.mutateAsync({ text })
			.then(({ data }) => {
				queryClient.setQueryData([ENTITY.DOCTOR_WORK_SHIFTS, reportUuid], {
					...workShift,
					comments: [...workShift.comments, { ...data, created_by: currentUser }]
				});
			})
			.catch(() => {
				alertError('Не удалось добавить комментарий');
			});
	};

	const controlWarehouseWorkShift = useMutation(date => employeesService.controlWarehouseDoctorWorkShift(date));
	const handleControlWarehouseWorkShift = () => {
		controlWarehouseWorkShift
			.mutateAsync(reportUuid)
			.then(() => {
				ENTITY_DEPS.DOCTOR_WORK_SHIFTS.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Смена отправлена на контроль складовщику');
			})
			.catch(() => {
				alertError('Не удалось отправить на контроль складовщику');
			});
	};

	const controlResponsibleWorkShift = useMutation(date => employeesService.controlResponsibleDoctorWorkShift(date));
	const handleControlResponsibleWorkShift = () => {
		controlResponsibleWorkShift
			.mutateAsync(reportUuid)
			.then(() => {
				ENTITY_DEPS.DOCTOR_WORK_SHIFTS.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Смена отправлена на контроль ответственному');
			})
			.catch(() => {
				alertError('Не удалось отправить на контроль ответственному');
			});
	};

	const acceptWarehouseWorkShift = useMutation(date => employeesService.acceptWarehouseDoctorWorkShift(date));
	const handleAcceptWarehouseWorkShift = () => {
		acceptWarehouseWorkShift
			.mutateAsync(reportUuid)
			.then(() => {
				ENTITY_DEPS.DOCTOR_WORK_SHIFTS.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Смена успешно утверждена');
			})
			.catch(() => {
				alertError('Не удалось утвердить смену');
			});
	};

	const canSendToWarehouseControl =
		isCurrentUserDoctor &&
		[DOCTOR_WORK_SHIFT_STATUS_OPEN, DOCTOR_WORK_SHIFT_STATUS_WAREHOUSE_REWORK].includes(workShift?.status);
	const canSendToResponsibleControl =
		isCurrentUserDoctor &&
		[DOCTOR_WORK_SHIFT_STATUS_WAREHOUSE_ACCEPTED, DOCTOR_WORK_SHIFT_STATUS_RESPONSIBLE_REWORK].includes(
			workShift?.status
		);
	const isWorkShiftOnWarehouseControl = workShift?.status === DOCTOR_WORK_SHIFT_STATUS_WAREHOUSE_CONTROL;
	const isWorkShiftOnResponsibleControl = workShift?.status === DOCTOR_WORK_SHIFT_STATUS_RESPONSIBLE_CONTROL;

	const diff_expense = workShift ? workShift.plan_expense - workShift.fact_expense : 0;

	const isSomeLoading = isLoadingReceptions || isLoadingWorkShift;
	const isSomeError = isErrorReceptions || isErrorWorkShift;

	return (
		<DialogTemplate
			isOpen={isOpen}
			onClose={onClose}
			headerFull
			header={
				<div className={classes.headerWrapper}>
					<Typography
						color="secondary"
						className="flex mr-16 items-center text-xl font-bold whitespace-no-wrap"
					>
						Закрытие дня
					</Typography>

					{isLoadingWorkShift ? (
						<></>
					) : isErrorWorkShift ? (
						<ErrorMessage />
					) : (
						<div className={`gap-10 ${classes.header}`}>
							<DatePickerField
								label="Дата"
								value={workShift.date}
								size="small"
								readOnly
								InputProps={{ readOnly: true }}
							/>
							<TextField
								label="Врач"
								value={workShift.doctor.uuid}
								variant="outlined"
								select
								readOnly
								InputProps={{ readOnly: true }}
								size="small"
							>
								<MenuItem value={workShift.doctor.uuid}>{getFullName(workShift.doctor)}</MenuItem>
							</TextField>
							<ServerAutocomplete
								value={selectedWarehouseKeeper}
								label="Складовщик"
								name="product"
								readOnly={isPatchWorkShiftLoading}
								InputProps={{ size: 'small' }}
								getOptionLabel={option => getFullName(option)}
								onFetchList={(search, limit) =>
									authService.getUsers({
										search,
										limit,
										permissions: [PERMISSION.EMPLOYEES.CONTROL_DOCTOR_WORK_SHIFT_MEDICATIONS]
									})
								}
								onFetchItem={uuid => authService.getUser(uuid)}
								onChange={handleChangeWarehouseKeeper}
							/>
							<ServerAutocomplete
								value={selectedResponsible}
								label="Ответственный"
								name="product"
								readOnly={isPatchWorkShiftLoading}
								InputProps={{ size: 'small' }}
								getOptionLabel={option => getFullName(option)}
								onFetchList={(search, limit) =>
									authService.getUsers({
										search,
										limit,
										permissions: [PERMISSION.EMPLOYEES.CONTROL_DOCTOR_WORK_SHIFT]
									})
								}
								onFetchItem={uuid => authService.getUser(uuid)}
								onChange={handleChangeResponsible}
							/>
						</div>
					)}
				</div>
			}
			leftContent={
				isSomeLoading ? (
					<FuseLoading />
				) : isSomeError ? (
					<ErrorMessage />
				) : (
					<>
						<Typography className="mb-8" variant="h6" component="h2">
							Приёмы за день
						</Typography>
						<Grid container spacing={2}>
							<Grid item md={3} xs={6}>
								<BlockInfo title="Общая стоимость" color={palette.text.primary}>
									<Amount value={workShift.total_cost} />
								</BlockInfo>
							</Grid>
							<Grid item md={3} xs={6}>
								<BlockInfo title="План расходов" color={palette.text.primary}>
									<Amount value={workShift.plan_expense} />
								</BlockInfo>
							</Grid>
							<Grid item md={3} xs={6}>
								<BlockInfo title="Факт расходов" color={palette.text.primary}>
									<Amount value={workShift.fact_expense} />
								</BlockInfo>
							</Grid>
							<Grid item md={3} xs={6}>
								<BlockInfo title="Отклонение" color={getHighlightColor(palette, diff_expense)}>
									<Amount value={diff_expense} />
								</BlockInfo>
							</Grid>
						</Grid>

						<div className="mt-32" />

						<DataTable columns={columns} options={tableOptionsReceptions} data={receptions.results} />

						<div className="mt-32" />
					</>
				)
			}
			rightContent={
				<Comments
					comments={
						<>
							{workShift?.comments?.map(item => (
								<div key={item.uuid} className="mb-20">
									<CardComment
										comment={{
											fullName: item.created_by ? getFullName(item.created_by) : '—',
											text: item.text,
											createdAt: item.created_at
										}}
									/>
								</div>
							))}
						</>
					}
					history={
						<>
							{workShift?.history?.map(item => (
								<div key={item.created_at} className="mb-20">
									<CardHistory
										fullName={item.user?.full_name}
										message={item.message}
										date={item.created_at}
									/>
								</div>
							))}
						</>
					}
					isDisableAdd={!workShift || addComment.isLoading}
					addComment={handleAddComment}
				/>
			}
			footer={
				<div className="flex">
					{isCurrentUserDoctor && (
						<Button
							onClick={handleControlWarehouseWorkShift}
							className="mr-16"
							customColor="primary"
							textNormal
							disabled={
								!canSendToWarehouseControl || controlWarehouseWorkShift.isLoading || isFetchingWorkShift
							}
						>
							Отправить на контроль склада
						</Button>
					)}
					{isCurrentUserDoctor && (
						<Button
							onClick={handleControlResponsibleWorkShift}
							className="mr-16"
							customColor="primary"
							textNormal
							disabled={
								!canSendToResponsibleControl ||
								controlResponsibleWorkShift.isLoading ||
								isFetchingWorkShift
							}
						>
							Отправить на контроль ответственному
						</Button>
					)}
					{isCurrentUserWarehouseKeeper && isWorkShiftOnWarehouseControl && (
						<>
							<Button
								onClick={handleAcceptWarehouseWorkShift}
								className="mr-16"
								customColor="primary"
								textNormal
								disabled={acceptWarehouseWorkShift.isLoading || !isWorkShiftOnWarehouseControl}
							>
								Утвердить смену
							</Button>
							<Button
								onClick={() =>
									modalPromise.open(({ onClose: handleClose }) => (
										<ModalConfirmReworkWarehouse
											isOpen
											onClose={handleClose}
											workShiftUuid={reportUuid}
										/>
									))
								}
								className="mr-16"
								textNormal
								disabled={!isWorkShiftOnWarehouseControl}
							>
								Вернуть на доработку
							</Button>
						</>
					)}
					{isCurrentUserResponsible && isWorkShiftOnResponsibleControl && (
						<>
							<Button
								onClick={() =>
									modalPromise.open(({ onClose: handleClose }) => (
										<ModalConfirmClose isOpen onClose={handleClose} workShiftUuid={reportUuid} />
									))
								}
								className="mr-16"
								customColor="primary"
								textNormal
								disabled={!isWorkShiftOnResponsibleControl}
							>
								Утвердить смену
							</Button>
							<Button
								onClick={() =>
									modalPromise.open(({ onClose: handleClose }) => (
										<ModalConfirmRework isOpen onClose={handleClose} workShiftUuid={reportUuid} />
									))
								}
								className="mr-16"
								textNormal
								disabled={!isWorkShiftOnResponsibleControl}
							>
								Вернуть на доработку
							</Button>
						</>
					)}
				</div>
			}
		/>
	);
}
ModalDoctorDailyReport.defaultProps = {};
ModalDoctorDailyReport.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	reportUuid: PropTypes.string.isRequired
};
