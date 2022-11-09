import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { DropzoneArea } from '../../../../bizKITUi';
import { ENTITY, ENTITY_DEPS, operationService } from '../../../../services';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { useAlert, useConfirm } from '../../../../hooks';

export function BlockFiles({ stageUuid, disabled }) {
	const queryClient = useQueryClient();
	const [openModalConfirm] = useConfirm();
	const { alertSuccess, alertError } = useAlert();

	const { isLoading, isError, data } = useQuery(
		[ENTITY.OPERATION_CREATED_STAGE_ATTACHMENT, stageUuid],
		({ queryKey }) => operationService.getAttachmentInOperationCreatedStage(queryKey[1])
	);
	const filesResults = data?.map(item => item.file);

	const createAttachmentStage = useMutation(({ uuid, payload }) =>
		operationService.createAttachmentInOperationCreatedStage(uuid, payload)
	);
	const handleOnCreateAttachmentStage = files => {
		createAttachmentStage
			.mutateAsync({ uuid: stageUuid, payload: files[0] })
			.then(() => {
				ENTITY_DEPS.OPERATION_CREATED_STAGE_ATTACHMENT.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Файл успешно загружен');
			})
			.catch(() => {
				alertError('Не удалось загрузить файл');
			});
	};

	const deleteAttachmentStage = useMutation(({ uuid, payload }) =>
		operationService.deleteAttachmentInOperationCreatedStage(uuid, payload)
	);
	const handleOnDeleteAttachmentStage = index => {
		openModalConfirm({
			title: 'Удалить файл?',
			onSuccess: () => {
				const fileUuid = data[index].uuid;

				deleteAttachmentStage
					.mutateAsync({ uuid: stageUuid, payload: [{ uuid: fileUuid }] })
					.then(() => {
						ENTITY_DEPS.OPERATION_CREATED_STAGE_ATTACHMENT.forEach(dep => {
							queryClient.invalidateQueries(dep);
						});
						alertSuccess('Файл успешно удалён');
					})
					.catch(() => {
						alertError('Не удалось удалить файл');
					});
			}
		});
	};

	return (
		<>
			<Typography color="secondary" className="text-16 font-bold">
				Прикрепленные файлы
			</Typography>

			<div className="mt-10">
				{isError ? (
					<ErrorMessage />
				) : isLoading ? (
					<FuseLoading />
				) : (
					<DropzoneArea
						serverFiles={filesResults}
						filesLimit={1}
						dropzoneText="Перетащите файл сюда или нажмите для загрузки"
						disabled={disabled}
						onAddFiles={handleOnCreateAttachmentStage}
						onDeleteServerFile={handleOnDeleteAttachmentStage}
					/>
				)}
			</div>
		</>
	);
}
BlockFiles.propTypes = {
	stageUuid: PropTypes.string.isRequired,
	disabled: PropTypes.bool.isRequired
};
