import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import moment from 'moment';
import { DialogSimpleTemplate } from '../../bizKITUi';
import FuseLoading from '../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../ErrorMessage';
import { telephonyService } from '../../services/telephony';
import { getFullName } from '../../utils';
import { ENTITY } from '../../services';

export function ModalCallsRecord({ isOpen, onClose, callUuid }) {
	const { isLoading, isError, data } = useQuery([ENTITY.CALL, callUuid], () => {
		if (callUuid) {
			return telephonyService.getCallByUuid(callUuid);
		}
		return Promise.reject();
	});

	return (
		<DialogSimpleTemplate isOpen={isOpen} onClose={onClose} header={<>Запись звонка</>} maxWidth="xs">
			{isLoading ? (
				<FuseLoading />
			) : isError ? (
				<ErrorMessage />
			) : (
				<>
					<dl className="grid grid-cols-2 gap-16">
						<dt className="font-bold">Номер:</dt>
						<dd>{data.client_phone}</dd>
						<dt className="font-bold">Пациент:</dt>
						<dd>{getFullName(data.patient ?? {}) || '—'}</dd>
						<dt className="font-bold">Дата и время:</dt>
						<dd>{moment(data.start_date_time).format('DD MMMM YYYY, HH:mm')}</dd>
						<dt className="font-bold">Тип:</dt>
						<dd>{telephonyService.getCallVariant(data.type, data.status).name}</dd>
						<dt className="font-bold">Менеджер:</dt>
						<dd>{getFullName(data.manager ?? {}) || '—'}</dd>
					</dl>
					{/* eslint-disable-next-line jsx-a11y/media-has-caption */}
					<audio className="mt-16 w-full" controls src={data?.record} />
				</>
			)}
		</DialogSimpleTemplate>
	);
}
ModalCallsRecord.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	callUuid: PropTypes.string.isRequired
};
