import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import { Grid, Divider, Typography, Switch, FormLabel } from '@material-ui/core';
import { Controller, useForm } from 'react-hook-form';
import {
	TextField,
	Button,
	DatePickerField,
	CurrencyTextField,
	Autocomplete,
	ServerAutocomplete,
	Amount
} from '../../bizKITUi';
import FuseLoading from '../../../@fuse/core/FuseLoading';
import { useAlert, usePermissions } from '../../hooks';
import { ModalFinanceState } from '../ModalFinanceState';
import { ModalMoneyAccount } from '../ModalMoneyAccount';
import {
	FINANCE_STATE_TYPE_COMING,
	FINANCE_BASE_TYPE_STATIONARY_RECEPTION,
	FINANCE_BASE_TYPE_LABORATORY_RECEPTION,
	COUNTERPARTY_TYPE_PATIENT,
	PROMOTION_STATUS_ACTIVE,
	PROMOTION_TYPE_DISCOUNT,
	PROMOTION_TYPE_CASHBACK
} from '../../services/finance/constants';
import { ModalPatient } from '../ModalPatient';
import { financeService, authService, ENTITY, ENTITY_DEPS, companiesService, employeesService } from '../../services';
import { useSearchClinicService } from '../hooks/useSearchClinicService';
import { CASHIER_PERMISSIONS } from '../../services/auth/constants';
import {
	TYPE_CATEGORY_CASH,
	MONEY_ACCOUNT_TYPE_NON_CASH,
	MONEY_ACCOUNT_TYPE_CASH
} from '../../services/companies/constants';
import { ErrorMessage } from '../ErrorMessage';
import { TableServices } from './TableServices';
import { TableSummary } from './TableSummary';
import { defaults, getFullName } from '../../utils';
import { GuardCheckCashierShift } from '../GuardCheckCashierShift';
import { modalPromise } from '../ModalPromise';
import { ModalJuridicalPerson } from '../ModalJuridicalPerson';
import { FieldCounterpartyAutocomplete } from '../FieldCounterpartyAutocomplete';

import * as globalAuthSelectors from '../../auth/store/selectors/auth';

const defaultValues = {
	value: '',
	state: null,
	money_account: null,
	doctor: null,
	paid_date_time: null,
	cashier: null,
	description: '',
	counterparty: null,
	juridical_person: null,

	mixed_pay: false,
	money_account_card: null,
	value_card: '',
	value_cash: '',

	bonuses_written_off: 0,
	discount: null
};

