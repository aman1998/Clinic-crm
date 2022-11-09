import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import { MenuItem, Typography } from '@material-ui/core';
import { Button, TextField, DrawerTemplate } from '../../bizKITUi';
import { removeEmptyValuesFromObject } from '../../utils';
import { useAlert } from '../../hooks';
import {
	FINANCE_STATE_TYPE_COMING,
	FINANCE_STATE_TYPE_MOVING,
	FINANCE_STATE_TYPE_SPENDING,
	COUNTERPARTY_TYPE_PATIENT,
	COUNTERPARTY_TYPE_DOCTOR,
	COUNTERPARTY_TYPE_PARTNER,
	COUNTERPARTY_TYPE_MONEY_ACCOUNT
} from '../../services/finance/constants';
import { ENTITY, ENTITY_DEPS, financeService } from '../../services';
import { ErrorMessage } from '../ErrorMessage';
import { useUniqueId } from '../../hooks/useUniqueId/useUniqueId';

const defaultValues = {
	name: '',
	type: '',
	counterparty_type: ''
};

export function ModalFinanceState({ isOpen, financeStateUuid, onClose, initialFields }) {
	const queryClient = useQueryClient();
	const uniqueIdForm = useUniqueId();
	const { alertSuccess, alertError } = useAlert();

	const { control, errors, getValues, setError, reset, watch } = useForm({
		mode: 'onBlur',
		defaultValues: {
			...defaultValues,
			...removeEmptyValuesFromObject(initialFields)
		}
	});
	const watchFields = watch(['type', 'counterparty_type']);

	const { isLoading, isError, data: financeState } = useQuery([ENTITY.FINANCE_STATE, financeStateUuid], () => {
		if (financeStateUuid) {
			return financeService.getFinanceStateByUuid(financeStateUuid).then(({ data }) => data);
		}
		return Promise.resolve();
	});
	useEffect(() => {
		reset(financeState);
	}, [financeState, reset]);

	const financeStateTypeList = useMemo(() => {
		const list = financeService.getFinanceStateTypeList();

		if (
			[COUNTERPARTY_TYPE_PATIENT, COUNTERPARTY_TYPE_DOCTOR, COUNTERPARTY_TYPE_PARTNER].includes(
				watchFields.counterparty_type
			)
		) {
			return list.filter(item => item.type !== FINANCE_STATE_TYPE_MOVING);
		}

		if (watchFields.counterparty_type === COUNTERPARTY_TYPE_MONEY_ACCOUNT) {
			return list.filter(item => item.type === FINANCE_STATE_TYPE_MOVING);
		}

		return list;
	}, [watchFields.counterparty_type]);
	const counterpartyTypeList = useMemo(() => {
		const list = financeService.getCounterpartyTypeList();

		if ([FINANCE_STATE_TYPE_COMING, FINANCE_STATE_TYPE_SPENDING].includes(watchFields.type)) {
			return list.filter(item => item.type !== COUNTERPARTY_TYPE_MONEY_ACCOUNT);
		}

		if (watchFields.type === FINANCE_STATE_TYPE_MOVING) {
			return list.filter(item => item.type === COUNTERPARTY_TYPE_MONEY_ACCOUNT);
		}

		return list;
	}, [watchFields.type]);

	const createFinanceState = useMutation(payload => financeService.createFinanceState(payload));
	const handleOnCreateFinanceState = event => {
		event.preventDefault();

		const fields = getValues();
		createFinanceState
			.mutateAsync(fields)
			.then(() => {
				ENTITY_DEPS.FINANCE_STATE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Новая статья кассовых операций успешно создана');
				onClose();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать новую статью кассовых операций');
			});
	};

	const updateFinanceState = useMutation(({ uuid, payload }) => financeService.updateFinanceState(uuid, payload));
	const handleOnUpdateFinanceState = event => {
		event.preventDefault();

		const fields = getValues();
		updateFinanceState
			.mutateAsync({ uuid: financeStateUuid, payload: fields })
			.then(() => {
				ENTITY_DEPS.FINANCE_STATE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Статья кассовых операций успешно обновлена');
				onClose();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось обновить статью кассовых операций');
			});
	};

	const title = financeStateUuid ? 'Изменение статьи кассовых операций' : 'Новая статья кассовых операций';
	const action = financeStateUuid ? handleOnUpdateFinanceState : handleOnCreateFinanceState;
	const isPending = financeStateUuid ? updateFinanceState.isLoading : createFinanceState.isLoading;

	return (
		<>
			<DrawerTemplate
				isOpen={isOpen}
				close={onClose}
				width="sm"
				isLoading={isLoading}
				header={
					<Typography color="secondary" className="text-xl font-bold text-center">
						{title}
					</Typography>
				}
				content={
					isError ? (
						<ErrorMessage />
					) : (
						<form id={uniqueIdForm} onSubmit={action}>
							<div className="mb-24">
								<Controller
									as={<TextField />}
									control={control}
									fullWidth
									label="Наименование статьи"
									name="name"
									type="text"
									variant="outlined"
									error={!!errors.name}
									helperText={errors.name?.message}
								/>
							</div>

							<div className="mb-24">
								<Controller
									as={<TextField />}
									control={control}
									fullWidth
									label="Тип статьи"
									name="type"
									type="text"
									variant="outlined"
									select
									error={!!errors.type}
									helperText={errors.type?.message}
								>
									<MenuItem value="">Все</MenuItem>
									{financeStateTypeList.map(item => (
										<MenuItem key={item.type} value={item.type}>
											{item.name}
										</MenuItem>
									))}
								</Controller>
							</div>

							<div className="mb-24">
								<Controller
									as={<TextField />}
									control={control}
									fullWidth
									label="Тип контрагента"
									name="counterparty_type"
									type="text"
									variant="outlined"
									select
									error={!!errors.counterparty_type}
									helperText={errors.counterparty_type?.message}
								>
									<MenuItem value="">Все</MenuItem>
									{counterpartyTypeList.map(item => (
										<MenuItem key={item.type} value={item.type}>
											{item.name}
										</MenuItem>
									))}
								</Controller>
							</div>
						</form>
					)
				}
				footer={
					!isError && (
						<Button
							form={uniqueIdForm}
							variant="contained"
							color="primary"
							disabled={isPending}
							textNormal
							type="submit"
						>
							Сохранить
						</Button>
					)
				}
			/>
		</>
	);
}
ModalFinanceState.defaultProps = {
	initialFields: {},
	financeStateUuid: null
};
ModalFinanceState.propTypes = {
	initialFields: PropTypes.shape({
		name: PropTypes.string,
		type: PropTypes.oneOf(financeService.getFinanceStateTypeList().map(item => item.type)),
		counterparty_type: PropTypes.oneOf(financeService.getCounterpartyTypeList().map(item => item.type))
	}),
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	financeStateUuid: PropTypes.string
};
