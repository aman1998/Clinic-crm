import React, { useMemo } from 'react';
import { Grid, Typography } from '@material-ui/core';
import { useFormContext, Controller } from 'react-hook-form';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { MenuItem, DatePickerField, TextField, SelectField, CurrencyTextField } from '../../bizKITUi';
import { GROUP_TYPE_SPENDING, GROUP_TYPE_COMING, GROUP_TYPE_MOVING } from '../../services/globalFinance/constants';
import { TYPE_CATEGORY_GLOBAL_FINANCE } from '../../services/companies/constants';
import { KZT } from '../../services/currencies/constants';
import { SelectFinanceType } from '../SelectFinanceType';
import { companiesService, ENTITY } from '../../services';
import { FieldCounterpartyAutocomplete } from '../FieldCounterpartyAutocomplete';

function getKzt(value, rate) {
	if (value === '' || rate === '') {
		return 0;
	}
	return value * rate;
}

function DisplayRateCurrency({ rate, date }) {
	return (
		<p className="text-xs">
			{rate && date ? (
				<>
					Курс на {date} - {rate}
				</>
			) : (
				'Курс для текущей валюты не найден'
			)}
		</p>
	);
}
DisplayRateCurrency.defaultProps = {
	rate: null,
	date: null
};
DisplayRateCurrency.propTypes = {
	rate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	date: PropTypes.string
};

