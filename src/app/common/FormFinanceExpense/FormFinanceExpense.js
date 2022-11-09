import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import { Grid, Divider, MenuItem } from '@material-ui/core';
import { Controller, useForm } from 'react-hook-form';
import { TextField, Button, DatePickerField, CurrencyTextField, ServerAutocomplete } from '../../bizKITUi';
import FuseLoading from '../../../@fuse/core/FuseLoading';
import { useAlert, usePermissions } from '../../hooks';
import { ModalFinanceState } from '../ModalFinanceState';
import { ModalMoneyAccount } from '../ModalMoneyAccount';
import { ModalPartner } from '../ModalPartner';
import { FINANCE_STATE_TYPE_SPENDING, COUNTERPARTY_TYPE_DOCTOR } from '../../services/finance/constants';
import { TYPE_CATEGORY_CASH } from '../../services/companies/constants';
import { CASHIER_PERMISSIONS } from '../../services/auth/constants';
import { financeService, authService, ENTITY, ENTITY_DEPS, companiesService } from '../../services';
import { ErrorMessage } from '../ErrorMessage';
import { ListReceptionDoctorInDay } from './ListReceptionDoctorInDay';
import { getFullName, removeEmptyValuesFromObject } from '../../utils';
import { FieldCounterpartyAutocomplete } from '../FieldCounterpartyAutocomplete';

import * as globalAuthSelectors from '../../auth/store/selectors/auth';

const defaultValues = {
	value: '',
	state: null,
	money_account: null,
	paid_date_time: null,
	cashier: '',
	counterparty: null,
	description: ''
};

