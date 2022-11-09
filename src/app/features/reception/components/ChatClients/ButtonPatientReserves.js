import React from 'react';
import { useQuery } from 'react-query';
import PropTypes from 'prop-types';
import { Skeleton } from '@material-ui/lab';
import { clinicService, ENTITY } from '../../../../services';
import { Button } from '../../../../bizKITUi';
import { ModalPatientReserves } from './ModalPatientReserves';
import { modalPromise } from '../../../../common/ModalPromise';

export function ButtonPatientReserves({ patientUuid }) {
	const { data, isLoading } = useQuery([ENTITY.RESERVE, { patient: patientUuid, limit: 0 }], ({ queryKey }) =>
		clinicService.getReserves(queryKey[1]).then(res => res.data)
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
					<ModalPatientReserves isOpen patientUuid={patientUuid} onClose={onClose} />
				))
			}
		>
			Резервы({data?.count})
		</Button>
	);
}
ButtonPatientReserves.propTypes = {
	patientUuid: PropTypes.string.isRequired
};
