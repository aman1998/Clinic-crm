import React from 'react';
import PropTypes from 'prop-types';
import { Typography, useTheme } from '@material-ui/core';
import { useQuery } from 'react-query';
import moment from 'moment';
import { Button, Card, Amount } from '../../../../bizKITUi';
import { modalPromise } from '../../../../common/ModalPromise';
import { ModalReceive } from '../../../../common/ModalReceive';
import { clinicService, ENTITY } from '../../../../services';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { ModalAppointmentInfo } from '../../../../common/ModalAppointmentInfo';
import { getFullName } from '../../../../utils';
import { BlockReceptionStatus } from '../../../../common/BlockReceptionStatus';

function CardReception({ reception }) {
	const theme = useTheme();

	return (
		<Card
			height={110}
			color={theme.palette.warning.main}
			leftTop={
				<>
					<Typography color="secondary" className="mb-6 font-bold">
						{reception.service.name}
					</Typography>
					<Typography color="secondary">{getFullName(reception.patient)}</Typography>
				</>
			}
			leftBottom={
				<div className="flex items-center">
					<Typography color="secondary">{moment(reception.date_time).format('DD.MM.YYYY')}</Typography>

					<div className="flex items-center ml-6 text-12">
						<BlockReceptionStatus
							status={reception.status}
							text={moment(reception.date_time).format('HH:mm')}
						/>

						<Typography color="secondary" className="ml-6 text-11">
							{clinicService.getReceptionStatusByStatus(reception.status)?.name}
						</Typography>
					</div>
				</div>
			}
			rightTop={
				<div className="flex items-center">
					<Typography color="secondary" className="font-bold">
						<Amount value={reception.service.cost} />
					</Typography>
				</div>
			}
			onClick={() =>
				modalPromise.open(({ onClose }) => (
					<ModalAppointmentInfo isOpen receptionUuid={reception.uuid} onClose={onClose} />
				))
			}
		/>
	);
}
CardReception.propTypes = {
	reception: PropTypes.shape({
		uuid: PropTypes.string.isRequired,
		date_time: PropTypes.string.isRequired,
		status: PropTypes.string.isRequired,
		service: PropTypes.shape({
			name: PropTypes.string.isRequired,
			cost: PropTypes.number.isRequired
		}).isRequired,
		patient: PropTypes.shape({
			last_name: PropTypes.string.isRequired,
			first_name: PropTypes.string.isRequired,
			middle_name: PropTypes.string.isRequired
		}).isRequired
	}).isRequired
};

export function BlockReceptions({ stageUuid, disabled, isShowReceptions, initialReceptionUuid }) {
	const { isLoading: isLoadingReceptions, isError: isErrorReceptions, data: receptions } = useQuery(
		[ENTITY.CLINIC_RECEPTION, { stage: stageUuid, limit: Number.MAX_SAFE_INTEGER }],
		({ queryKey }) => clinicService.getReceptions(queryKey[1]),
		{ enabled: isShowReceptions }
	);

	const { isError: isErrorInitialReception, data: initialReception } = useQuery(
		[ENTITY.CLINIC_RECEPTION, initialReceptionUuid],
		({ queryKey }) => clinicService.getReceptionById(queryKey[1]).then(({ data }) => data),
		{ enabled: !!initialReceptionUuid }
	);

	return (
		<>
			<div className="flex justify-between items-center">
				<Typography color="secondary" className="text-16 font-bold">
					Приемы
				</Typography>

				{isShowReceptions && (
					<Button
						variant="outlined"
						textNormal
						disabled={disabled}
						onClick={() =>
							modalPromise.open(({ onClose }) => (
								<ModalReceive isOpen operationStageUuid={stageUuid} onClose={onClose} />
							))
						}
					>
						Новый прием
					</Button>
				)}
			</div>

			{initialReception && (
				<div className="mt-10 text-md">
					{isErrorInitialReception ? (
						<ErrorMessage message="Не удалось загрузить первичный прием" />
					) : (
						<CardReception reception={initialReception} />
					)}
				</div>
			)}

			{isErrorReceptions ? (
				<ErrorMessage />
			) : isLoadingReceptions ? (
				<FuseLoading />
			) : (
				receptions?.results.map(reception => (
					<div key={reception.uuid} className="mt-10 text-md">
						<CardReception reception={reception} />
					</div>
				))
			)}
		</>
	);
}
BlockReceptions.defaultProps = {
	initialReceptionUuid: null
};
BlockReceptions.propTypes = {
	stageUuid: PropTypes.string.isRequired,
	disabled: PropTypes.bool.isRequired,
	isShowReceptions: PropTypes.bool.isRequired,
	initialReceptionUuid: PropTypes.string
};
