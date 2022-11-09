import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import { useMutation, useQuery } from 'react-query';
import { CustomFields } from '../CustomFields';
import { clinicService, ENTITY } from '../../../../services';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { useAlert } from '../../../../hooks';

export function FormServiceCustomFields({ serviceUuid }) {
	const { alertSuccess, alertError } = useAlert();

	const { isLoading, isError, data } = useQuery([ENTITY.SERVICE, serviceUuid], ({ queryKey }) =>
		clinicService.getServiceById(queryKey[1])
	);

	const save = useMutation(({ uuid, payload }) => clinicService.patchClinicService(uuid, payload));
	const handleOnSave = fields => {
		if (save.isLoading) {
			return;
		}

		save.mutateAsync({ uuid: serviceUuid, payload: fields })
			.then(() => alertSuccess('Поля успешно сохранены'))
			.catch(() => alertError('Не удалось сохранить поля'));
	};

	if (isLoading) {
		return <FuseLoading />;
	}
	if (isError) {
		return <ErrorMessage />;
	}
	return (
		<CustomFields
			initialValues={data.custom_fields?.sections ?? []}
			title={
				<Typography color="secondary" variant="body1">
					Вопросы в анкете осмотра
				</Typography>
			}
			onSave={handleOnSave}
		/>
	);
}
FormServiceCustomFields.propTypes = {
	serviceUuid: PropTypes.string.isRequired
};
