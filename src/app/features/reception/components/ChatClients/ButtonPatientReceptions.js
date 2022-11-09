import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { Skeleton } from '@material-ui/lab';
import { Button } from '../../../../bizKITUi';
import { clinicService, ENTITY } from '../../../../services';
import { modalPromise } from '../../../../common/ModalPromise';
import { ModalPatientReceptions } from './ModalPatientReceptions';

export function ButtonPatientReceptions({ patientUuid }) {
	const { data, isLoading } = useQuery(
		[
			ENTITY.CLINIC_RECEPTION,
			{
				patient_uuid: patientUuid,
				limit: 0
			}
		],
		({ queryKey }) => {
			return clinicService.getReceptions(queryKey[1]);
		}
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
					<ModalPatientReceptions isOpen patientUuid={patientUuid} onClose={onClose} />
				))
			}
		>
			Приемы({data?.count})
		</Button>
	);
}
ButtonPatientReceptions.propTypes = {
	patientUuid: PropTypes.string.isRequired
};
