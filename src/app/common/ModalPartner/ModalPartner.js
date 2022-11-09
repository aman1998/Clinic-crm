import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import { Typography } from '@material-ui/core';
import { Button, TextField, DrawerTemplate, PhoneField } from '../../bizKITUi';
import { ErrorMessage } from '../ErrorMessage';
import { useAlert } from '../../hooks';
import FuseLoading from '../../../@fuse/core/FuseLoading';
import { companiesService, ENTITY, ENTITY_DEPS } from '../../services';
import { defaults } from '../../utils';

const defaultValues = {
	name: '',
	phone: '',
	email: '',
	address: '',
	description: ''
};

export function ModalPartner({ isOpen, partnerUuid, onUpdate, onClose }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	const { control, errors, getValues, setError, reset, clearErrors } = useForm({
		mode: 'onBlur',
		defaultValues
	});

	const { isLoading, isError, data } = useQuery([ENTITY.PARTNER, partnerUuid], () => {
		if (partnerUuid) {
			return companiesService.getPartnerCompany(partnerUuid);
		}
		return Promise.resolve();
	});
	useEffect(() => {
		if (!data) {
			return;
		}

		reset(defaults(data, defaultValues));
	}, [data, reset]);

	const createPartner = useMutation(payload => companiesService.createPartnerCompany(payload));
	const handleOnCreate = () => {
		createPartner
			.mutateAsync(getValues())
			.then(() => {
				alertSuccess('Новый партнёр успешно создан');
				ENTITY_DEPS.PARTNER.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				onUpdate();
				onClose();
				reset(defaultValues);
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать партнёра');
			});
	};

	const updatePartner = useMutation(({ uuid, payload }) => companiesService.updatePartnerCompany(uuid, payload));
	const handleOnUpdate = () => {
		clearErrors();

		updatePartner
			.mutateAsync({ uuid: partnerUuid, payload: getValues() })
			.then(() => {
				alertSuccess('Партнёр успешно изменён');
				ENTITY_DEPS.PARTNER.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				onUpdate();
				onClose();
				reset(defaultValues);
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось изменить партнёра');
			});
	};

	const title = partnerUuid ? 'Изменить партнёра' : 'Новый партнёр';
	const handleAction = partnerUuid ? handleOnUpdate : handleOnCreate;

	return (
		<>
			<DrawerTemplate
				isOpen={isOpen}
				close={onClose}
				width="sm"
				header={
					<Typography color="secondary" className="text-xl font-bold text-center">
						{title}
					</Typography>
				}
				content={
					isLoading ? (
						<FuseLoading />
					) : isError ? (
						<ErrorMessage />
					) : (
						<>
							<Controller
								as={<TextField />}
								control={control}
								fullWidth
								label="Наименование"
								name="name"
								type="text"
								variant="outlined"
								margin="normal"
								error={!!errors.name}
								helperText={errors.name?.message}
							/>

							<Controller
								as={<PhoneField />}
								control={control}
								fullWidth
								label="Телефон"
								name="phone"
								type="text"
								variant="outlined"
								margin="normal"
								error={!!errors.phone}
								helperText={errors.phone?.message}
							/>

							<Controller
								as={<TextField />}
								control={control}
								fullWidth
								label="Email"
								name="email"
								type="text"
								variant="outlined"
								margin="normal"
								error={!!errors.email}
								helperText={errors.email?.message}
							/>

							<Controller
								as={<TextField />}
								control={control}
								fullWidth
								label="Адрес"
								name="address"
								type="text"
								variant="outlined"
								margin="normal"
								error={!!errors.address}
								helperText={errors.address?.message}
							/>

							<Controller
								as={<TextField />}
								control={control}
								fullWidth
								label="Описание"
								name="description"
								type="text"
								variant="outlined"
								margin="normal"
								error={!!errors.description}
								helperText={errors.description?.message}
							/>
						</>
					)
				}
				footer={
					<Button
						variant="contained"
						color="primary"
						disabled={updatePartner.isLoading || createPartner.isLoading}
						textNormal
						onClick={handleAction}
					>
						Сохранить
					</Button>
				}
			/>
		</>
	);
}
ModalPartner.defaultProps = {
	partnerUuid: null,
	onUpdate: () => {}
};
ModalPartner.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	partnerUuid: PropTypes.string,
	onClose: PropTypes.func.isRequired,
	onUpdate: PropTypes.func
};
