import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import moment from 'moment';
import { CallButton } from '../CallButton';
import { DialogSimpleTemplate, Button } from '../../bizKITUi';
import { ModalReceive } from '../ModalReceive';
import { authService, clinicService, ENTITY, ENTITY_DEPS, patientsService } from '../../services';
import FuseLoading from '../../../@fuse/core/FuseLoading';
import { getFullName, numberFormat } from '../../utils';
import {
	STATUS_RECEPTION_APPOINTED,
	STATUS_RECEPTION_CASH,
	STATUS_RECEPTION_CONFIRMED
} from '../../services/clinic/constants';
import { BlockReceptionStatus } from '../BlockReceptionStatus';
import { useConfirm, useAlert } from '../../hooks';
import { modalPromise } from '../ModalPromise';
import { ModalTask } from '../ModalTask';
import { ListTasks } from './ListTasks';
import { ErrorMessage } from '../ErrorMessage';
import { ModalDocumentContract } from '../ModalDocumentContract';
import { ListDocuments } from './ListDocuments';
import { GuardCheckPermission } from '../GuardCheckPermission';
import { PERMISSION } from '../../services/auth/constants';

export function ModalAppointmentInfo({ isOpen, onClose, receptionUuid, onUpdate }) {
	const { alertSuccess, alertError } = useAlert();
	const [openModalConfirm] = useConfirm();
	const queryClient = useQueryClient();

	const { isLoading, isFetching, isError, data: reception, refetch } = useQuery(
		[ENTITY.CLINIC_RECEPTION, receptionUuid],
		({ queryKey }) => clinicService.getReceptionById(queryKey[1]).then(res => res.data)
	);

	const { isLoading: callManagerLoading, data: call_manager } = useQuery(
		[ENTITY.USER, reception?.call_center_manager],
		({ queryKey }) => authService.getUser(queryKey[1]).then(res => res.data),
		{
			enabled: !!reception
		}
	);

	const isReceptionAppointed = reception?.status === STATUS_RECEPTION_APPOINTED;
	const isReceptionConfirmed = reception?.status === STATUS_RECEPTION_CONFIRMED;
	const isReceptionCash = reception?.status === STATUS_RECEPTION_CASH;

	const [isShowModalReceive, setIsShowModalReceive] = useState(false);

	const checkoutReception = useMutation(uuid => clinicService.checkoutReception(uuid));
	const handleOnCheckoutReception = () => {
		checkoutReception
			.mutateAsync(receptionUuid)
			.then(() => {
				ENTITY_DEPS.CLINIC_RECEPTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				onUpdate();
				alertSuccess('Успешно отправлено на кассу');
			})
			.catch(() => {
				alertError('Не удалось отправить на кассу');
			});
	};

	const confirmReception = useMutation(uuid => clinicService.confirmReception(uuid));
	const handleOnConfirmReception = () => {
		confirmReception
			.mutateAsync(receptionUuid)
			.then(() => {
				ENTITY_DEPS.CLINIC_RECEPTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				onUpdate();
				alertSuccess('Приём успешно подтверждён');
			})
			.catch(() => {
				alertError('Не удалось подтвердить приём');
			});
	};

	const cancelReception = useMutation(uuid => clinicService.cancelReception(uuid));
	const handleOnCancelReception = () => {
		cancelReception
			.mutateAsync(receptionUuid)

			.then(() => {
				ENTITY_DEPS.CLINIC_RECEPTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				onUpdate();
				alertSuccess('Приём успешно отменён');
			})
			.catch(() => {
				alertError('Не удалось отменить приём');
			});
	};

	const isPastDate = useMemo(() => {
		return !(reception !== undefined && moment(reception.date_time).isSameOrAfter(new Date(), 'day'));
	}, [reception]);

	const disabledActionButton =
		cancelReception.isLoading ||
		confirmReception.isLoading ||
		checkoutReception.isLoading ||
		isFetching ||
		isPastDate;

	return (
		<>
			<DialogSimpleTemplate
				isOpen={isOpen}
				onClose={onClose}
				header={<>Информация о приеме</>}
				maxWidth="md"
				contentPadding={false}
			>
				{isError ? (
					<div className="p-20">
						<ErrorMessage />
					</div>
				) : isLoading ? (
					<div className="p-20">
						<FuseLoading />
					</div>
				) : (
					<div className="grid sm:grid-cols-2 gap-16">
						<div className="p-20">
							<dl className="grid grid-cols-2 gap-16 items-center mb-16">
								<dt className="font-bold">Статус:</dt>
								<dd>
									<BlockReceptionStatus status={reception.status} />
								</dd>
								<dt className="font-bold">Дата и время:</dt>
								<dd>{moment(reception.date_time).format('DD MMMM YYYY, HH:mm')}</dd>
								<dt className="font-bold">Длительность:</dt>
								<dd>{reception.service.doctor.duration} минут</dd>
								<dt className="font-bold">Направление:</dt>
								<dd>{reception.service?.direction?.name}</dd>
								<dt className="font-bold">Менеджер колл-центра:</dt>
								<dd>{!callManagerLoading && getFullName(call_manager)}</dd>
								<dt className="font-bold">Врач:</dt>
								<dd>
									<span>{getFullName(reception.service.doctor)} </span>
								</dd>
								<dt className="font-bold">Услуга:</dt>
								<dd>{reception.service.name}</dd>
								<dt className="font-bold">Стоимость:</dt>
								<dd>{numberFormat.currency(reception.service.cost)} ₸</dd>
								<dt className="font-bold">Пациент:</dt>
								<dd>
									<span>{getFullName(reception.patient)} </span>
								</dd>
								<dt className="font-bold">Телефон:</dt>
								<dd>
									{patientsService.getPatientMainPhone(reception.patient)}
									<CallButton phoneNumber={patientsService.getPatientMainPhone(reception.patient)} />
								</dd>
								<dt className="font-bold">ИИН:</dt>
								<dd>{reception.patient.iin}</dd>
								<dt className="font-bold">Комментарий:</dt>
								<dd>{reception.comment}</dd>
							</dl>

							{(isReceptionAppointed || isReceptionConfirmed || isReceptionCash) && (
								<>
									{isReceptionAppointed && (
										<Button
											fullWidth
											textNormal
											customColor="accent"
											disabled={disabledActionButton}
											onClick={handleOnConfirmReception}
										>
											Подтвердить прием
										</Button>
									)}
									{isReceptionConfirmed && (
										<Button
											fullWidth
											textNormal
											customColor="primary"
											disabled={disabledActionButton}
											onClick={handleOnCheckoutReception}
										>
											Отправить на кассу
										</Button>
									)}

									<div className="grid grid-cols-2 gap-10 mt-10">
										<Button
											fullWidth
											textNormal
											disabled={disabledActionButton}
											onClick={() => setIsShowModalReceive(true)}
										>
											Изменить прием
										</Button>
										<Button
											fullWidth
											textNormal
											customColor="secondary"
											variant="outlined"
											disabled={disabledActionButton}
											onClick={() =>
												openModalConfirm({
													title: 'Отменить прием?',
													onSuccess: handleOnCancelReception
												})
											}
										>
											Отменить прием
										</Button>
									</div>
								</>
							)}

							<div className="grid grid-cols-2 gap-10 mt-10 mb-10">
								<Button
									fullWidth
									textNormal
									variant="outlined"
									onClick={() =>
										modalPromise.open(({ onClose: onCloseModalTask }) => (
											<ModalTask
												isOpen
												onClose={onCloseModalTask}
												initialValues={{
													reception: reception.uuid,
													patient: reception.patient.uuid
												}}
											/>
										))
									}
								>
									Добавить задачу
								</Button>
								<GuardCheckPermission permission={PERMISSION.DOCUMENTS.ADD_DOCUMENT_CONTRACT}>
									{() => (
										<Button
											textNormal
											fullWidth
											variant="outlined"
											onClick={() => {
												modalPromise.open(({ onClose: onCloseModalDocument }) => (
													<ModalDocumentContract
														onClose={onCloseModalDocument}
														isOpen
														receptionUuid={reception.uuid}
													/>
												));
											}}
										>
											Добавить документ
										</Button>
									)}
								</GuardCheckPermission>
							</div>
						</div>

						<div className="p-20 border-solid border-l-1 border-gray-300">
							<div className="mb-20">
								<ListTasks receptionUuid={receptionUuid} />
							</div>
							<GuardCheckPermission permission={PERMISSION.DOCUMENTS.VIEW_DOCUMENT_CONTRACT}>
								{() => (
									<div className="mb-20">
										<ListDocuments receptionUuid={receptionUuid} />
									</div>
								)}
							</GuardCheckPermission>
						</div>
					</div>
				)}
			</DialogSimpleTemplate>

			{isShowModalReceive && (
				<ModalReceive
					isOpen
					onClose={() => setIsShowModalReceive(false)}
					receptionUuid={receptionUuid}
					onUpdate={() => refetch()}
				/>
			)}
		</>
	);
}
ModalAppointmentInfo.defaultProps = {
	onUpdate: () => {}
};
ModalAppointmentInfo.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	receptionUuid: PropTypes.string.isRequired,
	onUpdate: PropTypes.func
};
