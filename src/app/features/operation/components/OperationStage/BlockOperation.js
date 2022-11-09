import React from 'react';
import PropTypes from 'prop-types';
import { Typography, useTheme } from '@material-ui/core';
import { useQuery } from 'react-query';
import moment from 'moment';
import clsx from 'clsx';
import { Amount, Card } from '../../../../bizKITUi';
import { ENTITY, operationService } from '../../../../services';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { getFullName } from '../../../../utils';
import { modalPromise } from '../../../../common/ModalPromise';
import { ModalCommonReception } from '../../../../common/ModalCommonReception';
import {
	OPERATION_STATUS_CANCELED,
	OPERATION_STATUS_COMPLETED,
	OPERATION_STATUS_IN_PROGRESS
} from '../../../../services/operation/constants';

export function BlockOperation({ operationUuid }) {
	const theme = useTheme();

	const { isLoading, isError, data } = useQuery([ENTITY.OPERATION, operationUuid], ({ queryKey }) =>
		operationService.getOperation(queryKey[1])
	);

	if (isError) {
		return <ErrorMessage />;
	}
	if (isLoading) {
		return <FuseLoading />;
	}
	return (
		<Card
			height={110}
			color={theme.palette.warning.main}
			leftTop={
				<>
					<Typography color="secondary" className="mb-6 font-bold">
						{data.service.name}
					</Typography>
					<Typography color="secondary">{getFullName(data.patient)}</Typography>
				</>
			}
			leftBottom={
				<div className="flex items-center">
					<Typography color="secondary">{moment(data.date_time).format('DD.MM.YYYY')}</Typography>

					<Typography
						color="secondary"
						className={clsx('ml-6 text-11', {
							'text-success': data.status === OPERATION_STATUS_COMPLETED,
							'text-error': data.status === OPERATION_STATUS_CANCELED,
							'text-primary': data.status === OPERATION_STATUS_IN_PROGRESS
						})}
					>
						{operationService.getOperationStatus(data.status)?.name}
					</Typography>
				</div>
			}
			rightTop={
				<div className="flex items-center">
					<Typography color="secondary" className="font-bold">
						<Amount value={data.service.cost} />
					</Typography>
				</div>
			}
			onClick={() =>
				modalPromise.open(({ onClose }) => (
					<ModalCommonReception isOpen operationUuid={operationUuid} onClose={onClose} />
				))
			}
		/>
	);
}
BlockOperation.propTypes = {
	operationUuid: PropTypes.string.isRequired
};