export const FormFinance = React.memo(
	({
		currencies,
		users,
		financeGroups,
		isCreated,
		isEdit,
		isShowFact,
		isEditFact,
		onAddFinanceState,
		onAddMoneyAccount
	}) => {
		const { control, watch, errors, setValue, getValues } = useFormContext();

		const watchFields = watch([
			'currency',
			'type',
			'global_finance_state',
			'recipient_money_account',
			'sender_money_account'
		]);
		const selectedCurrency = useMemo(() => currencies.find(item => item.code === watchFields.currency), [
			currencies,
			watchFields.currency
		]);
		const isShowRate = useMemo(() => watchFields.currency !== KZT && watchFields.currency, [watchFields.currency]);

		const calculateAtKztRatePlan = () => {
			const values = getValues(['plan_value', 'plan_rate']);

			setValue('plan_value_kzt', getKzt(values.plan_value, values.plan_rate));
		};
		const calculateAtKztRateFact = () => {
			const values = getValues(['fact_value', 'fact_rate']);

			setValue('fact_value_kzt', getKzt(values.fact_value, values.fact_rate));
		};

		const groupsByType = financeGroups.filter(
			item => item.type === watchFields.type && item.global_finance_states.length > 0
		);
		const financeStates = financeGroups.reduce((prev, current) => [...prev, ...current.global_finance_states], []);

		const { data: moneyAccounts } = useQuery(
			[ENTITY.MONEY_ACCOUNT, { limit: Number.MAX_SAFE_INTEGER }],
			({ queryKey }) => {
				return companiesService.getMoneyAccounts(queryKey[1]).then(({ data }) => data);
			}
		);

		const listMoneyAccounts =
			moneyAccounts?.results.filter(item => item.category === TYPE_CATEGORY_GLOBAL_FINANCE) ?? [];
		const listSenderMoneyAccounts =
			moneyAccounts?.results.filter(item => item.uuid !== watchFields.recipient_money_account) ?? [];
		const listRecipientMoneyAccounts =
			moneyAccounts?.results.filter(item => item.uuid !== watchFields.sender_money_account) ?? [];

		const selectedState = financeStates.find(item => item.uuid === watchFields.global_finance_state);
		const selectedTypeIsMoving = watchFields.type === GROUP_TYPE_MOVING;

		return (
			<>
				<Grid container spacing={4}>
					<Grid item md={8} xs={12}>
						<Controller
							control={control}
							name="type"
							render={({ onChange, onBlur, value }) => (
								<SelectFinanceType
									checked={value}
									name="type"
									onChange={event => {
										onChange(Number(event.target.value));
										setValue('global_finance_state', '');
									}}
									valueComing={GROUP_TYPE_COMING}
									valueSpending={GROUP_TYPE_SPENDING}
									valueMoving={GROUP_TYPE_MOVING}
									onBlur={onBlur}
									disabled={isCreated}
								/>
							)}
						/>
					</Grid>

					<Grid item md={4} xs={12}>
						<Controller
							as={<TextField />}
							control={control}
							variant="outlined"
							select
							label="Валюта"
							name="currency"
							fullWidth
							InputProps={{
								readOnly: !isEdit
							}}
							error={!!errors.currency}
							helperText={errors.currency?.message}
						>
							<MenuItem value={KZT} className="uppercase">
								KZT
							</MenuItem>
							{currencies.map(item => (
								<MenuItem value={item.code} key={item.uuid}>
									{item.code.toUpperCase()}
								</MenuItem>
							))}
						</Controller>
					</Grid>
				</Grid>

				<Typography className="text-lg mb-12 mt-24 font-bold">План</Typography>
				{isShowRate ? (
					<Grid container spacing={4}>
						<Grid item md={4} xs={12}>
							<Controller
								control={control}
								name="plan_rate"
								render={({ onChange, onBlur, value }) => (
									<CurrencyTextField
										variant="outlined"
										label="Курс"
										fullWidth
										value={value}
										onChange={(_, customValue) => {
											onChange(customValue);
											calculateAtKztRatePlan();
										}}
										onBlur={onBlur}
										InputProps={{
											readOnly: !isEdit
										}}
										error={!!errors.plan_rate}
										helperText={errors.plan_rate?.message}
									/>
								)}
							/>
							<div className="mt-2">
								<DisplayRateCurrency date={selectedCurrency?.date} rate={selectedCurrency?.rate} />
							</div>
						</Grid>

						<Grid item md={4} xs={12}>
							<Controller
								control={control}
								name="plan_value"
								render={({ onChange, onBlur, value }) => (
									<CurrencyTextField
										variant="outlined"
										label="Сумма в валюте"
										fullWidth
										value={value}
										onChange={(_, customValue) => {
											onChange(customValue);
											calculateAtKztRatePlan();
										}}
										onBlur={onBlur}
										InputProps={{
											readOnly: !isEdit
										}}
										error={!!errors.plan_value}
										helperText={errors.plan_value?.message}
									/>
								)}
							/>
						</Grid>

						<Grid item md={4} xs={12}>
							<Controller
								control={control}
								name="plan_value_kzt"
								render={({ value }) => (
									<CurrencyTextField
										variant="outlined"
										label="Сумма в тенге"
										fullWidth
										value={value}
										InputProps={{
											readOnly: true
										}}
										error={!!errors.plan_value_kzt}
										helperText={errors.plan_value_kzt?.message}
									/>
								)}
							/>
						</Grid>
					</Grid>
				) : (
					<Grid container spacing={4}>
						<Grid item md={12} xs={12}>
							<Controller
								control={control}
								name="plan_value_kzt"
								render={({ onChange, onBlur, value }) => (
									<CurrencyTextField
										variant="outlined"
										label="Сумма в тенге"
										fullWidth
										value={value}
										onChange={(_, customValue) => onChange(customValue)}
										onBlur={onBlur}
										InputProps={{
											readOnly: !isEdit
										}}
										error={!!errors.plan_value_kzt}
										helperText={errors.plan_value_kzt?.message}
									/>
								)}
							/>
						</Grid>
					</Grid>
				)}

				{isShowFact && <Typography className="text-lg mb-12 mt-24 font-bold">Факт</Typography>}
				{isShowFact &&
					(isShowRate ? (
						<Grid container spacing={4}>
							<Grid item md={4} xs={12}>
								<Controller
									control={control}
									name="fact_rate"
									render={({ onChange, onBlur, value }) => (
										<CurrencyTextField
											variant="outlined"
											label="Курс"
											fullWidth
											value={value}
											onChange={(_, customValue) => {
												onChange(customValue);
												calculateAtKztRateFact();
											}}
											onBlur={onBlur}
											InputProps={{
												readOnly: !(isEdit || isEditFact)
											}}
											error={!!errors.fact_rate}
											helperText={errors.fact_rate?.message}
										/>
									)}
								/>
								<div className="mt-2">
									<DisplayRateCurrency date={selectedCurrency?.date} rate={selectedCurrency?.rate} />
								</div>
							</Grid>

							<Grid item md={4} xs={12}>
								<Controller
									control={control}
									name="fact_value"
									render={({ onChange, onBlur, value }) => (
										<CurrencyTextField
											variant="outlined"
											label="Сумма в валюте"
											fullWidth
											value={value}
											onChange={(_, customValue) => {
												onChange(customValue);
												calculateAtKztRateFact();
											}}
											onBlur={onBlur}
											InputProps={{
												readOnly: !(isEdit || isEditFact)
											}}
											error={!!errors.fact_value}
											helperText={errors.fact_value?.message}
										/>
									)}
								/>
							</Grid>

							<Grid item md={4} xs={12}>
								<Controller
									control={control}
									name="fact_value_kzt"
									render={({ value }) => (
										<CurrencyTextField
											variant="outlined"
											label="Сумма в тенге"
											fullWidth
											value={value}
											InputProps={{
												readOnly: true
											}}
											error={!!errors.fact_value_kzt}
											helperText={errors.fact_value_kzt?.message}
										/>
									)}
								/>
							</Grid>
						</Grid>
					) : (
						<Grid container spacing={4}>
							<Grid item md={12} xs={12}>
								<Controller
									control={control}
									name="fact_value_kzt"
									render={({ onChange, onBlur, value }) => (
										<CurrencyTextField
											variant="outlined"
											label="Сумма в тенге"
											fullWidth
											value={value}
											onChange={(_, customValue) => onChange(customValue)}
											onBlur={onBlur}
											InputProps={{
												readOnly: !(isEdit || isEditFact)
											}}
											error={!!errors.fact_value_kzt}
											helperText={errors.fact_value_kzt?.message}
										/>
									)}
								/>
							</Grid>
						</Grid>
					))}

				<Grid container spacing={4}>
					<Grid item md={selectedTypeIsMoving ? 12 : 6} xs={12}>
						<Controller
							as={<SelectField />}
							control={control}
							label="Статья"
							name="global_finance_state"
							fullWidth
							onAdd={onAddFinanceState}
							addDisabled={!isEdit}
							InputProps={{
								readOnly: !isEdit
							}}
							error={!!errors.global_finance_state}
							helperText={errors.global_finance_state?.message}
						>
							{groupsByType.map(group => [
								<MenuItem key={group.uuid} value={group.uuid} disabled>
									{group.name}
								</MenuItem>,
								group.global_finance_states.map(state => (
									<MenuItem key={state.uuid} isGrouped value={state.uuid}>
										{state.name}
									</MenuItem>
								))
							])}
						</Controller>
					</Grid>

					{!selectedTypeIsMoving && (
						<Grid item md={6} xs={12}>
							<Controller
								as={<SelectField />}
								control={control}
								fullWidth
								label="Реквизиты счета"
								onAdd={onAddMoneyAccount}
								name="money_account"
								InputProps={{
									readOnly: !isEdit
								}}
								addDisabled={!isEdit}
								error={!!errors.money_account}
								helperText={errors.money_account?.message}
							>
								{listMoneyAccounts.map(item => (
									<MenuItem value={item.uuid} key={item.uuid}>
										{item.name}
									</MenuItem>
								))}
							</Controller>
						</Grid>
					)}
				</Grid>

				{selectedTypeIsMoving && (
					<Grid container spacing={4}>
						<Grid item md={6} xs={12}>
							<Controller
								as={<SelectField />}
								control={control}
								fullWidth
								label="Счёт отправителя"
								name="sender_money_account"
								variant="outlined"
								InputProps={{
									readOnly: !isEdit
								}}
								addDisabled={!isEdit}
								error={!!errors.sender_money_account}
								helperText={errors.sender_money_account?.message}
								onAdd={onAddMoneyAccount}
							>
								<MenuItem value="">Все</MenuItem>
								{listSenderMoneyAccounts.map(item => (
									<MenuItem key={item.uuid} value={item.uuid}>
										{item.name}
									</MenuItem>
								))}
							</Controller>
						</Grid>

						<Grid item md={6} xs={12}>
							<Controller
								as={<SelectField />}
								control={control}
								fullWidth
								label="Счёт получателя"
								name="recipient_money_account"
								variant="outlined"
								InputProps={{
									readOnly: !isEdit
								}}
								addDisabled={!isEdit}
								error={!!errors.recipient_money_account}
								helperText={errors.recipient_money_account?.message}
								onAdd={onAddMoneyAccount}
							>
								<MenuItem value="">Все</MenuItem>
								{listRecipientMoneyAccounts.map(item => (
									<MenuItem key={item.uuid} value={item.uuid}>
										{item.name}
									</MenuItem>
								))}
							</Controller>
						</Grid>
					</Grid>
				)}

				{selectedState && (
					<Grid container spacing={4}>
						<Grid item xs={12}>
							<Controller
								control={control}
								name="counterparty"
								render={({ onChange, ...props }) => (
									<FieldCounterpartyAutocomplete
										{...props}
										onChange={value => onChange(value)}
										type={selectedState?.counterparty_type}
										readOnly={!isEdit}
										label="Контрагент"
										fullWidth
										InputProps={{
											error: !!errors.counterparty,
											helperText: errors.counterparty?.message
										}}
									/>
								)}
							/>
						</Grid>
					</Grid>
				)}

				<Grid container spacing={4}>
					<Grid item md={6} xs={12}>
						<Controller
							as={<TextField />}
							control={control}
							fullWidth
							label="Исполнитель"
							select
							variant="outlined"
							name="executor"
							InputProps={{
								readOnly: !isEdit
							}}
							error={!!errors.executor}
							helperText={errors.executor?.message}
						>
							{users.map(item => (
								<MenuItem value={item.uuid} key={item.uuid}>
									{item.first_name} {item.last_name}
								</MenuItem>
							))}
						</Controller>
					</Grid>

					<Grid item md={6} xs={12}>
						<Controller
							as={<TextField />}
							control={control}
							fullWidth
							label="Ответственный"
							select
							variant="outlined"
							name="responsible"
							InputProps={{
								readOnly: !isEdit
							}}
							error={!!errors.responsible}
							helperText={errors.responsible?.message}
						>
							{!isCreated && <MenuItem value="">Не выбрано</MenuItem>}
							{users.map(item => (
								<MenuItem value={item.uuid} key={item.uuid}>
									{item.first_name} {item.last_name}
								</MenuItem>
							))}
						</Controller>
					</Grid>
				</Grid>

				<Grid container spacing={4}>
					<Grid item md={6} xs={12}>
						<Controller
							as={<DatePickerField />}
							control={control}
							label="Дата операции"
							fullWidth
							name="plan_payment_date"
							readOnly={!isEdit}
							error={!!errors.plan_payment_date}
							helperText={errors.plan_payment_date?.message}
						/>
					</Grid>

					<Grid item md={6} xs={12}>
						<Controller
							as={<TextField />}
							control={control}
							fullWidth
							label="Описание"
							variant="outlined"
							multiline
							rows={4}
							name="description"
							InputProps={{
								readOnly: !isEdit
							}}
							error={!!errors.description}
							helperText={errors.description?.message}
						/>
					</Grid>
				</Grid>
			</>
		);
	}
);
FormFinance.defaultProps = {
	isCreated: false,
	isEdit: true,
	isShowFact: false,
	isEditFact: false,
	onAddCompany: () => {},
	onAddFinanceState: () => {},
	onAddMoneyAccount: () => {}
};
FormFinance.propTypes = {
	currencies: PropTypes.arrayOf(PropTypes.string).isRequired,
	users: PropTypes.array.isRequired,
	financeGroups: PropTypes.array.isRequired,
	isCreated: PropTypes.bool,
	isEdit: PropTypes.bool,
	isShowFact: PropTypes.bool,
	isEditFact: PropTypes.bool,
	onAddCompany: PropTypes.func,
	onAddFinanceState: PropTypes.func,
	onAddMoneyAccount: PropTypes.func
};
