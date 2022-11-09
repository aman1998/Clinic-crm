import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, useTheme, Menu, MenuItem } from '@material-ui/core';
import { Event as EventIcon, Person as PersonIcon } from '@material-ui/icons';
import { useQuery } from 'react-query';
import moment from 'moment';
import { Amount, Button, Card } from '../../../../bizKITUi';
import { ModalDocumentContract } from '../../../../common/ModalDocumentContract';
import { modalPromise } from '../../../../common/ModalPromise';
import { KztOutlined } from '../../../../bizKITUi/Icons';
import { documentsService, ENTITY } from '../../../../services';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { getFullName } from '../../../../utils';

export function BlockDocuments({ stageUuid, documents, disabled }) {
	const theme = useTheme();

	const { isLoading, isError, data } = useQuery(
		[ENTITY.DOCUMENT_CONTRACT, { stage: stageUuid, limit: Number.MAX_SAFE_INTEGER }],
		({ queryKey }) => documentsService.getContractDocuments(queryKey[1])
	);

	const [anchorMenu, setAnchorMenu] = useState(null);
	const handleOnClickMenuItem = uuid => {
		setAnchorMenu(null);
		modalPromise.open(({ onClose }) => (
			<ModalDocumentContract
				isOpen
				operationStageUuid={stageUuid}
				initialValues={{ template: uuid }}
				onClose={onClose}
			/>
		));
	};

	return (
		<>
			<div className="flex justify-between items-center flex-no-wrap">
				<Typography color="secondary" className="text-16 font-bold">
					Документы
				</Typography>

				<Button
					variant="outlined"
					textNormal
					disabled={disabled}
					onClick={event => setAnchorMenu(event.target)}
				>
					Создать документ
				</Button>
				<Menu anchorEl={anchorMenu} keepMounted open={!!anchorMenu} onClose={() => setAnchorMenu(null)}>
					{documents.map(document => (
						<MenuItem key={document.uuid} onClick={() => handleOnClickMenuItem(document.uuid)}>
							{document.name}
						</MenuItem>
					))}
				</Menu>
			</div>

			{isError ? (
				<ErrorMessage />
			) : isLoading ? (
				<FuseLoading />
			) : (
				data.results.map(document => (
					<div key={document.uuid} className="mt-10 text-md">
						<Card
							height={110}
							color={theme.palette.primary.main}
							leftTop={
								<Typography color="secondary" className="font-bold">
									{document.name}
								</Typography>
							}
							rightTop={
								<div className="flex items-center">
									<EventIcon className="text-16 mr-4" color="inherit" />
									<Typography color="secondary">
										{document.date ? moment(document.date).format('DD.MM.YYYY') : 'Не указано'}
									</Typography>
								</div>
							}
							rightBottom={
								<div className="flex items-center">
									<KztOutlined className="text-16 mr-4" color="inherit" />

									<Typography color="secondary">
										<Amount value={document.total_cost} />
									</Typography>
								</div>
							}
							leftBottom={
								<div className="flex items-center">
									<PersonIcon className="text-16 mr-4" color="inherit" />
									<Typography color="secondary">{getFullName(document.patient)}</Typography>
								</div>
							}
							onClick={() =>
								modalPromise.open(({ onClose }) => (
									<ModalDocumentContract onClose={onClose} isOpen documentUuid={document.uuid} />
								))
							}
						/>
					</div>
				))
			)}
		</>
	);
}
BlockDocuments.propTypes = {
	stageUuid: PropTypes.string.isRequired,
	documents: PropTypes.arrayOf(
		PropTypes.shape({
			uuid: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired
		})
	).isRequired,
	disabled: PropTypes.bool.isRequired
};
