import React, { useEffect, useMemo, useState } from 'react';
import { MenuItem, Typography } from '@material-ui/core';
import { useForm, Controller } from 'react-hook-form';
import PropTypes from 'prop-types';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useUniqueId } from '../../hooks/useUniqueId/useUniqueId';
import { Button, TextField, SelectField, DrawerTemplate } from '../../bizKITUi';
import { ModalGlobalFinanceGroup } from '../ModalGlobalFinanceGroup';
import { ENTITY, ENTITY_DEPS, globalFinanceService } from '../../services';
import { useAlert } from '../../hooks';
import { ErrorMessage } from '../ErrorMessage';
import {
	GROUP_TYPE_SPENDING,
	GROUP_TYPE_COMING,
	GROUP_TYPE_MOVING,
	COUNTERPARTY_TYPE_MONEY_ACCOUNT
} from '../../services/globalFinance/constants';
import { defaults } from '../../utils';
import { SelectFinanceType } from '../SelectFinanceType';

const defaultValues = {
	name: '',
	type: GROUP_TYPE_COMING,
	global_finance_group: '',
	counterparty_type: ''
};

export function ModalGlobalFinanceState({ isOpen, initialValues, stateUuid, onClose }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();
	const uniqueIdForm = useUniqueId();

	const { control, errors, getValues, setError, clearErrors, watch, setValue, reset } = useForm({
		mode: 'onBlur',
		defaultValues: defaults(initialValues, defaultValues)
	});
	const watchFields = watch(['type', 'global_finance_group', 'counterparty_type']);

	const { data: state, isLoading: isLoadingState, isError: isErrorState } = useQuery(
		[ENTITY.GLOBAL_FINANCE_STATE, stateUuid],
		() => {
			if (stateUuid) {
				return globalFinanceService.getState(stateUuid);
			}
			return Promise.resolve();
		}
	);
	useEffect(() => {
		if (!state) {
			return;
		}

		reset({
			...defaults(
				{
					...state,
					global_finance_group: state.global_finance_group.uuid,
					type: state.global_finance_group.type
				},
				defaultValues
			)
		});
	}, [getValues, reset, state]);

	const { isLoading: isLoadingGroups, isError: isErrorGroups, data: groups } = useQuery(
		[ENTITY.GLOBAL_FINANCE_GROUP],
		() => globalFinanceService.getGroups({ limit: Number.MAX_SAFE_INTEGER })
	);
	const groupsByCounterpartyType = groups?.results.filter(item => item.type === watchFields.type);

	const counterpartyTypeList = useMemo(() => {
		const list = globalFinanceService.getCounterpartyTypeList();

		if ([GROUP_TYPE_COMING, GROUP_TYPE_SPENDING].includes(watchFields.type)) {
			return list.filter(item => item.type !== COUNTERPARTY_TYPE_MONEY_ACCOUNT);
		}

		if (watchFields.type === GROUP_TYPE_MOVING) {
			return list.filter(item => item.type === COUNTERPARTY_TYPE_MONEY_ACCOUNT);
		}

		return list;
	}, [watchFields.type]);

	const createState = useMutation(params => globalFinanceService.createState(params));
	const handleOnCreateState = () => {
		clearErrors();

		createState
			.mutateAsync(getValues())
			.then(() => {
				alertSuccess('Новая статья финансовых операций успешно создана');

				ENTITY_DEPS.GLOBAL_FINANCE_STATE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});

				onClose();
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать новую статью финансовых операций');
			});
	};

	const updateState = useMutation(({ uuid, payload }) => globalFinanceService.updateState(uuid, payload));
	const handleOnUpdateState = () => {
		clearErrors();

		updateState
			.mutateAsync({ uuid: stateUuid, payload: getValues() })
			.then(() => {
				alertSuccess('Финансовая статья успешно обновлена');

				onClose();

				ENTITY_DEPS.GLOBAL_FINANCE_STATE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось обновить финансовую статью');
			});
	};

	const handleOnSubmit = event => {
		event.preventDefault();

		if (stateUuid) {
			handleOnUpdateState();
		} else {
			handleOnCreateState();
		}
	};

	const [isShowModalGlobalFinanceGroup, setIsShowModalGlobalFinanceGroup] = useState(false);

	const title = stateUuid ? 'Изменение статьи' : 'Новая статья финансовых операций';

	const isLoading = isLoadingState || isLoadingGroups;
	const isError = isErrorState || isErrorGroups;

	return (
		<>
			<DrawerTemplate
				isOpen={isOpen}
				close={onClose}
				isLoading={isLoading}
				width="md"
				header={
					<Typography color="secondary" className="text-xl font-bold text-center">
						{title}
					</Typography>
				}
				content={
					isError ? (
						<ErrorMessage />
					) : isLoading ? (
						<></>
					) : (
						<form id={uniqueIdForm} onSubmit={handleOnSubmit}>
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

							<div className="mb-24 max-w-sm">
								<Controller
									control={control}
									name="type"
									render={({ onChange, onBlur, value }) => (
										<SelectFinanceType
											checked={value}
											name="type"
											onChange={event => {
												onChange(Number(event.target.value));
												setValue('global_finance_group', '');
												setValue('counterparty_type', '');
											}}
											valueComing={GROUP_TYPE_COMING}
											valueSpending={GROUP_TYPE_SPENDING}
											valueMoving={GROUP_TYPE_MOVING}
											onBlur={onBlur}
										/>
									)}
								/>
							</div>

							<div className="mb-24">
								<Controller
									as={<SelectField />}
									control={control}
									fullWidth
									label="Группа статей"
									onAdd={() => setIsShowModalGlobalFinanceGroup(true)}
									name="global_finance_group"
									error={!!errors.global_finance_group}
									helperText={errors.global_finance_group?.message}
								>
									{groupsByCounterpartyType.map(item => (
										<MenuItem value={item.uuid} key={item.uuid}>
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
							disabled={createState.isLoading || updateState.isLoading}
							textNormal
							type="submit"
						>
							Сохранить
						</Button>
					)
				}
			/>

			{isShowModalGlobalFinanceGroup && (
				<ModalGlobalFinanceGroup
					isOpen
					width="sm"
					initialValues={{
						type: watchFields.type
					}}
					onClose={() => setIsShowModalGlobalFinanceGroup(false)}
				/>
			)}
		</>
	);
}
ModalGlobalFinanceState.defaultProps = {
	initialValues: {},
	stateUuid: null
};
ModalGlobalFinanceState.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	initialValues: PropTypes.shape({
		name: PropTypes.string,
		global_finance_group: PropTypes.string,
		type: PropTypes.oneOf(globalFinanceService.getGroupsTypeList().map(item => item.type)),
		counterparty_type: PropTypes.oneOf(globalFinanceService.getCounterpartyTypeList().map(item => item.type))
	}),
	stateUuid: PropTypes.string,
	onClose: PropTypes.func.isRequired
};
