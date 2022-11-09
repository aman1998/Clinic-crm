import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { DialogSimpleTemplate, Button } from '../../../../bizKITUi';
import { ModalReserve } from '../../../../common/ModalReserve';
import { clinicService, ENTITY, ENTITY_DEPS, patientsService } from '../../../../services';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { useConfirm, useAlert } from '../../../../hooks';
import { ModalReceive } from '../../../../common/ModalReceive';
import { ErrorMessage } from '../../../../common/ErrorMessage';

export function ModalInfoReserve({ isOpen, onClose, uuid, onUpdate }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();
	const [openModalConfirm] = useConfirm();

	const [isRemoved, setIsRemoved] = useState(false);

	const { isLoading, isError, data } = useQuery(
		[ENTITY.RESERVE, uuid],
		() => clinicService.getReserveByUuid(uuid).then(res => res.data),
		{ enabled: !isRemoved }
	);

	const [isShowModalReserve, setIsShowModalReserve] = useState(false);

	const removeReserve = useMutation(reserveUuid => clinicService.removeReserveByUuid(reserveUuid));
	const handleOnCancelReserve = () => {
		removeReserve
			.mutateAsync(uuid)
			.then(() => {
				onUpdate();
				setIsRemoved(true);
				alertSuccess('Резерв успешно отменён');
			})
			.catch(() => {
				alertError('Не удалось отменить резерв');
			});
	};

	const [isShowModalReceive, setIsShowModalReceive] = useState(false);
	const handleOnCreateReception = () => {
		if (isRemoved) {
			return;
		}

		removeReserve
			.mutateAsync(uuid)
			.then(() => {
				setIsRemoved(true);
				onUpdate();
			})
			.catch(() => alertError('После создания не удалось отменить резерв'));
	};
	useEffect(() => {
		ENTITY_DEPS.RESERVE.forEach(dep => {
			queryClient.invalidateQueries(dep);
		});
	}, [queryClient, isRemoved]);

	return (
		<>
			<DialogSimpleTemplate isOpen={isOpen} onClose={onClose} header={<>Информация о резерве</>} maxWidth="xs">
				{isLoading ? (
					<FuseLoading />
				) : isError ? (
					<ErrorMessage />
				) : (
					<>
						<dl className="grid grid-cols-2 gap-16">
							<dt className="font-bold">Направление::</dt>
							<dd>{data.service.direction.name}</dd>
							<dt className="font-bold">Врач:</dt>
							<dd>
								<span>{data.service.doctor.last_name} </span>
								<span>{data.service.doctor.first_name} </span>
								<span>{data.service.doctor.middle_name}</span>
							</dd>
							<dt className="font-bold">Услуга:</dt>
							<dd>{data.service.name}</dd>
							<dt className="font-bold">Пациент:</dt>
							<dd>
								<span>{data.patient.last_name} </span>
								<span>{data.patient.first_name} </span>
								<span>{data.patient.middle_name}</span>
							</dd>
							<dt className="font-bold">Телефон:</dt>
							<dd>{patientsService.getPatientMainPhone(data.patient)}</dd>
							<dt className="font-bold">ИИН:</dt>
							<dd>{data.patient.iin}</dd>
							<dt className="font-bold">Приоритет:</dt>
							<dd>{clinicService.getPriorityNameByType(data.priority)}</dd>
							<dt className="font-bold">Комментарий:</dt>
							<dd>{data.comment}</dd>
						</dl>

						<div className="mt-16">
							{!isRemoved && (
								<>
									<Button
										fullWidth
										textNormal
										customColor="primary"
										disabled={removeReserve.isLoading}
										onClick={() => setIsShowModalReceive(true)}
									>
										Назначить прием
									</Button>

									<div className="grid grid-cols-2 gap-10 mt-10">
										<Button
											fullWidth
											textNormal
											disabled={removeReserve.isLoading}
											onClick={() => setIsShowModalReserve(true)}
										>
											Изменить резерв
										</Button>
										<Button
											fullWidth
											textNormal
											customColor="secondary"
											variant="outlined"
											disabled={removeReserve.isLoading}
											onClick={() =>
												openModalConfirm({
													title: 'Отменить резерв?',
													onSuccess: handleOnCancelReserve
												})
											}
										>
											Отменить резерв
										</Button>
									</div>
								</>
							)}
						</div>
					</>
				)}
			</DialogSimpleTemplate>

			{isShowModalReserve && (
				<ModalReserve
					isOpen
					onClose={() => setIsShowModalReserve(false)}
					reserveUuid={uuid}
					onUpdate={onUpdate}
				/>
			)}

			{isShowModalReceive && (
				<ModalReceive
					isOpen
					initialValues={{
						patient: data.patient.uuid,
						service: data.service.uuid,
						doctor: data.service.doctor.uuid,
						direction: data.service.direction.uuid
					}}
					onCreate={handleOnCreateReception}
					onClose={() => setIsShowModalReceive(false)}
				/>
			)}
		</>
	);
}
ModalInfoReserve.defaultProps = {
	onUpdate: () => {}
};
ModalInfoReserve.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	uuid: PropTypes.string.isRequired,
	onUpdate: PropTypes.func
};
