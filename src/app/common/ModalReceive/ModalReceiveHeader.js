import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import moment from 'moment';
import { Typography } from '@material-ui/core';
import { ErrorMessage } from '../ErrorMessage';
import { Button } from '../../bizKITUi';
import { telephonyService, ENTITY } from '../../services';
import { CALL_TYPE_IN, CALL_TYPE_OUT } from '../../services/telephony/constants';
import { CallStatusIndicator } from '../CallStatusIndicator';
import { modalPromise } from '../ModalPromise';
import { ModalPatientCallsHistory } from '../ModalPatientCallsHistory';

export function ModalReceiveHeader({ title, callType, phoneNumber }) {
	const { isLoading, isError, data } = useQuery(
		[ENTITY.CALL, { patient: phoneNumber, limit: 4, offset: 0 }],
		({ queryKey }) => telephonyService.getCalls(queryKey[1]),
		{ enabled: !!phoneNumber }
	);

	const handleOnOpenCallHistory = () => {
		modalPromise.open(({ onClose }) => (
			<ModalPatientCallsHistory isOpen patientPhone={phoneNumber} onClose={onClose} />
		));
	};

	return (
		<div className="flex justify-between">
			<div className="flex flex-col items-start justify-center">
				<Typography variant="h6" component="h2">
					{title}
				</Typography>
				{callType === CALL_TYPE_IN && <Typography variant="subtitle2">Входящий звонок</Typography>}
				{callType === CALL_TYPE_OUT && <Typography variant="subtitle2">Исходящий звонок</Typography>}
			</div>
			{phoneNumber && !isLoading && (
				<>
					<div className="grid grid-cols-2 col-gap-56">
						{isError ? (
							<div className="text-xs">
								<ErrorMessage message="Не удалось загрузить историю звонов" />
							</div>
						) : (
							data.results.map(item => (
								<Typography key={item.uuid}>
									<CallStatusIndicator type={item.type} status={item.status} iconSize="xs" iconOnly />
									<span className="ml-8">
										{moment(item.start_date_time).format('HH:mm — ddd, DD MMMM YYYY')}
									</span>
								</Typography>
							))
						)}
					</div>
					<Button onClick={handleOnOpenCallHistory} textNormal variant="outlined">
						История звонков
					</Button>
				</>
			)}
		</div>
	);
}
ModalReceiveHeader.defaultProps = {
	onOpenCallHistory: () => {}
};
ModalReceiveHeader.propTypes = {
	title: PropTypes.string.isRequired,
	patientUuid: PropTypes.string,
	callType: PropTypes.oneOf([CALL_TYPE_IN, CALL_TYPE_OUT])
};
