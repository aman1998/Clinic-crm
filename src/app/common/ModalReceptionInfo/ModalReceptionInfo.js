import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import moment from 'moment';
import { DialogSimpleTemplate } from '../../bizKITUi';
import FuseLoading from '../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../ErrorMessage';
import { numberFormat } from '../../utils';
import { BlockReceptionStatus } from '../BlockReceptionStatus';
import { clinicService, ENTITY, patientsService } from '../../services';

export function ModalReceptionInfo({ isOpen, onClose, receptionUuid }) {
	const { isLoading, isError, data: reception } = useQuery([ENTITY.CLINIC_RECEPTION, receptionUuid], () => {
		if (receptionUuid) {
			return clinicService.getReceptionById(receptionUuid).then(res => res.data);
		}
		return Promise.reject();
	});

	return (
		<DialogSimpleTemplate isOpen={isOpen} onClose={onClose} header={<>Информация о приеме</>} maxWidth="xs">
			{isLoading ? (
				<FuseLoading />
			) : isError ? (
				<ErrorMessage />
			) : (
				<dl className="grid grid-cols-2 gap-16">
					<dt className="font-bold">Статус:</dt>
					<dd>
						<BlockReceptionStatus status={reception.status} />
					</dd>
					<dt className="font-bold">Дата и время:</dt>
					<dd>{moment(reception.date_time).format('DD MMMM YYYY, HH:mm')}</dd>
					<dt className="font-bold">Длительность:</dt>
					<dd>{reception.service.doctor.duration} минут</dd>
					<dt className="font-bold">Направление:</dt>
					<dd>{reception.service.direction.name}</dd>
					<dt className="font-bold">Врач:</dt>
					<dd>
						<span>{reception.service.doctor.last_name} </span>
						<span>{reception.service.doctor.first_name} </span>
						<span>{reception.service.doctor.middle_name}</span>
					</dd>
					<dt className="font-bold">Услуга:</dt>
					<dd>{reception.service.name}</dd>
					<dt className="font-bold">Стоимость:</dt>
					<dd>{numberFormat.currency(reception.service.cost)} ₸</dd>
					<dt className="font-bold">Пациент:</dt>
					<dd>
						<span>{reception.patient.last_name} </span>
						<span>{reception.patient.first_name} </span>
						<span>{reception.patient.middle_name}</span>
					</dd>
					<dt className="font-bold">Телефон:</dt>
					<dd>{patientsService.getPatientMainPhone(reception.patient)}</dd>
					<dt className="font-bold">ИИН:</dt>
					<dd>{reception.patient.iin}</dd>
					<dt className="font-bold">Комментарий:</dt>
					<dd>{reception.comment}</dd>
				</dl>
			)}
		</DialogSimpleTemplate>
	);
}
ModalReceptionInfo.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	receptionUuid: PropTypes.string.isRequired
};
