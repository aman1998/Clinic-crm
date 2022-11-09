import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import CardContent from '@material-ui/core/CardContent';
import { useMutation, useQueryClient } from 'react-query';
import { Controller, useForm } from 'react-hook-form';
import Grid from '@material-ui/core/Grid';
import { useAlert } from '../../../../hooks/useAlert';
import { clinicService, ENTITY_DEPS } from '../../../../services';
import { defaults } from '../../../../utils';
import { TextField, Button } from '../../../../bizKITUi';

const defaultValues = {
	clinic_address: '',
	clinic_name: '',
	bin: '',
	bank: '',
	bic: '',
	iic: '',
	head_full_name: '',
	head_position: ''
};

export function FormRequisiteInfo({ requisite, uuid }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	const { control, getValues, reset, errors, setError, clearErrors } = useForm({
		mode: 'onBlur',
		defaultValues
	});

	useEffect(() => {
		if (requisite) reset(defaults(requisite, defaultValues));
	}, [requisite, reset]);

	const { mutateAsync: updateRequisiteInfo, isLoading: isLoadingUpdateRequisiteInfo } = useMutation(payload =>
		clinicService.updateRequisiteInfo(payload, uuid)
	);
	const { mutateAsync: createContactInfo, isLoading: isLoadingCreateRequisiteInfo } = useMutation(payload =>
		clinicService.createRequisiteInfo(payload)
	);
	const handleSubmit = event => {
		event.preventDefault();
		clearErrors();

		if (requisite) {
			updateRequisiteInfo(getValues())
				.then(data => {
					queryClient.setQueryData(ENTITY_DEPS.CLINIC_REQUISITE, data);
					alertSuccess('Информация о реквизитых сохранена');
				})
				.catch(error => {
					error?.fieldErrors?.forEach(item => {
						setError(item.field, { message: item.message });
					});
					alertError('Не удалось изменить информацию');
				});
		} else {
			createContactInfo(getValues())
				.then(data => {
					queryClient.setQueryData(ENTITY_DEPS.CLINIC_REQUISITE, data);
					alertSuccess('Информация о реквизитых сохранена');
				})
				.catch(error => {
					error?.fieldErrors?.forEach(item => {
						setError(item.field, { message: item.message });
					});
					alertError('Не удалось изменить информацию');
				});
		}
	};

	return (
		<Card>
			<CardHeader
				title={
					<Typography color="secondary" variant="body1">
						Реквизиты
					</Typography>
				}
			/>
			<Divider />
			<CardContent>
				<form onSubmit={handleSubmit}>
					<Controller
						as={<TextField />}
						control={control}
						variant="outlined"
						label="Юридичекое наименование"
						name="clinic_name"
						fullWidth
						margin="normal"
						error={!!errors.clinic_name}
						helperText={errors.clinic_name?.message}
					/>
					<Controller
						as={<TextField />}
						control={control}
						variant="outlined"
						label="Юридичекий адрес"
						name="clinic_address"
						fullWidth
						margin="normal"
						error={!!errors.clinic_address}
						helperText={errors.clinic_address?.message}
					/>
					<Controller
						as={<TextField />}
						control={control}
						variant="outlined"
						label="БИН"
						name="bin"
						fullWidth
						margin="normal"
						error={!!errors.bin}
						helperText={errors.bin?.message}
					/>
					<Grid container spacing={2}>
						<Grid item md={6} xs={12}>
							<Controller
								as={<TextField />}
								control={control}
								variant="outlined"
								label="Банк"
								name="bank"
								fullWidth
								margin="normal"
								error={!!errors.bank}
								helperText={errors.bank?.message}
							/>
						</Grid>
						<Grid item md={6} xs={12}>
							<Controller
								as={<TextField />}
								control={control}
								variant="outlined"
								label="БИК"
								name="bic"
								fullWidth
								margin="normal"
								error={!!errors.bic}
								helperText={errors.bic?.message}
							/>
						</Grid>
					</Grid>
					<Controller
						as={<TextField />}
						control={control}
						variant="outlined"
						label="ИИК"
						name="iic"
						fullWidth
						margin="normal"
						error={!!errors.iic}
						helperText={errors.iic?.message}
					/>
					<Controller
						as={<TextField />}
						control={control}
						variant="outlined"
						label="Должность руководителя"
						name="head_position"
						fullWidth
						margin="normal"
						error={!!errors.head_position}
						helperText={errors.head_position?.message}
					/>
					<Controller
						as={<TextField />}
						control={control}
						variant="outlined"
						label="ФИО руководителя"
						name="head_full_name"
						fullWidth
						margin="normal"
						error={!!errors.head_full_name}
						helperText={errors.head_full_name?.message}
					/>

					<Button
						disabled={isLoadingUpdateRequisiteInfo || isLoadingCreateRequisiteInfo}
						type="submit"
						className="mt-16"
						textNormal
					>
						Сохранить
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}

FormRequisiteInfo.propTypes = {
	requisite: PropTypes.shape({
		clinic_address: PropTypes.string,
		clinic_name: PropTypes.string,
		bin: PropTypes.string,
		bank: PropTypes.string,
		bic: PropTypes.string,
		iic: PropTypes.string,
		head_full_name: PropTypes.string,
		head_position: PropTypes.string
	}).isRequired,
	uuid: PropTypes.string.isRequired
};
