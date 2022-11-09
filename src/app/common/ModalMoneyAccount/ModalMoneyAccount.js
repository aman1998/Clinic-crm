import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import { Typography, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@material-ui/core';
import { useUniqueId } from '../../hooks/useUniqueId/useUniqueId';
import { Button, TextField, DrawerTemplate, MenuItem, CurrencyTextField } from '../../bizKITUi';
import { MONEY_ACCOUNT_TYPE_CASH, TYPE_CATEGORY_CASH } from '../../services/companies/constants';
import { companiesService, ENTITY, ENTITY_DEPS } from '../../services';
import { ErrorMessage } from '../ErrorMessage';
import { useAlert } from '../../hooks';
import { defaults } from '../../utils';

const defaultValues = {
	name: '',
	category: TYPE_CATEGORY_CASH,
	linked_account: '',
	type: MONEY_ACCOUNT_TYPE_CASH,
	balance: null,
	number: '',
	bank: '',
	bik: ''
};

export function ModalMoneyAccount({ isOpen, onClose, moneyAccountUuid }) {
	const queryClient = useQueryClient();
	const uniqueIdForm = useUniqueId();
	const { alertSuccess, alertError } = useAlert();

	const { control, errors, getValues, watch, setError, reset, setValue } = useForm({
		mode: 'onBlur',
		defaultValues
	});
	const watchFields = watch(['type', 'category']);

	const { isLoading: isLoadingMoneyAccount, isError: isErrorMoneyAccount, data: moneyAccount } = useQuery(
		[ENTITY.MONEY_ACCOUNT, moneyAccountUuid],
		({ queryKey }) => companiesService.getMoneyAccount(queryKey[1]),
		{ enabled: !!moneyAccountUuid }
	);

	useEffect(() => {
		if (!moneyAccount) {
			return;
		}

		reset(defaults(moneyAccount, defaultValues));
	}, [moneyAccount, reset]);

	const {
		isLoading: isLoadingListMoneyAccounts,
		isError: errorListMoneyAccounts,
		data: listMoneyAccounts
	} = useQuery([ENTITY.MONEY_ACCOUNT, { limit: Number.MAX_SAFE_INTEGER }], ({ queryKey }) =>
		companiesService.getMoneyAccounts(queryKey[1]).then(({ data }) => data)
	);

	const listLinkedAccount = listMoneyAccounts?.results.filter(item => item.category !== watchFields.category) ?? [];

	const isShowCashFields = watchFields.type !== MONEY_ACCOUNT_TYPE_CASH;

	const createMoneyAccount = useMutation(payload => companiesService.createMoneyAccounts(payload));
	const handleOnCreateMoneyAccount = event => {
		event.preventDefault();

		createMoneyAccount
			.mutateAsync(getValues())
			.then(() => {
				ENTITY_DEPS.MONEY_ACCOUNT.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Новый счёт успешно создан');
				onClose();
				reset(defaultValues);
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError(`Не удалось создать счёт ${error.userMessage}`);
			});
	};

	const updateMoneyAccount = useMutation(({ uuid, payload }) => companiesService.updateMoneyAccount(uuid, payload));
	const handleOnUpdateMoneyAccount = event => {
		event.preventDefault();

		updateMoneyAccount
			.mutateAsync({ uuid: moneyAccountUuid, payload: getValues() })
			.then(() => {
				ENTITY_DEPS.MONEY_ACCOUNT.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Счёт успешно обновлён');
				onClose();
				reset(defaultValues);
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError(`Не удалось обновить счёт ${error.userMessage}`);
			});
	};

	const action = moneyAccountUuid ? handleOnUpdateMoneyAccount : handleOnCreateMoneyAccount;

	return (
		<>
			<DrawerTemplate
				isOpen={isOpen}
				close={onClose}
				width="sm"
				isLoading={isLoadingListMoneyAccounts || isLoadingMoneyAccount}
				header={
					<Typography color="secondary" className="text-xl font-bold text-center">
						{moneyAccountUuid ? 'Редактирование счёта' : 'Новый счет'}
					</Typography>
				}
				content={
					isLoadingListMoneyAccounts || isLoadingMoneyAccount ? (
						<></>
					) : errorListMoneyAccounts || isErrorMoneyAccount ? (
						<ErrorMessage />
					) : (
						<form id={uniqueIdForm} onSubmit={action}>
							<Controller
								as={<TextField />}
								control={control}
								fullWidth
								label="Наименование"
								name="name"
								type="text"
								margin="normal"
								variant="outlined"
								error={!!errors.name}
								helperText={errors.name?.message}
							/>

							<Controller
								control={control}
								name="category"
								render={({ onChange, ...props }) => (
									<TextField
										{...props}
										fullWidth
										label="Тип счета"
										type="text"
										margin="normal"
										variant="outlined"
										select
										error={!!errors.category}
										helperText={errors.category?.message}
										onChange={event => {
											setValue('linked_account', '');
											onChange(event);
										}}
									>
										{companiesService.getListCategoryTypes().map(item => (
											<MenuItem key={item.type} value={item.type}>
												{item.name}
											</MenuItem>
										))}
									</TextField>
								)}
							/>

							<Controller
								as={<TextField />}
								control={control}
								fullWidth
								label="Связанный счет"
								name="linked_account"
								type="text"
								margin="normal"
								variant="outlined"
								select
								error={!!errors.linked_account}
								helperText={errors.linked_account?.message}
							>
								{listLinkedAccount.map(item => (
									<MenuItem key={item.uuid} value={item.uuid}>
										{item.name}
									</MenuItem>
								))}
							</Controller>

							<FormControl component="fieldset" className="my-16">
								<FormLabel component="legend">Тип счета</FormLabel>

								<Controller
									as={<RadioGroup />}
									control={control}
									name="type"
									type="text"
									variant="outlined"
									row
								>
									{companiesService.getListMoneyAccountTypes().map(item => (
										<FormControlLabel
											key={item.type}
											value={item.type}
											control={<Radio color="primary" />}
											label={item.name}
										/>
									))}
								</Controller>
							</FormControl>

							{isShowCashFields && (
								<>
									<Controller
										control={control}
										name="balance"
										render={({ value, onChange, onBlur }) => (
											<CurrencyTextField
												margin="normal"
												variant="outlined"
												label="Баланс"
												fullWidth
												className="mt-16"
												value={value}
												readOnly={!!moneyAccountUuid}
												InputProps={{ readOnly: !!moneyAccountUuid }}
												error={!!errors.balance}
												helperText={errors.balance?.message}
												onBlur={onBlur}
												onChange={(_, newValue) => onChange(newValue)}
											/>
										)}
									/>

									<Controller
										as={<TextField />}
										control={control}
										fullWidth
										label="Номер счета (ИИК)"
										name="number"
										type="text"
										margin="normal"
										variant="outlined"
										error={!!errors.number}
										helperText={errors.number?.message}
									/>

									<Controller
										as={<TextField />}
										control={control}
										fullWidth
										label="Банк"
										name="bank"
										type="text"
										margin="normal"
										variant="outlined"
										error={!!errors.bank}
										helperText={errors.bank?.message}
									/>

									<Controller
										as={<TextField />}
										control={control}
										fullWidth
										label="БИК"
										name="bik"
										type="text"
										margin="normal"
										variant="outlined"
										error={!!errors.bik}
										helperText={errors.bik?.message}
									/>
								</>
							)}
						</form>
					)
				}
				footer={
					!errorListMoneyAccounts &&
					!isErrorMoneyAccount && (
						<Button
							form={uniqueIdForm}
							variant="contained"
							color="primary"
							disabled={createMoneyAccount.isLoading || updateMoneyAccount.isLoading}
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

ModalMoneyAccount.defaultProps = {
	moneyAccountUuid: null
};
ModalMoneyAccount.propTypes = {
	moneyAccountUuid: PropTypes.string,
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired
};
