import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Typography, makeStyles } from '@material-ui/core';
import _ from '@lodash';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { useSelector } from 'react-redux';
import {
	WAYBILL_TYPE_ACCEPTANCE,
	WAYBILL_TYPE_EXPENSE,
	WAYBILL_STATUS_PLAN,
	WAYBILL_STATUS_CONTROL,
	WAYBILL_STATUS_ACCEPTED,
	WAYBILL_STATUS_REWORK,
	WAYBILL_STATUS_CANCELED,
	WAYBILL_STATUS_COMPLETED
} from 'app/services/waybills/constants';
import { waybillsService, ENTITY_DEPS, ENTITY } from '../../services';
import { FormBasicInfo } from './FormBasicInfo';
import { DatePickerField, TextField, DialogTemplate, Button, DialogSimpleTemplate } from '../../bizKITUi';
import { Comments, CardHistory } from '../Comments';
import { ErrorMessage } from '../ErrorMessage';
import { useAlert } from '../../hooks';
import { ModalAccept } from './ModalAccept';
import { ModalRework } from './ModalRework';
import { ModalReject } from './ModalReject';
import { TableProducts } from './TableProducts';
import { ModalSelectProduct } from './ModalSelectProduct';
import { ModalSelectProductByWarehouses } from './ModalSelectProductByWarehouses';
import * as globalAuthSelectors from '../../auth/store/selectors/auth';
import { useProduct } from '../hooks/useProduct';
import { ModalProduct } from '../ModalProduct';
import { ModalProductCount } from './ModalProductCount';
import { ModalWaybillsWriteOffReason } from '../ModalWaybillsWriteOffReason';
import { CardComment } from './CardComment';
import { modalPromise } from '../ModalPromise';
import { defaults } from '../../utils';
import { normalizeNumberType } from '../../utils/normalizeNumber';

const defaultValues = {
	type: WAYBILL_TYPE_ACCEPTANCE,
	responsible: null,
	assignee: null,
	sender: null,
	recipient: null,
	deadline: null,
	comment: '',
	status: '',
	reason: null,
	number: null,
	date_time: new Date()
};

const useStyles = makeStyles(theme => ({
	header: {
		display: 'flex',
		justifyContent: 'space-between',
		[theme.breakpoints.down(768)]: {
			flexDirection: 'column',
			justifyContent: 'flex-start',
			alignItems: 'flex-start'
		}
	},
	headerFields: {
		display: 'flex',
		marginRight: 24,
		[theme.breakpoints.down(560)]: {
			marginTop: 16,
			flexDirection: 'column'
		}
	},
	leftBtns: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 250px))',
		[theme.breakpoints.down(400)]: {
			gridTemplateColumns: '1fr',
			width: '100%'
		}
	},
	rightBtns: {
		display: 'grid',
		gridTemplateColumns: 'repeat(3, 200px)',
		marginLeft: 'auto',
		[theme.breakpoints.down(768)]: {
			gridTemplateColumns: 'repeat(2, 200px)'
		},
		[theme.breakpoints.down(400)]: {
			gridTemplateColumns: '1fr',
			width: '100%'
		}
	},
	button: {
		height: 36
	},
	approveBtn: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, 200px)',
		[theme.breakpoints.down(400)]: {
			gridTemplateColumns: '1fr',
			width: '100%'
		}
	},
	footer: {
		display: 'grid',
		gridTemplateColumns: 'repeat(2, 1fr)',
		width: '100%',
		[theme.breakpoints.down(1200)]: {
			gridTemplateColumns: '1fr'
		}
	}
}));

