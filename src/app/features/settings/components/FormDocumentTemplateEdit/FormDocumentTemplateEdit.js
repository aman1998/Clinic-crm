import React, { useEffect, useState } from 'react';
import Props from 'prop-types';
import {
	Card,
	CardContent,
	CardHeader,
	Grid,
	Link,
	Table,
	TableCell,
	TableRow,
	TableHead,
	TableBody
} from '@material-ui/core';
import { Controller, useForm } from 'react-hook-form';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import moment from 'moment';
import { Edit, Check } from '@material-ui/icons';
import { TextField, DropzoneArea, Button } from '../../../../bizKITUi';
import { ENTITY, ENTITY_DEPS, documentsService } from '../../../../services';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { useAlert } from '../../../../hooks';
import { defaults } from '../../../../utils';
import { DocumentTemplateServices } from './DocumentTemplateServices';

const defaultValues = {
	name: '',
	file: null,
	custom_fields: null
};

export function FormDocumentTemplateEdit({ documentTemplateUuid }) {
	const { alertError, alertSuccess } = useAlert();
	const queryClient = useQueryClient();

	const [isEdit, setIsEdit] = useState(false);

	const { control, reset, clearErrors, getValues } = useForm({
		defaultValues
	});

	const { data, isLoading, isError } = useQuery([ENTITY.DOCUMENT_TEMPLATE, documentTemplateUuid], ({ queryKey }) =>
		documentsService.getDocumentTemplate(queryKey[1])
	);

	useEffect(() => {
		if (!data) {
			return;
		}
		reset(defaults(data, defaultValues));
	}, [data, reset]);

	const {
		mutateAsync: updateDocumentTemplate,
		isLoading: isLoadingUpdateDocumentTemplate
	} = useMutation(({ uuid, payload }) => documentsService.patchDocumentTemplate(uuid, payload));
	const handleOnChangeDocumentTemplate = payload => {
		clearErrors();

		updateDocumentTemplate({ payload, uuid: documentTemplateUuid })
			.then(() => {
				ENTITY_DEPS.DOCUMENT_TEMPLATE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});

				alertSuccess('Документ успешно обновлено!');
				setIsEdit(false);
			})
			.catch(() => {
				alertError('Не удалось изменить документ');
			});
	};

	const {
		mutateAsync: updateFileDocumentTemplate,
		isLoading: isLoadingUpdateFileDocumentTemplate
	} = useMutation(({ uuid, payload }) => documentsService.updateFileDocumentTemplate(uuid, payload));
	const handleOnChangeFileDocumentTemplate = file => {
		clearErrors();

		updateFileDocumentTemplate({ payload: file, uuid: documentTemplateUuid })
			.then(() => {
				ENTITY_DEPS.DOCUMENT_TEMPLATE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});

				alertSuccess('Шаблон документ успешно загружен!');
				setIsEdit(false);
			})
			.catch(() => {
				alertError('Не удалось загрузить шаблон документ');
			});
	};

	if (isLoading) {
		return <FuseLoading />;
	}
	if (isError) {
		return <ErrorMessage />;
	}

	const dateString = moment(data.modified_at).format('DD MMMM YYYY, HH:mm');
	const fileName = data.file?.split('/').pop() ?? 'Шаблон документа';
	const isReadOnly = !(isEdit || isLoadingUpdateDocumentTemplate);

	return (
		<Grid container spacing={4}>
			<Grid item md={6} xs={12}>
				<Card>
					<CardHeader
						title={
							<Typography color="secondary" variant="body1">
								Основная информация
							</Typography>
						}
						action={
							isEdit ? (
								<Button
									textNormal
									variant="text"
									color="primary"
									size="small"
									startIcon={<Check />}
									disabled={isLoadingUpdateDocumentTemplate}
									onClick={() => handleOnChangeDocumentTemplate(getValues())}
								>
									Сохранить
								</Button>
							) : (
								<Button
									textNormal
									variant="text"
									size="small"
									startIcon={<Edit />}
									onClick={() => setIsEdit(true)}
								>
									Редактировать
								</Button>
							)
						}
					/>
					<Divider />
					<CardContent>
						<Controller
							as={<TextField />}
							control={control}
							name="name"
							label="Наименование документа"
							fullWidth
							defaultValue=""
							variant="outlined"
							InputProps={{
								readOnly: isReadOnly
							}}
						/>
					</CardContent>
				</Card>

				<Card className="mt-32">
					<CardHeader
						title={
							<Typography color="secondary" variant="body1">
								Шаблон документа
							</Typography>
						}
					/>
					<Divider />
					<CardContent>
						{data.file && (
							<div className="pb-32 flex justify-between items-center">
								<div className="truncate">
									<Link href={data.file} target="_blank">
										{fileName}
									</Link>
								</div>
								<div className="whitespace-no-wrap">{dateString}</div>
							</div>
						)}

						<Typography color="secondary" variant="subtitle2">
							Загрузить новый шаблон
						</Typography>
						<DropzoneArea
							dropzoneText="Перетащите файл сюда или нажмите для загрузки"
							disabled={isLoadingUpdateFileDocumentTemplate}
							onAddFiles={files => {
								handleOnChangeFileDocumentTemplate(files[0]);
							}}
						/>

						<Table className="mt-10" size="small" aria-label="a dense table">
							<TableHead>
								<TableRow>
									<TableCell>Название</TableCell>
									<TableCell>Ключ</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{documentsService.getDocumentWordMasks().map(wordMask => (
									<TableRow key={wordMask.key}>
										<TableCell>{wordMask.description}</TableCell>
										<TableCell>{`{{ ${wordMask.key} }}`}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</Grid>
			<Grid item md={6} xs={12}>
				<DocumentTemplateServices initialList={data || []} documentTemplateUuid={documentTemplateUuid} />
			</Grid>
		</Grid>
	);
}

FormDocumentTemplateEdit.propTypes = {
	documentTemplateUuid: Props.string.isRequired
};
