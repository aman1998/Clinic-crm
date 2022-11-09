import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { NavigateNext as NavigateNextIcon } from '@material-ui/icons';
import { FormTask } from 'app/common/ModalTask/FormTask';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { Button, DialogTemplate, DropzoneArea } from 'app/bizKITUi';
import { Breadcrumbs, debounce, Typography } from '@material-ui/core';
import { CardComment, CardHistory, Comments } from 'app/common/Comments';
import { Link } from 'react-router-dom';
import { FormCheckLists } from 'app/common/ModalTask/FormCheckLists';

export const ModalLead = ({ onClose }) => {
	const form = useForm({
		mode: 'onBlur',
		defaultValues: {
			checklist: []
		}
	});
	// const { watch, reset, getValues, setError, control, setValue } = form;
	const { control } = form;

	const callbackDebounce = useCallback(
		debounce(fn => fn(), 500),
		[]
	);

	const readOnlyFields = {
		name: false,
		text: false,
		plan_end_at: false,
		assignee: false,
		patient: false,
		reception: false,
		stage: false
	};

	const updateChecklist = checklist => {};

	return (
		<>
			<DialogTemplate
				isOpen
				onClose={onClose}
				fullScreen
				fullWidth
				headerFull
				// isLoading={isLoading}
				header={
					<div className="flex justify-between">
						<Typography color="secondary" className="text-xl font-bold text-center">
							Новая задача
						</Typography>

						<Button textNormal className="rounded-full mr-12" customColor="secondary" variant="outlined">
							Срыв завершения
						</Button>
					</div>
				}
				leftContent={
					<>
						<Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} className="mb-20">
							<Link to="/patients">Пациенты</Link>
							<Link to="/patients/patientUuid">Пациентов П. П.</Link>
						</Breadcrumbs>

						<FormProvider {...form}>
							<FormTask readOnlyFields={readOnlyFields} />
						</FormProvider>

						<Typography className="font-bold mt-20 mb-10 text-base" color="secondary">
							Чек-листы
						</Typography>
						<Controller
							control={control}
							name="checklist"
							render={({ value, onChange }) => (
								<FormCheckLists
									lists={value}
									onChange={newChecklists => {
										callbackDebounce(() => updateChecklist(newChecklists));
										onChange(newChecklists);
									}}
								/>
							)}
						/>

						<Typography className="font-bold mt-20 text-base" color="secondary">
							Прикрепленные файлы
						</Typography>
						<DropzoneArea
							dropzoneText="Перетащите файл сюда или нажмите для загрузки"
							// disabled={!(isNew || isEdit)}
							// files={attachmentsToUpload}
							// serverFiles={currentAttachments}
							// onAddFiles={setAttachmentsToUpload}
							// onDeleteFile={setAttachmentsToUpload}
							// onDeleteServerFile={index =>
							// setAttachmentsToDelete([...attachmentsToDelete, taskData.attachment[index].uuid])
							// }
						/>
					</>
				}
				// rightContent={<>right</>}
				// leftContent={
				// 	isError ? (
				// 		<ErrorMessage />
				// 	) : (
				// 		<FormProvider {...form}>
				// 			<FormBasicInfo
				// 				isAcceptance
				// 				isEdit={formIsEdit}
				// 				isNew={isNewWaybill}
				// 				onAddWriteOffReason={() =>
				// 					modalPromise.open(({ onClose: onCloseModal }) => (
				// 						<ModalWaybillsWriteOffReason isOpen onClose={onCloseModal} />
				// 					))
				// 				}
				// 			/>

				// 			<div className="mt-40">
				// 				<div className="flex justify-between ">
				// 					<Typography color="secondary" className="text-base font-bold">
				// 						Список товаров
				// 					</Typography>

				// 					<Button textNormal disabled={!formIsEdit} onClick={handleOnClickAddProduct}>
				// 						Добавить товар
				// 					</Button>
				// 				</div>

				// 				<div className="mt-20" style={{ opacity: isLoadingProduct ? 0.3 : 1 }}>
				// 					<TableProducts
				// 						isEdit={formIsEdit}
				// 						isCreatedBySystem={isCreatedBySystem}
				// 						initialList={productList}
				// 						onChangeList={setProductList}
				// 						onEditItem={handleOnUpdateProductItem}
				// 						onDeleteItem={handleOnDeleteProductItem}
				// 					/>
				// 				</div>
				// 			</div>
				// 		</FormProvider>
				// 	)
				// }
				rightContent={
					<Comments
						history={
							<>
								<div className="mb-20">
									<CardHistory fullName="fullName" message="message" date="2021-02-01" />
								</div>
							</>
						}
						comments={
							<>
								<div className="mb-20">
									<CardComment
										comment={{
											fullName: 'Алиса',
											text:
												'А ещё реплицированные с зарубежных источников, современные исследования освещают чрезвычайно интересные особенности картины в целом, выводы описаны максимально подробно! ',
											createdAt: new Date()
										}}
									/>
								</div>
							</>
						}
						// addComment={handleOnAddComment}
					/>
				}
				footer={
					<>
						{2 > 0 ? (
							<div className="flex">
								<Button className="mr-20" variant="contained" color="primary" textNormal>
									Сохранить
								</Button>
								<Button textNormal customColor="primary">
									Завершить
								</Button>
							</div>
						) : (
							<Button textNormal>Изменить</Button>
						)}
					</>
				}
			/>
			Body
		</>
	);
};

ModalLead.defaultProps = {};

ModalLead.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired
};