export function FormFinanceIncome({ financeActionPendingUuid, financeActionUuid }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();
	const { hasPermission } = usePermissions();

	const currentUser = useSelector(globalAuthSelectors.currentUser);
	const currentCashier = hasPermission(CASHIER_PERMISSIONS) ? currentUser.data.uuid : null;

	const [showJuridicalPerson, setShowJuridicalPerson] = useState(false);
	const [showWriteOffBonuses, setShowWriteOffBonuses] = useState(false);
	const [showApplyDiscount, setShowApplyDiscount] = useState(false);

	const [currentFinanceActionUuid, setCurrentFinanceActionUuid] = useState(financeActionUuid);
	const [currentFinanceActionPendingUuid, setCurrentFinanceActionPendingUuid] = useState(financeActionPendingUuid);

	const { control, errors, watch, getValues, setValue, setError, reset, register, clearErrors } = useForm({
		mode: 'onBlur',
		defaultValues: {
			...defaultValues,
			cashier: currentCashier
		}
	});
	const watchFields = watch([
		'value',
		'discount',
		'counterparty',
		'bonuses_written_off',
		'doctor',
		'state',
		'mixed_pay',
		'juridical_person'
	]);

	const {
		status: statusSearchClinicService,
		actions: actionsSearchClinicService,
		data: dataSearchClinicService
	} = useSearchClinicService();

	const selectedStateIsCounterpartyPatient = watchFields.state?.counterparty_type === COUNTERPARTY_TYPE_PATIENT;

	const [servicesList, setServicesList] = useState([]);

	const {
		isLoading: isLoadingFinanceActionPending,
		isError: isErrorFinanceActionPending,
		data: dataFinanceActionPending
	} = useQuery(
		[ENTITY.FINANCE_ACTION_PENDING, currentFinanceActionPendingUuid],
		() => financeService.getFinanceActionPendingByUuid(currentFinanceActionPendingUuid).then(res => res.data),
		{ enabled: !!currentFinanceActionPendingUuid }
	);

	const { isLoading: isLoadingFinanceAction, isError: isErrorFinanceAction, data: dataFinanceAction } = useQuery(
		[ENTITY.FINANCE_ACTION, currentFinanceActionUuid],
		() => financeService.getFinanceActionByUuid(currentFinanceActionUuid).then(res => res.data),
		{ enabled: !!currentFinanceActionUuid }
	);

	const { isLoading: isLoadingActiveCashback, isError: isErrorActiveCashback, data: activeCashback } = useQuery(
		[ENTITY.PROMOTION, { status: PROMOTION_STATUS_ACTIVE, type: PROMOTION_TYPE_CASHBACK, limit: 1 }],
		({ queryKey }) => financeService.getPromotions(queryKey[1])
	);
	const currentCashback = activeCashback?.results[0] ?? null;

	const isStationaryReception =
		dataFinanceActionPending?.base_type === FINANCE_BASE_TYPE_STATIONARY_RECEPTION ||
		dataFinanceAction?.base_type === FINANCE_BASE_TYPE_STATIONARY_RECEPTION;
	const isLaboratoryReception =
		dataFinanceActionPending?.base_type === FINANCE_BASE_TYPE_LABORATORY_RECEPTION ||
		dataFinanceAction?.base_type === FINANCE_BASE_TYPE_LABORATORY_RECEPTION;

	const totalCost = dataFinanceActionPending?.value ?? dataFinanceAction?.value ?? watchFields.value;
	const isNew = !currentFinanceActionUuid;
	const isCreateFromPending = !!currentFinanceActionPendingUuid;

	useEffect(() => {
		if (!isNew || !watchFields.counterparty || !selectedStateIsCounterpartyPatient) {
			return;
		}
		if (!showWriteOffBonuses) {
			setValue('bonuses_written_off', 0);
			return;
		}
		let amount = Math.min(watchFields.counterparty.bonuses_balance, totalCost);
		if (currentCashback) {
			const writeOffLimit = (currentCashback.write_off_limit / 100) * totalCost;
			amount = Math.min(writeOffLimit, watchFields.counterparty.bonuses_balance);
		}
		setValue('bonuses_written_off', amount);
	}, [
		currentCashback,
		watchFields.counterparty,
		selectedStateIsCounterpartyPatient,
		isNew,
		setValue,
		showWriteOffBonuses,
		totalCost
	]);

	const handleOnSetServiceList = (services, medications) => {
		const listServices = services.map(item => ({
			name: item.service.name,
			amount: item.count,
			cost: item.service.cost
		}));
		const listMedications = medications.map(item => ({
			isMedication: true,
			minimum_unit_of_measure: item.minimum_unit_of_measure,
			packing: item.packing,
			packing_unit: item.packing_unit,
			amount_in_package: item.amount_in_package,
			name: item.product.name,
			amount: item.count,
			cost: item.product.sale_price
		}));

		setServicesList([...listServices, ...listMedications]);
	};

	useEffect(() => {
		if (!dataFinanceActionPending) {
			return;
		}

		if (isStationaryReception || isLaboratoryReception) {
			handleOnSetServiceList(dataFinanceActionPending.services, dataFinanceActionPending.medications);
		}

		if (dataFinanceActionPending.service) {
			actionsSearchClinicService.getByUuid(dataFinanceActionPending.service.uuid);
		}
		if (dataFinanceActionPending.juridical_person) {
			setShowJuridicalPerson(true);
		}
		if (dataFinanceActionPending.bonuses_written_off > 0) {
			setShowWriteOffBonuses(true);
		}
		if (dataFinanceActionPending.discount) {
			setShowApplyDiscount(true);
		}

		reset(
			defaults(
				{
					...dataFinanceActionPending,
					doctor: dataFinanceActionPending.doctor?.uuid ?? defaultValues.doctor,
					juridical_person: dataFinanceActionPending.juridical_person?.uuid ?? defaultValues.juridical_person
				},
				{
					...defaultValues,
					cashier: currentCashier
				}
			)
		);
	}, [
		actionsSearchClinicService,
		dataFinanceActionPending,
		isLaboratoryReception,
		isStationaryReception,
		currentCashier,
		reset
	]);
	useEffect(() => {
		if (!dataFinanceAction) {
			return;
		}

		if (isStationaryReception || isLaboratoryReception) {
			handleOnSetServiceList(dataFinanceAction.services, dataFinanceAction.medications);
		}

		if (dataFinanceAction.service) {
			actionsSearchClinicService.getByUuid(dataFinanceAction.service.uuid);
		}

		if (dataFinanceAction.juridical_person) {
			setShowJuridicalPerson(true);
		}
		if (dataFinanceAction.bonuses_written_off > 0) {
			setShowWriteOffBonuses(true);
		}
		if (dataFinanceAction.discount) {
			setShowApplyDiscount(true);
		}

		reset(
			defaults(
				{
					...dataFinanceAction,
					doctor: dataFinanceAction.doctor?.uuid,
					juridical_person: dataFinanceAction.juridical_person?.uuid
				},
				{
					...defaultValues,
					cashier: currentCashier
				}
			)
		);
	}, [
		actionsSearchClinicService,
		dataFinanceAction,
		isLaboratoryReception,
		isStationaryReception,
		currentCashier,
		reset
	]);

	const [isShowModalFinanceState, setIsShowModalFinanceState] = useState(false);
	const [isShowModalMoneyAccount, setIsShowModalMoneyAccount] = useState(false);
	const [isShowModalPatient, setIsShowModalPatient] = useState(false);

	const handleOnChangeService = (_, value) => {
		actionsSearchClinicService.setValue(value);
		setValue('discount', null);
		setValue('doctor', value?.doctor ?? null);
		setValue('value', value?.cost ?? 0);
	};

	const createFinanceAction = useMutation(payload => financeService.createFinanceActions(payload));
	const handleOnCreateFinanceAction = () => {
		clearErrors();

		const values = getValues();

		const payload = {
			...values,
			counterparty: values.counterparty?.uuid,
			type: FINANCE_STATE_TYPE_COMING,
			service: dataSearchClinicService.value?.uuid,
			discount: values.discount?.uuid,
			state: values.state?.uuid
		};

		createFinanceAction
			.mutateAsync(payload)
			.then(({ data: { uuid } }) => {
				setCurrentFinanceActionUuid(uuid);
				ENTITY_DEPS.FINANCE_ACTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Оплата успешно создана');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать оплату');
			});
	};

	const payFinanceAction = useMutation(({ uuid, payload }) => financeService.payFinanceActionPending(uuid, payload));
	const handleOnPayFinanceAction = () => {
		clearErrors();

		const values = getValues();
		const payload = {
			money_account: values.money_account,
			cashier: values.cashier,
			value: values.value,
			discount: values.discount?.uuid,
			description: values.description,
			juridical_person: values.juridical_person,
			mixed_pay: values.mixed_pay,
			money_account_card: values.money_account_card,
			value_card: values.value_card,
			value_cash: values.value_cash,
			bonuses_written_off: values.bonuses_written_off
		};

		payFinanceAction
			.mutateAsync({ uuid: currentFinanceActionPendingUuid, payload })
			.then(({ data: { uuid } }) => {
				setCurrentFinanceActionPendingUuid(null);
				setCurrentFinanceActionUuid(uuid);
				ENTITY_DEPS.FINANCE_ACTION_PENDING.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Оплата успешно создана');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать оплату');
			});
	};

	const handleOnSave = () => {
		if (isNew && currentFinanceActionPendingUuid) {
			handleOnPayFinanceAction();
		} else {
			handleOnCreateFinanceAction();
		}
	};

	const getCashbackForSummary = () => {
		if (!isNew) {
			return dataFinanceAction?.cashback;
		}

		return selectedStateIsCounterpartyPatient ? currentCashback : null;
	};

	// TODO use mutation
	const [isLoadingPrintCheck, setIsLoadingPrintCheck] = useState(false);
	const handleOnPrintCheck = () => {
		setIsLoadingPrintCheck(true);

		financeService
			.printFinanceActionCheck(currentFinanceActionUuid)
			.catch(() => {
				alertError('Не удалось распечатать чек');
			})
			.finally(() => setIsLoadingPrintCheck(false));
	};

	const isLoading =
		(currentFinanceActionPendingUuid && isLoadingFinanceActionPending) ||
		(currentFinanceActionUuid && isLoadingFinanceAction) ||
		isLoadingActiveCashback;
	const isError = isErrorFinanceActionPending || isErrorFinanceAction || isErrorActiveCashback;
	const filterForSearchClinicService = {
		doctor: watchFields.doctor
	};

	if (isLoading) {
		return (
			<div className="p-32">
				<FuseLoading />
			</div>
		);
	}
	if (isError) {
		return <ErrorMessage />;
	}
	return (
		<>
			<div className="flex md:flex-row flex-col">
				<div className="md:w-3/5 w-full p-16">
					<FormLabel className="flex justify-between items-center mb-10 text-grey-900">
						<Typography variant="subtitle2" component="span">
							Смешанная оплата (наличный + безналичный расчет)
						</Typography>
						<Controller
							control={control}
							name="mixed_pay"
							render={({ value, onChange }) => (
								<Switch
									checked={value}
									disabled={!isNew}
									edge="end"
									onChange={event => {
										onChange(event.target.checked);
										setValue('money_account', null);
									}}
								/>
							)}
						/>
					</FormLabel>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<Controller
								control={control}
								name="value"
								render={({ onChange, onBlur, value }) => (
									<CurrencyTextField
										variant="outlined"
										margin="none"
										label="Сумма"
										fullWidth
										value={value}
										onChange={(_, newValue) => onChange(newValue)}
										onBlur={onBlur}
										InputProps={{
											readOnly: !isNew
										}}
										error={!!errors.value}
										helperText={errors.value?.message}
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
										readOnly={!isNew}
										label={watchFields.mixed_pay ? 'Наличный счет' : 'Реквизиты счета'}
										margin="none"
										fullWidth
										onAdd={isNew ? () => setIsShowModalMoneyAccount(true) : undefined}
										InputProps={{
											error: !!errors.money_account,
											helperText: errors.money_account?.message
										}}
										onFetchList={name =>
											companiesService
												.getMoneyAccounts({
													name,
													type: watchFields.mixed_pay ? MONEY_ACCOUNT_TYPE_CASH : null,
													category: TYPE_CATEGORY_CASH,
													limit: 10
												})
												.then(({ data }) => data.results)
										}
										onFetchItem={uuid => companiesService.getMoneyAccount(uuid)}
										onChange={value => onChange(value?.uuid ?? null)}
									/>
								)}
							/>
						</Grid>
						{watchFields.mixed_pay && (
							<>
								<Grid item md={6} xs={12}>
									<Controller
										control={control}
										name="value_cash"
										render={({ onChange, onBlur, value }) => (
											<CurrencyTextField
												variant="outlined"
												label="Сумма оплаты наличными"
												fullWidth
												margin="none"
												disabled={watchFields.value <= 0}
												value={value}
												onChange={(_, newValue) => {
													onChange(newValue);
													setValue('value_card', watchFields.value - newValue);
												}}
												onBlur={onBlur}
												InputProps={{
													readOnly: !isNew
												}}
												error={!!errors.value_cash}
												helperText={errors.value_cash?.message}
											/>
										)}
									/>
								</Grid>

								<Grid item md={6} xs={12}>
									<Controller
										control={control}
										name="money_account_card"
										render={({ onChange, ...props }) => (
											<ServerAutocomplete
												{...props}
												getOptionLabel={option => option.name}
												readOnly={!isNew}
												label="Безналичный счет"
												margin="none"
												fullWidth
												onAdd={isNew ? () => setIsShowModalMoneyAccount(true) : undefined}
												InputProps={{
													error: !!errors.money_account_card,
													helperText: errors.money_account_card?.message
												}}
												onFetchList={name =>
													companiesService
														.getMoneyAccounts({
															name,
															type: MONEY_ACCOUNT_TYPE_NON_CASH,
															category: TYPE_CATEGORY_CASH,
															limit: 10
														})
														.then(({ data }) => data.results)
												}
												onFetchItem={uuid => companiesService.getMoneyAccount(uuid)}
												onChange={value => onChange(value?.uuid ?? null)}
											/>
										)}
									/>
								</Grid>
								<Grid item md={6} xs={12}>
									<Controller
										control={control}
										name="value_card"
										render={({ onChange, onBlur, value }) => (
											<CurrencyTextField
												variant="outlined"
												label="Сумма безналичного расчета"
												disabled={watchFields.value <= 0}
												fullWidth
												margin="none"
												value={value}
												onChange={(_, newValue) => {
													onChange(newValue);
													setValue('value_cash', watchFields.value - newValue);
												}}
												onBlur={onBlur}
												InputProps={{
													readOnly: !isNew
												}}
												error={!!errors.value_card}
												helperText={errors.value_card?.message}
											/>
										)}
									/>
								</Grid>
							</>
						)}
						<Grid item md={watchFields.mixed_pay ? 12 : 6} xs={12}>
							<Controller
								control={control}
								name="state"
								render={({ onChange, ...props }) => (
									<ServerAutocomplete
										{...props}
										getOptionLabel={option => option.name}
										readOnly={!isNew}
										label="Статья"
										margin="none"
										fullWidth
										onAdd={isNew ? () => setIsShowModalFinanceState(true) : undefined}
										InputProps={{
											error: !!errors.state,
											helperText: errors.state?.message
										}}
										onFetchList={name =>
											financeService
												.getFinanceStates({
													name,
													limit: 10,
													type: FINANCE_STATE_TYPE_COMING
												})
												.then(({ data }) => data.results)
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

						{watchFields.state && (
							<Grid item xs={12}>
								{selectedStateIsCounterpartyPatient && (
									<Button
										className="mb-6"
										size="small"
										variant="text"
										textNormal
										disabled={!isNew || isCreateFromPending}
										onClick={() => setIsShowModalPatient(true)}
									>
										Создать Контрагента
									</Button>
								)}
								<Controller
									control={control}
									name="counterparty"
									render={({ onChange, ...props }) => (
										<FieldCounterpartyAutocomplete
											{...props}
											type={watchFields.state.counterparty_type}
											label="Контрагент"
											margin="none"
											readOnly={!isNew || isCreateFromPending}
											InputProps={{
												error: !!errors.counterparty,
												helperText: errors.counterparty?.message
											}}
											onChange={value => onChange(value)}
										/>
									)}
								/>
							</Grid>
						)}

						{selectedStateIsCounterpartyPatient && (
							<Grid item xs={12}>
								<FormLabel className="flex justify-between items-center text-grey-900">
									<Typography variant="subtitle2" component="span">
										Юридическое лицо
									</Typography>
									<Switch
										checked={showJuridicalPerson}
										disabled={!isNew}
										edge="end"
										onChange={event => setShowJuridicalPerson(event.target.checked)}
									/>
								</FormLabel>
								{showJuridicalPerson && (
									<>
										<Button
											size="small"
											variant="text"
											className="mb-6"
											textNormal
											disabled={!watchFields.juridical_person}
											onClick={() =>
												modalPromise.open(({ onClose }) => (
													<ModalJuridicalPerson
														isOpen
														personUuid={watchFields.juridical_person}
														onClose={onClose}
													/>
												))
											}
										>
											Редактировать юридическое лицо
										</Button>
										<Controller
											control={control}
											name="juridical_person"
											render={({ onChange, ...props }) => (
												<ServerAutocomplete
													{...props}
													getOptionLabel={option => option.name}
													readOnly={!isNew}
													label="Юридическое лицо"
													margin="none"
													fullWidth
													onAdd={() => {
														modalPromise.open(({ onClose }) => (
															<ModalJuridicalPerson
																isOpen
																onClose={onClose}
																initialValues={{
																	patient: watchFields.counterparty?.uuid
																}}
															/>
														));
													}}
													InputProps={{
														error: !!errors.juridical_person,
														helperText: errors.juridical_person?.message
													}}
													onFetchList={name =>
														employeesService
															.getJuridicalPersons({
																name,
																patient: watchFields.counterparty?.uuid,
																limit: 10
															})
															.then(({ results }) => results)
													}
													onFetchItem={uuid => employeesService.getJuridicalPerson(uuid)}
													onChange={value => onChange(value?.uuid ?? null)}
												/>
											)}
										/>
									</>
								)}
							</Grid>
						)}

						{selectedStateIsCounterpartyPatient && (
							<>
								<Grid item md={6} xs={12}>
									{isStationaryReception && (
										<TextField
											margin="none"
											label="Услуга"
											variant="outlined"
											value="Прием стационара"
											InputProps={{ readOnly: true }}
											fullWidth
										/>
									)}

									{isLaboratoryReception && (
										<TextField
											margin="none"
											label="Услуга"
											variant="outlined"
											value="Прием лаборатории"
											InputProps={{ readOnly: true }}
											fullWidth
										/>
									)}

									{!(isStationaryReception || isLaboratoryReception) && (
										<Autocomplete
											readOnly={!isNew || isCreateFromPending}
											isLoading={statusSearchClinicService.isLoading}
											options={dataSearchClinicService.listServices}
											getOptionLabel={option => option?.name}
											filterOptions={options => options}
											getOptionSelected={(option, value) => option.uuid === value.uuid}
											onChange={handleOnChangeService}
											onOpen={() =>
												actionsSearchClinicService.update(
													dataSearchClinicService.keyword,
													filterForSearchClinicService
												)
											}
											onInputChange={(_, newValue) =>
												actionsSearchClinicService.update(
													newValue,
													filterForSearchClinicService
												)
											}
											fullWidth
											value={dataSearchClinicService.value}
											renderInput={params => (
												<TextField
													{...params}
													label="Услуга"
													margin="none"
													variant="outlined"
													InputProps={{ inputRef: register, ...params.InputProps }}
													name="service"
													error={!!errors.service}
													helperText={errors.service?.message}
												/>
											)}
										/>
									)}
								</Grid>

								<Grid item md={6} xs={12}>
									<Controller
										control={control}
										name="doctor"
										render={({ onChange, ...props }) => (
											<ServerAutocomplete
												{...props}
												getOptionLabel={option => getFullName(option)}
												label="Врач"
												margin="none"
												readOnly={!isNew || isCreateFromPending}
												InputProps={{
													error: !!errors.doctor,
													helperText: errors.doctor?.message
												}}
												onChange={value => onChange(value?.uuid ?? null)}
												onFetchList={search =>
													employeesService
														.getDoctors({
															search,
															limit: 10,
															services: dataSearchClinicService.value?.uuid
														})
														.then(res => res.data.results)
												}
												onFetchItem={fetchUuid =>
													employeesService.getDoctor(fetchUuid).then(res => res.data)
												}
											/>
										)}
									/>
								</Grid>
							</>
						)}

						<Grid item md={6} xs={12}>
							<Controller
								as={<DatePickerField />}
								control={control}
								margin="none"
								fullWidth
								label="Дата операции"
								name="paid_date_time"
								type="text"
								variant="outlined"
								readOnly
								error={!!errors.paid_date_time}
								helperText={errors.paid_date_time?.message}
							/>
						</Grid>

						<Grid item md={6} xs={12}>
							<Controller
								control={control}
								name="cashier"
								render={({ onChange, ...props }) => (
									<ServerAutocomplete
										{...props}
										margin="none"
										getOptionLabel={option => getFullName(option)}
										label="Кассир"
										readOnly={!isNew}
										InputProps={{
											error: !!errors.cashier,
											helperText: errors.cashier?.message
										}}
										onFetchList={search =>
											authService
												.getUsers({
													search,
													limit: 10,
													permissions: CASHIER_PERMISSIONS
												})
												.then(item => item.results)
										}
										onFetchItem={uuid => authService.getUser(uuid).then(({ data }) => data)}
										onChange={newValue => onChange(newValue?.uuid ?? null)}
									/>
								)}
							/>
						</Grid>

						<Grid item xs={12}>
							<Controller
								as={<TextField />}
								control={control}
								label="Описание"
								variant="outlined"
								fullWidth
								rows={3}
								multiline
								margin="none"
								name="description"
								InputProps={{
									readOnly: !isNew
								}}
								error={!!errors.description}
								helperText={errors.description?.message}
							/>
						</Grid>
					</Grid>
				</div>
				<div className="md:w-2/5 w-full border-l-1">
					<div className="p-16">
						<FormLabel className="flex justify-between items-center mb-10 text-grey-900">
							<Typography variant="subtitle2" component="span">
								Списать бонусы{' '}
								{watchFields.counterparty && selectedStateIsCounterpartyPatient ? (
									<>
										(баланс: <Amount value={watchFields.counterparty.bonuses_balance} />)
									</>
								) : (
									'(Пациент не выбран)'
								)}
							</Typography>
							<Switch
								checked={showWriteOffBonuses}
								disabled={
									!isNew ||
									!watchFields.counterparty ||
									!selectedStateIsCounterpartyPatient ||
									showApplyDiscount
								}
								edge="end"
								onChange={event => setShowWriteOffBonuses(event.target.checked)}
							/>
						</FormLabel>
						{showWriteOffBonuses && (
							<Controller
								control={control}
								name="bonuses_written_off"
								render={({ onChange, onBlur, value }) => (
									<CurrencyTextField
										variant="outlined"
										margin="none"
										label="Кол-во бонусов для списания"
										fullWidth
										readOnly={!isNew}
										value={value}
										onChange={(_, newValue) => onChange(newValue)}
										onBlur={onBlur}
										InputProps={{
											readOnly: !isNew
										}}
										error={!!errors.bonuses_written_off}
										helperText={errors.bonuses_written_off?.message}
									/>
								)}
							/>
						)}

						<FormLabel className="flex justify-between items-center my-10 text-grey-900">
							<Typography variant="subtitle2" component="span">
								Применить скидку
							</Typography>
							<Switch
								checked={showApplyDiscount}
								disabled={!isNew || showWriteOffBonuses || !selectedStateIsCounterpartyPatient}
								edge="end"
								onChange={event => setShowApplyDiscount(event.target.checked)}
							/>
						</FormLabel>
						{showApplyDiscount && (
							<Controller
								control={control}
								name="discount"
								render={({ onChange, ...props }) => (
									<ServerAutocomplete
										{...props}
										margin="none"
										readOnly={!isNew}
										getOptionLabel={option => option.name}
										label="Выберите скидку"
										InputProps={{
											error: !!errors.discount,
											helperText: errors.discount?.message
										}}
										onFetchList={name =>
											financeService
												.getPromotions({
													name,
													limit: 10,
													status: PROMOTION_STATUS_ACTIVE,
													type: PROMOTION_TYPE_DISCOUNT,
													service: dataSearchClinicService.value?.uuid
												})
												.then(item => item.results)
										}
										onFetchItem={uuid => financeService.getPromotion(uuid)}
										onChange={newValue => onChange(newValue)}
									/>
								)}
							/>
						)}
					</div>
					<Divider />
					<div className="p-16">
						{(isStationaryReception || isLaboratoryReception) && (
							<TableServices list={servicesList} totalCost={totalCost} />
						)}
						<TableSummary
							totalCost={totalCost || 0}
							bonusesWrittenOff={watchFields.bonuses_written_off}
							discount={watchFields.discount}
							cashback={getCashbackForSummary()}
							discountValue={dataFinanceAction?.discount_value}
							cashbackValue={dataFinanceAction?.cashback_value}
							totalPayable={dataFinanceAction?.total_payable}
						/>
					</div>
				</div>
			</div>

			<Divider />
			<div className="flex items-center px-16 py-10">
				{!isNew && (
					<Button textNormal disabled={isLoadingPrintCheck} onClick={handleOnPrintCheck}>
						Печать чека
					</Button>
				)}

				{isNew && (
					<GuardCheckCashierShift
						fallback={() => (
							<Button textNormal className="ml-auto" disabled>
								Провести транзакцию
							</Button>
						)}
					>
						{() => (
							<Button
								className="ml-auto"
								textNormal
								customColor="primary"
								disabled={createFinanceAction.isLoading || payFinanceAction.isLoading}
								onClick={handleOnSave}
							>
								Провести транзакцию
							</Button>
						)}
					</GuardCheckCashierShift>
				)}
			</div>

			{isShowModalFinanceState && (
				<ModalFinanceState
					isOpen
					onClose={() => setIsShowModalFinanceState(false)}
					initialFields={{
						type: FINANCE_STATE_TYPE_COMING
					}}
				/>
			)}
			{isShowModalMoneyAccount && <ModalMoneyAccount isOpen onClose={() => setIsShowModalMoneyAccount(false)} />}
			{isShowModalPatient && (
				<ModalPatient
					isOpen
					onClose={() => setIsShowModalPatient(false)}
					onUpdate={uuid => setValue('counterparty', uuid)}
				/>
			)}
		</>
	);
}
FormFinanceIncome.defaultProps = {
	financeActionPendingUuid: null,
	financeActionUuid: null
};
FormFinanceIncome.propTypes = {
	financeActionPendingUuid: PropTypes.string,
	financeActionUuid: PropTypes.string
};
