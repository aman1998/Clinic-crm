import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Controller, useForm } from 'react-hook-form';
import { Grid, MenuItem, Switch, Typography } from '@material-ui/core';
import { Button, DatePickerField, DrawerTemplate, TextField } from '../../../../bizKITUi';
import { useAlert } from '../../../../hooks';
import {
	PROMOTION_STATUS_ACTIVE,
	PROMOTION_STATUS_COMPLETED,
	PROMOTION_TYPE_CASHBACK,
	PROMOTION_TYPE_DISCOUNT
} from '../../../../services/finance/constants';
import { ENTITY, ENTITY_DEPS, financeService } from '../../../../services';
import { TableServices } from './TableServices';
import { defaults } from '../../../../utils';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { normalizeNumberType } from '../../../../utils/normalizeNumber';

const defaultValues = {
	name: '',
	type: PROMOTION_TYPE_CASHBACK,
	status: '',
	date_time_start: null,
	date_time_end: null,
	accrual_percent: '',
	write_off_percent: '',
	write_off_limit: '',
	services: []
};

export function ModalPromotion({ promotionUuid, isOpen, onClose }) {
	const { alertSuccess, alertError } = useAlert();
	const queryClient = useQueryClient();

	const [currentPromotionUuid, setCurrentPromotionUuid] = useState(promotionUuid);
	const [showSpecialCases, setShowSpecialCases] = useState(false);

	const { setError, errors, control, clearErrors, getValues, watch, reset } = useForm({
		mode: 'onBlur',
		defaultValues
	});
	const watchFields = watch(['type']);

	const { isLoading, isError, data } = useQuery(
		[ENTITY.PROMOTION, currentPromotionUuid],
		() => financeService.getPromotion(currentPromotionUuid),
		{ enabled: !!currentPromotionUuid }
	);

	useEffect(() => {
		if (!data) {
			return;
		}
		if (data.services?.length > 0) {
			setShowSpecialCases(true);
		}
		reset(defaults(data, defaultValues));
	}, [data, reset]);

	const createPromotion = useMutation(payload => financeService.createPromotion(payload));
	const handleCreate = () => {
		const values = getValues();
		const payload = { ...values, services: showSpecialCases ? values.services.map(item => item.uuid) : [] };
		createPromotion
			.mutateAsync(payload)
			.then(({ data: results }) => {
				ENTITY_DEPS.PROMOTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				clearErrors();
				setCurrentPromotionUuid(results.uuid);
				alertSuccess('Акция успешно создана');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});
				alertError(error.userMessage || 'Не удалось создать акцию');
			});
	};

	const updatePromotion = useMutation(({ uuid, payload }) => financeService.updatePromotion(uuid, payload));
	const handleUpdate = () => {
		const values = getValues();
		const payload = { ...values, services: showSpecialCases ? values.services.map(item => item.uuid) : [] };
		updatePromotion
			.mutateAsync({ uuid: currentPromotionUuid, payload })
			.then(() => {
				ENTITY_DEPS.PROMOTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				clearErrors();
				alertSuccess('Акция успешно сохранена');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});
				alertError(error.userMessage || 'Не удалось сохранить акцию');
			});
	};

	const activatePromotion = useMutation(uuid => financeService.activatePromotion(uuid));
	const handleActivate = () => {
		activatePromotion
			.mutateAsync(currentPromotionUuid)
			.then(() => {
				ENTITY_DEPS.PROMOTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				clearErrors();
				alertSuccess('Акция успешно активирована');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});
				alertError(error.userMessage || 'Не удалось активировать акцию');
			});
	};

	const completePromotion = useMutation(uuid => financeService.completePromotion(uuid));
	const handleComplete = () => {
		completePromotion
			.mutateAsync(currentPromotionUuid)
			.then(() => {
				ENTITY_DEPS.PROMOTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				clearErrors();
				alertSuccess('Акция успешно завершена');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});
				alertError(error.userMessage || 'Не удалось завершить акцию');
			});
	};

	const isSomeLoading =
		isLoading ||
		createPromotion.isLoading ||
		updatePromotion.isLoading ||
		activatePromotion.isLoading ||
		completePromotion.isLoading;
	const isActive = data?.status === PROMOTION_STATUS_ACTIVE;
	const isCompleted = data?.status === PROMOTION_STATUS_COMPLETED;

	return (
		<>
			<DrawerTemplate
				isOpen={isOpen}
				close={onClose}
				width="sm"
				isLoading={isLoading}
				header={
					<Typography color="secondary" className="text-xl font-bold text-center">
						{currentPromotionUuid ? 'Редактирование акции' : 'Новая акция'}
					</Typography>
				}
				content={
					isLoading ? (
						<></>
					) : isError ? (
						<ErrorMessage />
					) : (
						<>
							<Grid container spacing={2}>
								<Grid item xs={12}>
									<Controller
										control={control}
										name="name"
										as={
											<TextField
												label="Наименование"
												fullWidth
												margin="none"
												variant="outlined"
												error={!!errors.name}
												helperText={errors.name?.message}
											/>
										}
									/>
								</Grid>
								<Grid item xs={12} md={6}>
									<Controller
										control={control}
										name="type"
										as={
											<TextField
												label="Тип"
												select
												fullWidth
												margin="none"
												variant="outlined"
												InputProps={{ readOnly: !!currentPromotionUuid }}
												error={!!errors.type}
												helperText={errors.type?.message}
											>
												{financeService.getPromotionTypeList().map(item => (
													<MenuItem key={item.type} value={item.type}>
														{item.name}
													</MenuItem>
												))}
											</TextField>
										}
									/>
								</Grid>
								<Grid item xs={12} md={6}>
									<TextField
										label="Статус"
										value={financeService.getPromotionStatusNameByType(data?.status)}
										InputProps={{ readOnly: true }}
										fullWidth
										margin="none"
										variant="outlined"
									/>
								</Grid>
								<Grid item xs={12} md={6}>
									<Controller
										control={control}
										name="date_time_start"
										as={
											<DatePickerField
												label="Дата начала"
												fullWidth
												margin="none"
												variant="outlined"
												error={!!errors.date_time_start}
												helperText={errors.date_time_start?.message}
											/>
										}
									/>
								</Grid>
								<Grid item xs={12} md={6}>
									<Controller
										control={control}
										name="date_time_end"
										as={
											<DatePickerField
												label="Дата окончания"
												fullWidth
												margin="none"
												variant="outlined"
												error={!!errors.date_time_end}
												helperText={errors.date_time_end?.message}
											/>
										}
									/>
								</Grid>
								{watchFields.type === PROMOTION_TYPE_CASHBACK ? (
									<>
										<Grid item xs={12} md={6}>
											<Controller
												control={control}
												name="accrual_percent"
												as={
													<TextField
														label="Процент начисления"
														fullWidth
														margin="none"
														inputProps={{ min: 0, max: 100 }}
														variant="outlined"
														error={!!errors.accrual_percent}
														helperText={errors.accrual_percent?.message}
														onKeyPress={normalizeNumberType}
													/>
												}
											/>
										</Grid>
										<Grid item xs={12} md={6}>
											<Controller
												control={control}
												name="write_off_limit"
												as={
													<TextField
														label="Лимит списания"
														fullWidth
														inputProps={{ min: 0, max: 100 }}
														margin="none"
														variant="outlined"
														error={!!errors.write_off_limit}
														helperText={errors.write_off_limit?.message}
														onKeyPress={normalizeNumberType}
													/>
												}
											/>
										</Grid>
									</>
								) : watchFields.type === PROMOTION_TYPE_DISCOUNT ? (
									<Grid item xs={12} md={6}>
										<Controller
											control={control}
											name="write_off_percent"
											as={
												<TextField
													label="Процент списания"
													fullWidth
													inputProps={{ min: 0, max: 100 }}
													margin="none"
													variant="outlined"
													error={!!errors.write_off_percent}
													helperText={errors.write_off_percent?.message}
													onKeyPress={normalizeNumberType}
												/>
											}
										/>
									</Grid>
								) : null}
							</Grid>

							<div className="flex justify-between items-center my-16">
								<Typography className="font-bold">Использовать в определенных услугах</Typography>
								<Switch
									checked={showSpecialCases}
									onChange={event => setShowSpecialCases(event.target.checked)}
								/>
							</div>

							{showSpecialCases && (
								<Controller
									control={control}
									name="services"
									render={({ value, onChange }) => (
										<TableServices services={value} onChange={onChange} />
									)}
								/>
							)}
						</>
					)
				}
				footer={
					<>
						<Button
							textNormal
							disabled={isSomeLoading}
							onClick={currentPromotionUuid ? handleUpdate : handleCreate}
						>
							Сохранить
						</Button>
						{isActive && (
							<Button
								className="ml-16"
								customColor="secondary"
								textNormal
								disabled={isSomeLoading}
								onClick={handleComplete}
							>
								Завершить акцию
							</Button>
						)}
						{isCompleted && (
							<Button
								className="ml-16"
								customColor="primary"
								textNormal
								disabled={isSomeLoading}
								onClick={handleActivate}
							>
								Включить акцию
							</Button>
						)}
					</>
				}
			/>
		</>
	);
}

ModalPromotion.defaultProps = {
	promotionUuid: null
};

ModalPromotion.propTypes = {
	promotionUuid: PropTypes.string,
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired
};
