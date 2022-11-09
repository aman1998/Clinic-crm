import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import { Grid, Divider, MenuItem } from '@material-ui/core';
import { Controller, useForm } from 'react-hook-form';
import { TextField, Button, SelectField, DatePickerField, CurrencyTextField, ServerAutocomplete } from '../../bizKITUi';
import FuseLoading from '../../../@fuse/core/FuseLoading';
import { useAlert, usePermissions } from '../../hooks';
import { ModalFinanceState } from '../ModalFinanceState';
import { ModalMoneyAccount } from '../ModalMoneyAccount';
import { FINANCE_STATE_TYPE_MOVING, COUNTERPARTY_TYPE_MONEY_ACCOUNT } from '../../services/finance/constants';
import { financeService, authService, ENTITY, ENTITY_DEPS, companiesService } from '../../services';
import { CASHIER_PERMISSIONS } from '../../services/auth/constants';
import { ErrorMessage } from '../ErrorMessage';
import { getFullName, removeEmptyValuesFromObject } from '../../utils';

import * as globalAuthSelectors from '../../auth/store/selectors/auth';

const defaultValues = {
	value: '',
	state: null,
	sender_money_account: '',
	recipient_money_account: '',
	paid_date_time: null,
	cashier: '',
	description: ''
};

export function FormFinanceTransfer({ financeActionUuid, onUpdate }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();
	const { hasPermission } = usePermissions();

	const currentUser = useSelector(globalAuthSelectors.currentUser);

	const { control, errors, getValues, setError, reset, watch } = useForm({
		mode: 'onBlur',
		defaultValues: {
			...defaultValues,
			cashier: hasPermission(CASHIER_PERMISSIONS) ? currentUser.data.uuid : ''
		}
	});
	const watchFields = watch(['sender_money_account', 'recipient_money_account']);

	const { isLoading: isLoadingListMoneyAccounts, data: listMoneyAccounts } = useQuery(
		[ENTITY.MONEY_ACCOUNT, { limit: Number.MAX_SAFE_INTEGER }],
		({ queryKey }) => companiesService.getMoneyAccounts(queryKey[1]).then(({ data }) => data)
	);

	// Self exclusion - if one state selected it should not be listed in another field
	// we should not have possibility to transfer money between the same money account
	const listSenderMoneyAccount =
		listMoneyAccounts?.results.filter(item => item.uuid !== watchFields.recipient_money_account) ?? [];
	const listRecipientMoneyAccount =
		listMoneyAccounts?.results.filter(item => item.uuid !== watchFields.sender_money_account) ?? [];

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
			...removeEmptyValuesFromObject({
				value: dataFinanceAction.value,
				paid_date_time: dataFinanceAction.paid_date_time,
				state: dataFinanceAction.state.uuid,
				cashier: dataFinanceAction.cashier.uuid,
				description: dataFinanceAction.description,
				sender_money_account: dataFinanceAction.sender_money_account.uuid,
				recipient_money_account: dataFinanceAction.recipient_money_account.uuid
			})
		});
	}, [dataFinanceAction, reset]);

	const [isShowModalFinanceState, setIsShowModalFinanceState] = useState(false);
	const [isShowModalMoneyAccount, setIsShowModalMoneyAccount] = useState(false);

	const createFinanceAction = useMutation(payload => financeService.createFinanceActions(payload));
	const handleOnCreateFinanceAction = () => {
		const fields = getValues();

		const data = {
			...fields,
			type: FINANCE_STATE_TYPE_MOVING
		};

		createFinanceAction
			.mutateAsync(data)
			.then(() => {
				ENTITY_DEPS.FINANCE_ACTION.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Перемещение средств успешно создана');
				reset(defaultValues);
				onUpdate();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать перемещение средств');
			});
	};

	const isEditable = !financeActionUuid;

	const isLoading =
		isLoadingListMoneyAccounts || isLoadingListCashier || (financeActionUuid && isLoadingFinanceAction);

	return (
		<>
			{isLoading ? (
				<div className="p-32">
					<FuseLoading />
				</div>
			) : isErrorFinanceAction ? (
				<ErrorMessage />
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
									onAdd={() => setIsShowModalFinanceState(true)}
									InputProps={{
										error: !!errors.state,
										helperText: errors.state?.message
									}}
									onFetchList={(name, limit) =>
										financeService
											.getFinanceStates({
												name,
												limit,
												type: FINANCE_STATE_TYPE_MOVING,
												counterparty_type: COUNTERPARTY_TYPE_MONEY_ACCOUNT
											})
											.then(({ data }) => data)
									}
									onFetchItem={uuid =>
										financeService.getFinanceStateByUuid(uuid).then(({ data }) => data)
									}
									onChange={value => onChange(value?.uuid ?? value)}
								/>
							)}
						/>

						<Grid container spacing={2}>
							<Grid item md={6} xs={12}>
								<Controller
									as={<SelectField />}
									control={control}
									className="mt-20"
									fullWidth
									label="Счёт отправителя"
									name="sender_money_account"
									type="text"
									variant="outlined"
									select
									InputProps={{
										readOnly: !isEditable
									}}
									addDisabled={!isEditable}
									error={!!errors.sender_money_account}
									helperText={errors.sender_money_account?.message}
									onAdd={() => setIsShowModalMoneyAccount(true)}
								>
									<MenuItem value="">Все</MenuItem>
									{listSenderMoneyAccount.map(item => (
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
									className="mt-20"
									fullWidth
									label="Счёт получателя"
									name="recipient_money_account"
									type="text"
									variant="outlined"
									InputProps={{
										readOnly: !isEditable
									}}
									addDisabled={!isEditable}
									error={!!errors.recipient_money_account}
									helperText={errors.recipient_money_account?.message}
									onAdd={() => setIsShowModalMoneyAccount(true)}
								>
									<MenuItem value="">Все</MenuItem>
									{listRecipientMoneyAccount.map(item => (
										<MenuItem key={item.uuid} value={item.uuid}>
											{item.name}
										</MenuItem>
									))}
								</Controller>
							</Grid>
						</Grid>

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
					type: FINANCE_STATE_TYPE_MOVING,
					counterparty_type: COUNTERPARTY_TYPE_MONEY_ACCOUNT
				}}
			/>
			{isShowModalMoneyAccount && <ModalMoneyAccount isOpen onClose={() => setIsShowModalMoneyAccount(false)} />}
		</>
	);
}
FormFinanceTransfer.defaultProps = {
	financeActionUuid: null,
	onUpdate: () => {}
};
FormFinanceTransfer.propTypes = {
	financeActionUuid: PropTypes.string,
	onUpdate: PropTypes.func
};