export function ModalWaybill({ isOpen, waybillUuid, onClose, count }) {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();

	const classes = useStyles();

	const [currentWaybillUuid, setCurrentWaybillUuid] = useState(waybillUuid);
	const { isLoading: isLoadingWaybill, isError: isErrorWaybill, data: dataWaybill } = useQuery(
		[ENTITY.WAYBILL, currentWaybillUuid],
		() => waybillsService.getWaybill(currentWaybillUuid).then(res => res.data),
		{ enabled: !!currentWaybillUuid }
	);

	const currentUser = useSelector(globalAuthSelectors.currentUser);
	const [isEdit, setIsEdit] = useState(false);
	const formIsEdit = currentWaybillUuid ? isEdit : true;
	const dataNumber = dataWaybill?.number;
	const getDefaultNumber = useCallback(() => {
		if (currentWaybillUuid) return dataNumber;
		return Number(count) + 1;
	}, [count, currentWaybillUuid, dataNumber]);

	const form = useForm({
		mode: 'onBlur',
		defaultValues: { ...defaultValues, number: getDefaultNumber() }
	});

	const { watch, reset, getValues, setError, control, errors } = form;
	const watchFields = watch(['type', 'status', 'responsible', 'assignee', 'sender', 'date_time', 'number']);

	const isNewWaybill = !currentWaybillUuid;
	const isCreatedBySystem = !!dataWaybill?.created_by_system;

	const statusIsPlan = watchFields.status === WAYBILL_STATUS_PLAN;
	const statusIsControl = watchFields.status === WAYBILL_STATUS_CONTROL;
	const statusIsAccepted = watchFields.status === WAYBILL_STATUS_ACCEPTED;
	const statusIsRework = watchFields.status === WAYBILL_STATUS_REWORK;
	const statusIsCanceled = watchFields.status === WAYBILL_STATUS_CANCELED;
	const statusIsCompleted = watchFields.status === WAYBILL_STATUS_COMPLETED;

	const typeIsAcceptance = watchFields.type === WAYBILL_TYPE_ACCEPTANCE;
	const typeIsExpense = watchFields.type === WAYBILL_TYPE_EXPENSE;

	const isCurrentUserResponsible = watchFields.responsible === currentUser.data.uuid;
	const isCurrentUserAssignee = watchFields.assignee === currentUser.data.uuid;

	useEffect(() => {
		if (!dataWaybill) {
			return;
		}
		setCurrentWaybillUuid(dataWaybill.uuid);
		reset(
			defaults(
				{
					type: dataWaybill.type,
					responsible: dataWaybill.responsible?.uuid,
					assignee: dataWaybill.assignee?.uuid,
					sender: dataWaybill.sender?.uuid,
					recipient: dataWaybill.recipient?.uuid,
					deadline: dataWaybill.deadline,
					comment: dataWaybill.comment,
					status: dataWaybill.status,
					reason: dataWaybill.reason?.uuid,
					number: getDefaultNumber()
				},
				defaultValues
			)
		);
	}, [dataWaybill, reset, getDefaultNumber]);

	const [productList, setProductList] = useState([]);
	const [isShowModalSelectProduct, setIsShowModalSelectProduct] = useState(false);
	const [isShowModalSelectProductByWarehouses, setIsShowModalSelectProductByWarehouses] = useState(false);

	const handleOnClickAddProduct = () => {
		if (typeIsAcceptance) {
			setIsShowModalSelectProduct(true);
			return;
		}

		setIsShowModalSelectProductByWarehouses(true);
	};

	useEffect(() => {
		if (!dataWaybill) {
			return;
		}
		const list = dataWaybill.items?.map(item => ({
			uuid: item.uuid,
			waybill: currentWaybillUuid,
			product: item.product.uuid,
			plan_amount: Number(item.plan_amount),
			fact_amount: Number(item.fact_amount),
			plan_cost: Number(item.plan_cost),
			name: item.product.name,
			manufacturer: item.product.manufacturer ?? '',
			provider: item.product.provider?.name ?? '',
			packing: item.packing,
			packing_unit: item.packing_unit ?? null,
			minimum_unit_of_measure: item.minimum_unit_of_measure,
			amount_in_package: item.amount_in_package ?? 0
		}));

		setProductList(list ?? []);
	}, [dataWaybill, currentWaybillUuid]);

	const handleOnAddProductFromSelect = product => {
		const hasProductInList = productList.some(item => item.product === product.uuid);
		if (hasProductInList) {
			alertError(`${product.name} - уже есть в таблице товаров`);
			return;
		}

		setProductList([
			...productList,
			{
				product: product.uuid,
				plan_amount: 0,
				fact_amount: 0,
				plan_cost: product.purchase_price,
				name: product.name,
				manufacturer: product.manufacturer ?? '',
				provider: product.provider?.name ?? '',
				packing: product.minimum_unit_of_measure,
				packing_unit: product.packing_unit ?? null,
				minimum_unit_of_measure: product.minimum_unit_of_measure,
				amount_in_package: product.amount_in_package ?? 0
			}
		]);
	};

	const handleOnDeleteProductItem = product => {
		let newList;

		if (product.remnants) {
			newList = productList.filter(item => item.remnants !== product.remnants);
		} else {
			newList = productList.filter(item => item.product !== product.product);
		}

		setProductList(newList);
	};

	const [selectedProductForAddInProductList, setSelectedProductForAddInProductList] = useState(null);
	const handleOnAddProductFromProductCount = obj => {
		const isHasProductInList = productList.some(
			item => item.remnants === selectedProductForAddInProductList.warehouse.uuid
		);

		if (isHasProductInList) {
			alertError(`${selectedProductForAddInProductList.name} - уже есть в таблице товаров`);
			return;
		}

		setProductList([
			...productList,
			{
				product: selectedProductForAddInProductList.uuid,
				remnants: selectedProductForAddInProductList.warehouse.uuid,
				plan_amount: Number(obj.count),
				fact_amount: 0,
				plan_cost: Number(obj.cost),
				name: selectedProductForAddInProductList.name,
				manufacturer: selectedProductForAddInProductList.manufacturer ?? '',
				provider: selectedProductForAddInProductList.provider?.name ?? '',
				packing: selectedProductForAddInProductList.minimum_unit_of_measure,
				packing_unit: selectedProductForAddInProductList.packing_unit ?? null,
				minimum_unit_of_measure: selectedProductForAddInProductList.minimum_unit_of_measure,
				amount_in_package: selectedProductForAddInProductList.amount_in_package ?? 0
			}
		]);

		setSelectedProductForAddInProductList(null);
	};

	const { data: dataProduct, get: getProduct, isLoading: isLoadingProduct, error: errorProduct } = useProduct();
	const [selectedUuidProduct, setSelectedUuidProduct] = useState(null);
	useEffect(() => {
		if (!errorProduct) {
			return;
		}

		alertError('Не удалось обновить продукт в таблице');
	}, [errorProduct, alertError]);
	useEffect(() => {
		if (!dataProduct) {
			return;
		}

		setProductList(list => {
			const findIndex = list.findIndex(item => item.product === dataProduct.uuid);
			const newItem = {
				...list[findIndex],
				name: dataProduct.name,
				manufacturer: dataProduct.manufacturer ?? '',
				provider: dataProduct.provider?.name ?? '',
				packing: dataProduct.packing,
				packing_unit: dataProduct.packing_unit ?? null,
				minimum_unit_of_measure: dataProduct.minimum_unit_of_measure,
				amount_in_package: dataProduct.amount_in_package ?? 0
			};
			list.splice(findIndex, 1, newItem);
			return [...list];
		});
	}, [dataProduct]);
	const handleOnUpdateProductItem = uuid => {
		setSelectedUuidProduct(uuid);
	};

	const [isShowModalAccept, setIsShowModalAccept] = useState(false);
	const [isShowModalRework, setIsShowModalRework] = useState(false);
	const [isShowModalReject, setIsShowModalReject] = useState(false);

	const createWaybill = useMutation(payload => waybillsService.createWaybill(payload));
	const handleOnCreateWaybill = () => {
		const values = {
			...getValues(),
			items: productList.map(item => ({
				...item,
				packing: item.packing.uuid,
				packing_unit: item.packing_unit?.uuid ?? null,
				minimum_unit_of_measure: item.minimum_unit_of_measure.uuid
			}))
		};

		createWaybill
			.mutateAsync(values)
			.then(({ data }) => {
				ENTITY_DEPS.WAYBILL.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				setCurrentWaybillUuid(data.uuid);
				alertSuccess('Накладная успешно создана');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось создать накладную');
			});
	};

	const updateWaybill = useMutation(({ uuid, payload }) => waybillsService.updateWaybill(uuid, payload));
	const handleOnUpdateWaybill = () => {
		const values = {
			...getValues(),
			items: productList.map(item => ({
				...item,
				packing: item.packing.uuid,
				packing_unit: item.packing_unit?.uuid ?? null,
				minimum_unit_of_measure: item.minimum_unit_of_measure.uuid
			}))
		};

		updateWaybill
			.mutateAsync({ uuid: currentWaybillUuid, payload: values })
			.then(({ data }) => {
				ENTITY_DEPS.WAYBILL.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				setIsEdit(false);
				alertSuccess('Накладная успешно обновлена');
			})
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});

				alertError('Не удалось обновить накладную');
			});
	};

	const deleteWaybill = useMutation(({ uuid }) => waybillsService.deleteWaybill(uuid));
	const handleDeleteWaybill = callback => {
		deleteWaybill
			.mutateAsync({ uuid: currentWaybillUuid })
			.then(({ data }) => {
				ENTITY_DEPS.WAYBILL.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				onClose();
				callback();
				alertSuccess('Накладная успешно удалена');
			})
			.catch(() => {
				alertError('Не удалось удалить накладную');
			});
	};

	const sendToControl = useMutation(uuid => waybillsService.controlWaybill(uuid));
	const handleOnSendToControl = () => {
		sendToControl
			.mutateAsync(currentWaybillUuid)
			.then(({ data }) => {
				ENTITY_DEPS.WAYBILL.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Накладная успешно отправлена на контроль');
			})
			.catch(() => {
				alertError('Не удалось отправить на контроль');
			});
	};

	const finishWaybill = useMutation(({ uuid, payload }) => waybillsService.finishWaybill(uuid, payload));
	const handleOnFinishWaybill = () => {
		const modifyProductList = productList.map(item => ({
			...item,
			fact_cost: item.plan_cost
		}));

		finishWaybill
			.mutateAsync({ uuid: currentWaybillUuid, payload: { items: modifyProductList } })
			.then(({ data }) => {
				ENTITY_DEPS.WAYBILL.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Накладная успешно завершена');
			})
			.catch(() => {
				alertError('Не удалось подтвердить накладную');
			});
	};

	const addComment = useMutation(({ uuid, payload }) => waybillsService.addWaybillComment(uuid, payload));
	const handleOnAddComment = message => {
		const params = {
			text: message
		};

		addComment
			.mutateAsync({ uuid: dataWaybill.uuid, payload: params })
			.then(() => {
				ENTITY_DEPS.WAYBILL.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
			})
			.catch(() => {
				alertError('Не удалось добавить комментарий');
			});
	};

	const downloadWaybill = useMutation(uuid => waybillsService.downloadWaybill(uuid));
	const handleDownloadWaybill = () => {
		downloadWaybill.mutateAsync(currentWaybillUuid).catch(() => alertError('Не удалось скачать накладную'));
	};

	const isLoading = waybillUuid && !dataWaybill && isLoadingWaybill;
	const isError = isErrorWaybill;

	useEffect(() => {
		if (statusIsAccepted) {
			_.each(productList, item => {
				if (item.fact_amount === 0) item.fact_amount = item.plan_amount; // eslint-disable-line no-param-reassign
			});
		}
	}, [statusIsAccepted, productList]);

	return (
		<>
			<DialogTemplate
				isOpen={isOpen}
				onClose={onClose}
				fullScreen
				fullWidth
				headerFull
				isLoading={isLoading}
				header={
					<div className={classes.header}>
						<Typography color="secondary" className="text-xl font-bold text-center">
							Накладная {statusIsCompleted && !isNewWaybill && '(завершена)'}{' '}
							{statusIsCanceled && !isNewWaybill && '(отклонена)'}
						</Typography>
						<div className={`gap-10 ${classes.headerFields}`}>
							<Controller
								control={control}
								name="number"
								render={({ onChange }) => (
									<TextField
										label="Номер"
										variant="outlined"
										size="small"
										InputProps={{
											readOnly: currentWaybillUuid && !isEdit
										}}
										defaultValue={currentWaybillUuid ? dataWaybill?.number : Number(count) + 1}
										onKeyPress={normalizeNumberType}
										error={!!errors.number}
										helperText={errors.number?.message}
										onChange={onChange}
									/>
								)}
							/>

							<Controller
								control={control}
								name="date_time"
								render={({ onChange }) => (
									<DatePickerField
										className="date-picker__keyboard"
										inputVariant="outlined"
										label="Дата"
										size="small"
										readOnly={!!dataWaybill?.date_time && !isEdit}
										value={dataWaybill?.date_time}
										error={!!errors.date_time}
										helperText={errors.date_time?.message}
										onChange={onChange}
									/>
								)}
							/>
						</div>
					</div>
				}
				leftContent={
					isError ? (
						<ErrorMessage />
					) : (
						<FormProvider {...form}>
							<FormBasicInfo
								isAcceptance
								isEdit={formIsEdit}
								isNew={isNewWaybill}
								onAddWriteOffReason={() =>
									modalPromise.open(({ onClose: onCloseModal }) => (
										<ModalWaybillsWriteOffReason isOpen onClose={onCloseModal} />
									))
								}
							/>

							<div className="mt-40">
								<div className="flex justify-between ">
									<Typography color="secondary" className="text-base font-bold">
										Список товаров
									</Typography>

									<Button textNormal disabled={!formIsEdit} onClick={handleOnClickAddProduct}>
										Добавить товар
									</Button>
								</div>

								<div className="mt-20" style={{ opacity: isLoadingProduct ? 0.3 : 1 }}>
									<TableProducts
										isEdit={formIsEdit}
										isCreatedBySystem={isCreatedBySystem}
										initialList={productList}
										onChangeList={setProductList}
										onEditItem={handleOnUpdateProductItem}
										onDeleteItem={handleOnDeleteProductItem}
									/>
								</div>
							</div>
						</FormProvider>
					)
				}
				rightContent={
					<Comments
						history={
							<>
								{dataWaybill?.history?.map(item => (
									<div key={item.created_at} className="mb-20">
										<CardHistory
											fullName={item.user?.full_name ?? ''}
											message={item.message}
											date={item.created_at}
										/>
									</div>
								))}
							</>
						}
						comments={
							<>
								{dataWaybill?.comments?.map(comment => (
									<div key={comment.uuid} className="mb-20">
										<CardComment comment={comment} />
									</div>
								))}
							</>
						}
						addComment={handleOnAddComment}
						isDisableAdd={isNewWaybill}
					/>
				}
				footer={
					!isError && (
						<div className={`${classes.footer} gap-10`}>
							<div className={`${classes.leftBtns} gap-10`}>
								{isNewWaybill && (
									<Button
										className={classes.button}
										textNormal
										customColor="primary"
										disabled={createWaybill.isLoading}
										onClick={handleOnCreateWaybill}
									>
										Сохранить
									</Button>
								)}

								{statusIsAccepted && !isNewWaybill && !isEdit && (
									<Button
										className={classes.button}
										textNormal
										customColor="primary"
										disabled={finishWaybill.isLoading}
										onClick={handleOnFinishWaybill}
									>
										Подтвердить накладную
									</Button>
								)}

								{(((statusIsPlan || statusIsRework || statusIsAccepted) && !isNewWaybill) ||
									!isCreatedBySystem) &&
									(isEdit ? (
										<Button
											className={classes.button}
											textNormal
											customColor="primary"
											disabled={updateWaybill.isLoading}
											onClick={handleOnUpdateWaybill}
										>
											Сохранить
										</Button>
									) : (
										<Button
											className={classes.button}
											onClick={() => setIsEdit(true)}
											textNormal
											disabled={!isCurrentUserAssignee && !isCurrentUserResponsible}
										>
											Изменить
										</Button>
									))}

								{(statusIsPlan || statusIsRework) && !isNewWaybill && (
									<Button
										className={classes.button}
										textNormal
										disabled={!isCurrentUserAssignee || sendToControl.isLoading || isEdit}
										onClick={handleOnSendToControl}
									>
										Отправить на контроль
									</Button>
								)}

								{statusIsControl && !isNewWaybill && (
									<div className={`gap-10 ${classes.approveBtn}`}>
										<Button
											className={classes.button}
											textNormal
											customColor="primary"
											disabled={!isCurrentUserResponsible}
											onClick={() => setIsShowModalAccept(true)}
										>
											Утвердить накладную
										</Button>
										<Button
											className={classes.button}
											textNormal
											customColor="secondary"
											disabled={!isCurrentUserResponsible}
											onClick={() => setIsShowModalReject(true)}
										>
											Отклонить накладную
										</Button>
										<Button
											className={classes.button}
											textNormal
											disabled={!isCurrentUserResponsible}
											onClick={() => setIsShowModalRework(true)}
										>
											Вернуть на доработку
										</Button>
									</div>
								)}
							</div>

							{!isNewWaybill && (
								<div className={`gap-8 ${classes.rightBtns}`}>
									<Button
										className={classes.button}
										textNormal
										customColor="primary"
										disabled={downloadWaybill.isLoading}
										onClick={handleDownloadWaybill}
									>
										Скачать
									</Button>
									<Button
										className={classes.button}
										textNormal
										customColor="accent"
										onClick={() => setCurrentWaybillUuid(null)}
									>
										Копировать
									</Button>
									<Button
										className={classes.button}
										textNormal
										customColor="secondary"
										onClick={() =>
											modalPromise.open(({ onClose: close }) => (
												<DialogSimpleTemplate
													onClose={close}
													isOpen={isOpen}
													header={<div>Вы действительно хотите удалить накладную?</div>}
												>
													<div className="flex justify-end">
														<Button variant="text" textNormal onClick={close}>
															Нет
														</Button>
														<Button
															textNormal
															customColor="secondary"
															variant="outlined"
															disabled={deleteWaybill.isLoading}
															onClick={() => handleDeleteWaybill(close)}
														>
															Да
														</Button>
													</div>
												</DialogSimpleTemplate>
											))
										}
									>
										Удалить
									</Button>
								</div>
							)}
						</div>
					)
				}
			/>

			{isShowModalSelectProduct && (
				<ModalSelectProduct
					defaultProvider={getValues()?.sender}
					isOpen
					onClose={() => setIsShowModalSelectProduct(false)}
					onAdd={handleOnAddProductFromSelect}
				/>
			)}

			{isShowModalSelectProductByWarehouses && (
				<ModalSelectProductByWarehouses
					isOpen
					warehouseUuid={watchFields.sender}
					onClose={() => setIsShowModalSelectProductByWarehouses(false)}
					onAdd={setSelectedProductForAddInProductList}
				/>
			)}

			{selectedProductForAddInProductList && (
				<ModalProductCount
					isOpen
					productName={selectedProductForAddInProductList.name}
					productMeasureUnit={selectedProductForAddInProductList.minimum_unit_of_measure}
					cost={selectedProductForAddInProductList.warehouse.cost}
					productCount={selectedProductForAddInProductList.warehouse.amount}
					isShowSellingPrice={typeIsExpense}
					onAdd={handleOnAddProductFromProductCount}
					onClose={() => setSelectedProductForAddInProductList(null)}
				/>
			)}

			{selectedUuidProduct && (
				<ModalProduct
					isOpen
					onClose={() => setSelectedUuidProduct(null)}
					productUuid={selectedUuidProduct}
					onUpdate={getProduct}
				/>
			)}

			{isShowModalAccept && (
				<ModalAccept
					isOpen={isShowModalAccept}
					waybillUuid={currentWaybillUuid}
					onClose={() => setIsShowModalAccept(false)}
				/>
			)}

			{isShowModalRework && (
				<ModalRework
					isOpen={isShowModalRework}
					waybillUuid={currentWaybillUuid}
					onClose={() => setIsShowModalRework(false)}
				/>
			)}

			{isShowModalReject && (
				<ModalReject
					isOpen={isShowModalReject}
					waybillUuid={currentWaybillUuid}
					onClose={() => setIsShowModalReject(false)}
				/>
			)}
		</>
	);
}

ModalWaybill.defaultProps = {
	waybillUuid: null,
	count: null
};

ModalWaybill.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	waybillUuid: PropTypes.string,
	count: PropTypes.number
};
