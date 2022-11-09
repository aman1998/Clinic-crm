import React from 'react';
import { useQuery } from 'react-query';
import PropTypes from 'prop-types';
import { Skeleton } from '@material-ui/lab';
import { Button } from '../../../../bizKITUi';
import { ENTITY, tasksService } from '../../../../services';
import { modalPromise } from '../../../../common/ModalPromise';
import { ModalPatientTasks } from './ModalPatientTasks';

export function ButtonPatientTasks({ patientUuid }) {
	const { data, isLoading } = useQuery([ENTITY.TASK, { patient: patientUuid, limit: 0 }], ({ queryKey }) =>
		tasksService.getTasks(queryKey[1])
	);

	if (isLoading) {
		return <Skeleton variant="text" width={100} height={36} />;
	}
	return (
		<Button
			variant="text"
			textNormal
			onClick={() =>
				modalPromise.open(({ onClose }) => (
					<ModalPatientTasks isOpen patientUuid={patientUuid} onClose={onClose} />
				))
			}
		>
			Задачи({data?.count})
		</Button>
	);
}
ButtonPatientTasks.propTypes = {
	patientUuid: PropTypes.string.isRequired
};