export function FormFinanceExpense({ initialValues, financeActionUuid, onUpdate }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();
	const { hasPermission } = usePermissions();

	const currentUser = useSelector(globalAuthSelectors.currentUser);

	const { control, errors, watch, getValues, setValue, setError, reset, clearErrors } = useForm({
		mode: 'onBlur',
		defaultValues: {
			...defaultValues,
			cashier: hasPermission(CASHIER_PERMISSIONS) ? currentUser.data.uuid : '',
			...removeEmptyValuesFromObject(initialValues)
		}
	});

	const watchFields = watch(['state', 'paid_date_time', 'counterparty']);

	const { data: dataListCashier, isLoading: isLoadingListCashier } = useQuery(
		[
			ENTITY.USER,
			{
				limit: Number.MAX_SAFE_INTEGER,
				permissions: CASHIER_PERMISSIONS
			}
		],
		({ queryKey }) => authService.getUsers(queryKey[1])
	);

	const { isLoading: isLoadingFinanceAction, isError: isErrorFinanceAction, data: dataFinanceAction } = useQuery(
		[ENTITY.FINANCE_ACTION, financeActionUuid],
		() => {
			if (financeActionUuid) {
				return financeService.getFinanceActionByUuid(financeActionUuid).then(res => res.data);
			}
			return Promise.resolve();
		}
	);

	useEffect(() => {
		if (!dataFinanceAction) {
			return;
		}

		reset({
			...defaultValues,
			value: dataFinanceAction.value,
			paid_date_time: dataFinanceAction.paid_date_time,
			state: dataFinanceAction.state.uuid,
			money_account: dataFinanceAction.money_account.uuid,
			cashier: dataFinanceAction.cashier.uuid,
			description: dataFinanceAction.description,
			counterparty: dataFinanceAction.counterparty.uuid
		});
	}, [dataFinanceAction, reset]);

	const selectedStateIsCounterpartyDoctor = watchFields.state?.counterparty_type === COUNTERPARTY_TYPE_DOCTOR;

	const [isShowModalFinanceState, setIsShowModalFinanceState] = useState(false);
	const [isShowModalMoneyAccount, setIsShowModalMoneyAccount] = useState(false);
	const [isShowModalPartner, setIsShowModalPartner] = useState(false);

	const createFinanceAction = useMutation(payload => financeService.createFinanceActions(payload));
	const handleOnCreateFinanceAction = () => {
		clearErrors();

		const fields = getValues();

		const data = {
			...fields,
			state: fields.state?.uuid,
			type: FINANCE_STATE_TYPE_SPENDING
		};

		createFinanceAction
			.mutateAsync(data)
			.then(() => {
				ENTITY_DEPS.FINANCE_ACTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Расходная операция успешно создана');
				reset(defaultValues);
				onUpdate();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать расходную операцию');
			});
	};

	const isLoading = isLoadingListCashier || (financeActionUuid && isLoadingFinanceAction);
	const isError = isErrorFinanceAction;

	const isEditable = !financeActionUuid;

	const isShowListReceptionDoctorInDay =
		selectedStateIsCounterpartyDoctor && watchFields.paid_date_time && watchFields.counterparty;
	const filterForReceptionDoctorInDay = {
		date: new Date(watchFields.paid_date_time),
		doctor: watchFields.counterparty
	};

	return (
		<>
			{isError ? (
				<ErrorMessage />
			) : isLoading ? (
				<div className="p-32">
					<FuseLoading />
				</div>
			) : (
				<>
					<div className="p-32">
						<Controller
							control={control}
							name="value"
							render={({ onChange, onBlur, value }) => (
								<CurrencyTextField
									variant="outlined"
									label="Сумма"
									fullWidth
									value={value}
									onChange={(_, newValue) => onChange(newValue)}
									onBlur={onBlur}
									InputProps={{
										readOnly: !isEditable
									}}
									error={!!errors.value}
									helperText={errors.value?.message}
								/>
							)}
						/>

						<Grid container spacing={2}>
							<Grid item md={6} xs={12}>
								<Controller
									control={control}
									name="state"
									render={({ onChange, ...props }) => (
										<ServerAutocomplete
											{...props}
											getOptionLabel={option => option.name}
											readOnly={!isEditable}
											label="Статья"
											className="mt-20"
											fullWidth
											onAdd={isEditable ? () => setIsShowModalFinanceState(true) : undefined}
											InputProps={{
												error: !!errors.state,
												helperText: errors.state?.message
											}}
											onFetchList={(name, limit) =>
												financeService
													.getFinanceStates({
														name,
														limit,
														type: FINANCE_STATE_TYPE_SPENDING
													})
													.then(({ data }) => data)
											}
											onFetchItem={uuid =>
												financeService.getFinanceStateByUuid(uuid).then(({ data }) => data)
											}
											onChange={value => {
												onChange(value);
												setValue('counterparty', null);
											}}
										/>
									)}
								/>
							</Grid>

							<Grid item md={6} xs={12}>
								<Controller
									control={control}
									name="money_account"
									render={({ onChange, ...props }) => (
										<ServerAutocomplete
											{...props}
											getOptionLabel={option => option.name}
											readOnly={!isEditable}
											label="Реквизиты счета"
											className="mt-20"
											fullWidth
											onAdd={isEditable ? () => setIsShowModalMoneyAccount(true) : undefined}
											InputProps={{
												error: !!errors.money_account,
												helperText: errors.money_account?.message
											}}
											onFetchList={(name, limit) =>
												companiesService
													.getMoneyAccounts({ name, limit, category: TYPE_CATEGORY_CASH })
													.then(({ data }) => data)
											}
											onFetchItem={uuid => companiesService.getMoneyAccount(uuid)}
											onChange={value => onChange(value?.uuid ?? null)}
										/>
									)}
								/>
							</Grid>
						</Grid>

						{watchFields.state && (
							<Controller
								control={control}
								name="counterparty"
								render={({ onChange, ...props }) => (
									<FieldCounterpartyAutocomplete
										{...props}
										type={watchFields.state.counterparty_type}
										label="Контрагент"
										className="mt-20"
										fullWidth
										readOnly={!isEditable}
										InputProps={{
											error: !!errors.counterparty,
											helperText: errors.counterparty?.message
										}}
										onChange={value => onChange(value?.uuid ?? null)}
									/>
								)}
							/>
						)}

						<Grid container spacing={2}>
							<Grid item md={6} xs={12}>
								<Controller
									as={<DatePickerField />}
									control={control}
									className="mt-20"
									fullWidth
									label="Дата операции"
									name="paid_date_time"
									type="text"
									variant="outlined"
									readOnly
									onlyValid
									error={!!errors.paid_date_time}
									helperText={errors.paid_date_time?.message}
								/>
							</Grid>

							<Grid item md={6} xs={12}>
								<Controller
									as={<TextField />}
									control={control}
									label="Кассир"
									variant="outlined"
									fullWidth
									className="mt-20"
									select
									name="cashier"
									InputProps={{
										readOnly: !isEditable
									}}
									error={!!errors.cashier}
									helperText={errors.cashier?.message}
								>
									<MenuItem value="">Все</MenuItem>
									{dataListCashier?.results.map(item => (
										<MenuItem key={item.uuid} value={item.uuid}>
											{getFullName(item)}
										</MenuItem>
									))}
								</Controller>
							</Grid>
						</Grid>

						<Controller
							as={<TextField />}
							control={control}
							label="Описание"
							variant="outlined"
							fullWidth
							rows={3}
							multiline
							className="mt-20"
							name="description"
							InputProps={{
								readOnly: !isEditable
							}}
							error={!!errors.description}
							helperText={errors.description?.message}
						/>
					</div>

					{isShowListReceptionDoctorInDay && (
						<div className="px-32 py-10">
							<ListReceptionDoctorInDay filter={filterForReceptionDoctorInDay} />
						</div>
					)}

					<Divider className="mt-32" />
					<div className="flex items-center px-32 py-10">
						{isEditable && (
							<Button
								className="mr-10"
								textNormal
								disabled={createFinanceAction.isLoading}
								onClick={handleOnCreateFinanceAction}
							>
								Сохранить
							</Button>
						)}
					</div>
				</>
			)}

			<ModalFinanceState
				isOpen={isShowModalFinanceState}
				onClose={() => setIsShowModalFinanceState(false)}
				initialFields={{
					type: FINANCE_STATE_TYPE_SPENDING
				}}
			/>
			{isShowModalMoneyAccount && <ModalMoneyAccount isOpen onClose={() => setIsShowModalMoneyAccount(false)} />}
			<ModalPartner isOpen={isShowModalPartner} onClose={() => setIsShowModalPartner(false)} />
		</>
	);
}
FormFinanceExpense.defaultProps = {
	financeActionUuid: null,
	initialValues: {},
	onUpdate: () => {}
};
FormFinanceExpense.propTypes = {
	financeActionUuid: PropTypes.string,
	initialValues: PropTypes.shape({
		value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		state: PropTypes.string,
		money_account: PropTypes.string,
		cashier: PropTypes.string,
		counterparty: PropTypes.string,
		description: PropTypes.string
	}),
	onUpdate: PropTypes.func
};
