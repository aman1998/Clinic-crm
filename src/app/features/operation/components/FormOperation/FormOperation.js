import React from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Typography, Grid, IconButton } from '@material-ui/core';
import { Edit as EditIcon } from '@material-ui/icons';
import clsx from 'clsx';
import { ENTITY, ENTITY_DEPS, operationService, patientsService } from '../../../../services';
import {
	BoxTemplate,
	TextField,
	Button,
	DateTimePickerField,
	CurrencyTextField,
	PhoneField
} from '../../../../bizKITUi';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { getFullName } from '../../../../utils';
import { modalPromise } from '../../../../common/ModalPromise';
import { ModalOperation } from '../../../../common/ModalOperation';
import { ModalPatient } from '../../../../common/ModalPatient';
import { useAlert, useConfirm } from '../../../../hooks';
import { CardComment, Comments } from '../../../../common/Comments';
import {
	OPERATION_STATUS_CANCELED,
	OPERATION_STATUS_COMPLETED,
	OPERATION_STATUS_IN_PROGRESS
} from '../../../../services/operation/constants';

export function FormOperation({ operationUuid }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();
	const [openModalConfirm] = useConfirm();

	const {
		isLoading: isLoadingOperation,
		isFetching: isFetchingOperation,
		isError: isErrorOperation,
		data: operation
	} = useQuery([ENTITY.OPERATION, operationUuid], ({ queryKey }) => operationService.getOperation(queryKey[1]));

	const checkoutOperation = useMutation(payload => operationService.checkoutOperation(payload));
	const handleOnCheckoutOperation = () => {
		checkoutOperation
			.mutateAsync(operationUuid)
			.then(() => {
				ENTITY_DEPS.OPERATION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Успешно отправлено на кассу');
			})
			.catch(() => {
				alertError('Не удалось отправить на кассу');
			});
	};

	const createComment = useMutation(({ uuid, payload }) => operationService.createOperationComment(uuid, payload));
	const handleOnCreateComment = message => {
		createComment
			.mutateAsync({ uuid: operationUuid, payload: { text: message } })
			.then(data => {
				queryClient.setQueryData([ENTITY.OPERATION, operationUuid], {
					...operation,
					comments: [...operation.comments, data]
				});
			})
			.catch(() => {
				alertError('Не удалось добавить комментарий');
			});
	};

	const isPaid = operation && operation.paid >= operation.service.cost;
	const isCompleted = operation?.status === OPERATION_STATUS_COMPLETED;
	const isCancel = operation?.status === OPERATION_STATUS_CANCELED;
	const isProgress = operation?.status === OPERATION_STATUS_IN_PROGRESS;

	return (
		<BoxTemplate
			height="730px"
			header={
				<div className="flex items-center justify-between">
					<Typography
						color="secondary"
						className="flex items-center text-xl font-bold mr-20 whitespace-no-wrap"
					>
						Информация об операции
					</Typography>

					{operation && (
						<div
							className={clsx({
								'text-success': isCompleted,
								'text-error': isCancel,
								'text-primary': isProgress
							})}
						>
							{operationService.getOperationStatus(operation.status)?.name}
						</div>
					)}
				</div>
			}
			leftContent={
				isErrorOperation ? (
					<ErrorMessage />
				) : isLoadingOperation ? (
					<FuseLoading />
				) : (
					<>
						<TextField
							value={operation.stage.name}
							label="Этап"
							variant="outlined"
							fullWidth
							margin="normal"
							InputProps={{
								readOnly: true
							}}
						/>

						<TextField
							value={operation.service.name}
							label="Наименование операции"
							variant="outlined"
							fullWidth
							margin="normal"
							InputProps={{
								readOnly: true
							}}
						/>

						<TextField
							value={operation.service.direction.name}
							label="Направление"
							variant="outlined"
							fullWidth
							margin="normal"
							InputProps={{
								readOnly: true
							}}
						/>

						<TextField
							value={getFullName(operation.service.doctor)}
							label="Врач"
							variant="outlined"
							fullWidth
							margin="normal"
							InputProps={{
								readOnly: true
							}}
						/>

						<Grid container spacing={2}>
							<Grid item md={6} xs={12}>
								<DateTimePickerField
									label="Дата начала"
									fullWidth
									inputVariant="outlined"
									onlyValid
									margin="normal"
									value={operation.date_time}
									readOnly
								/>
							</Grid>
							<Grid item md={6} xs={12}>
								<TextField
									value={`${operation.service.duration} минут`}
									label="Длительность"
									variant="outlined"
									fullWidth
									margin="normal"
									InputProps={{
										readOnly: true
									}}
								/>
							</Grid>
						</Grid>

						<Grid container spacing={2}>
							<Grid item md={6} xs={12}>
								<CurrencyTextField
									value={operation.service.cost}
									label="Стоимость"
									variant="outlined"
									fullWidth
									margin="normal"
									InputProps={{
										readOnly: true
									}}
								/>
							</Grid>
							<Grid item md={6} xs={12}>
								<CurrencyTextField
									value={operation.paid}
									label="Оплачено"
									variant="outlined"
									fullWidth
									margin="normal"
									InputProps={{
										readOnly: true
									}}
								/>
							</Grid>
						</Grid>

						<TextField
							value={getFullName(operation.patient)}
							label="Пациент"
							variant="outlined"
							fullWidth
							margin="normal"
							InputProps={{
								readOnly: true,
								endAdornment: (
									<IconButton
										onClick={() =>
											modalPromise.open(({ onClose }) => (
												<ModalPatient
													isOpen
													patientsUuid={operation?.patient.uuid}
													onClose={onClose}
												/>
											))
										}
									>
										<EditIcon />
									</IconButton>
								)
							}}
						/>

						<Grid container spacing={2}>
							<Grid item md={6} xs={12}>
								<PhoneField
									value={patientsService.getPatientMainPhone(operation.patient)}
									label="Телефон"
									variant="outlined"
									fullWidth
									margin="normal"
									InputProps={{
										readOnly: true
									}}
								/>
							</Grid>
							<Grid item md={6} xs={12}>
								<TextField
									value={operation.patient.iin ?? ''}
									label="ИИН"
									variant="outlined"
									fullWidth
									margin="normal"
									InputProps={{
										readOnly: true
									}}
								/>
							</Grid>
						</Grid>

						<TextField
							value={operation.comment}
							label="Комментарии"
							variant="outlined"
							fullWidth
							margin="normal"
							InputProps={{
								readOnly: true
							}}
						/>
					</>
				)
			}
			rightContent={
				<Comments
					comments={
						<>
							{operation?.comments.map(comment => (
								<div key={comment.uuid} className="mb-20">
									<CardComment
										comment={{
											fullName: getFullName({
												lastName: comment.created_by.last_name,
												firstName: comment.created_by.first_name
											}),
											text: comment.text,
											createdAt: comment.created_at
										}}
									/>
								</div>
							))}
						</>
					}
					isHideHistory
					addComment={handleOnCreateComment}
				/>
			}
			footer={
				<>
					{!isErrorOperation && isProgress && (
						<div className="flex w-full">
							{!isPaid && (
								<Button
									customColor="primary"
									textNormal
									disabled={checkoutOperation.isLoading || isFetchingOperation}
									onClick={handleOnCheckoutOperation}
								>
									Отправить на кассу
								</Button>
							)}
							<div className="ml-auto">
								<Button
									variant="text"
									textNormal
									disabled={isFetchingOperation}
									onClick={() =>
										modalPromise.open(({ onClose }) => (
											<ModalOperation isOpen operationUuid={operationUuid} onClose={onClose} />
										))
									}
								>
									Изменить прием
								</Button>
								<Button
									customColor="secondary"
									variant="outlined"
									textNormal
									disabled={isFetchingOperation}
									onClick={() =>
										openModalConfirm({
											title: 'Отменить прием?',
											onSuccess: () => {
												modalPromise.open(({ onClose: close }) => (
													<ModalOperation
														operation
														isCancelModal
														isOpen
														operationUuid={operationUuid}
														onClose={close}
													/>
												));
											}
										})
									}
								>
									Отменить прием
								</Button>
							</div>
						</div>
					)}
				</>
			}
		/>
	);
}
FormOperation.propTypes = {
	operationUuid: PropTypes.string.isRequired
};
