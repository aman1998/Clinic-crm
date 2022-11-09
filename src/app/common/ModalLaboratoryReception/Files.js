import React from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { DropzoneArea } from '../../bizKITUi';
import { ErrorMessage } from '../ErrorMessage';
import { ENTITY, ENTITY_DEPS, laboratoryService } from '../../services';
import { useAlert } from '../../hooks';

export function Files({ receptionUuid }) {
	const { alertSuccess, alertError } = useAlert();
	const queryClient = useQueryClient();

	const { isLoading: isLoadingResults, isError: isErrorResults, data: results } = useQuery(
		[ENTITY.LABORATORY_RECEPTION_RESULTS, receptionUuid, { limit: 10, offset: 0 }],
		({ queryKey }) =>
			laboratoryService.getLaboratoryReceptionResults(receptionUuid, queryKey[2]).then(({ data }) => data),
		{ enabled: !!receptionUuid }
	);

	const filesResults = results?.map(item => item.file);

	const createResult = useMutation(({ uuid, payload }) =>
		laboratoryService.createLaboratoryReceptionResults(uuid, payload)
	);
	const handleOnCreateLaboratoryReceptions = files => {
		createResult
			.mutateAsync({ uuid: receptionUuid, payload: files })
			.then(() => {
				ENTITY_DEPS.LABORATORY_RECEPTION_RESULTS.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Файлы успешно загружены');
			})
			.catch(() => {
				alertError('Не удалось загрузить файлы');
			});
	};

	const deleteResult = useMutation(({ uuid, payload }) =>
		laboratoryService.deleteLaboratoryReceptionResults(uuid, payload)
	);
	const handleOnDeleteLaboratoryReception = index => {
		const fileUuid = results[index].uuid;

		deleteResult
			.mutateAsync({ uuid: receptionUuid, payload: { uuid: fileUuid } })
			.then(() => {
				ENTITY_DEPS.LABORATORY_RECEPTION_RESULTS.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Файл успешно удалён');
			})
			.catch(() => {
				alertError('Не удалось удалить файл');
			});
	};

	const isLoading = isLoadingResults || createResult.isLoading || deleteResult.isLoading;

	return (
		<>
			<DropzoneArea
				dropzoneText="Перетащите файл сюда или нажмите для загрузки"
				serverFiles={filesResults}
				disabled={isLoading}
				onAddFiles={handleOnCreateLaboratoryReceptions}
				onDeleteServerFile={handleOnDeleteLaboratoryReception}
			/>
			{isErrorResults && <ErrorMessage message="Не удалось загрузить список файлов" />}
		</>
	);
}
Files.propTypes = {
	receptionUuid: PropTypes.string.isRequired
};
