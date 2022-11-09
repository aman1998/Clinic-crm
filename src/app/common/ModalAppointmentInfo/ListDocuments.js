import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Event as EventIcon } from '@material-ui/icons';
import { makeStyles, Typography, useTheme } from '@material-ui/core';
import { useQuery } from 'react-query';
import { Amount, Card } from '../../bizKITUi';
import { modalPromise } from '../ModalPromise';
import { documentsService, ENTITY } from '../../services';
import { ErrorMessage } from '../ErrorMessage';
import FuseLoading from '../../../@fuse/core/FuseLoading';
import { ModalDocumentContract } from '../ModalDocumentContract';
import { KztOutlined } from '../../bizKITUi/Icons';

const useStyles = makeStyles(theme => ({
	infoText: {
		margin: '0 8px 0 10px',
		fontSize: 13,
		color: theme.palette.secondary.main,
		[theme.breakpoints.down('xs')]: {
			fontSize: '12px'
		}
	},
	icon: {
		width: '16px',
		height: '16px'
	}
}));

export function ListDocuments({ receptionUuid }) {
	const classes = useStyles();
	const theme = useTheme();

	const { isLoading, isError, data: listDocuments } = useQuery(
		[ENTITY.DOCUMENT_CONTRACT, { reception: receptionUuid }],
		({ queryKey }) => documentsService.getContractDocuments(queryKey[1])
	);

	const documentDate = document => {
		return document.date ? moment(document.date).format('DD.MM.YYYY') : 'Не указано';
	};

	return (
		<>
			<Typography color="secondary" className="text-lg font-bold">
				Документы
			</Typography>
			<div className="mt-10">
				{isError ? (
					<ErrorMessage />
				) : isLoading ? (
					<FuseLoading />
				) : listDocuments.results.length <= 0 ? (
					<Typography color="secondary" variant="subtitle2">
						Нет прикреплённых документов
					</Typography>
				) : (
					listDocuments.results.map(document => {
						const documentTitle = document.number ? `${document.name} - ${document.number}` : document.name;
						return (
							<div key={document.uuid} className="mb-10">
								<Card
									color={theme.palette.primary.main}
									center={
										<Typography color="secondary" variant="subtitle1">
											{documentTitle}
										</Typography>
									}
									leftBottom={
										<div className="flex items-center">
											<KztOutlined className={classes.icon} color="inherit" />
											<span className={classes.infoText}>
												<Amount value={document.total_cost} />
											</span>
										</div>
									}
									rightBottom={
										<div className="flex items-center">
											<EventIcon size="small" className={classes.icon} color="inherit" />
											<span className={classes.infoText}>{documentDate(document)}</span>
										</div>
									}
									onClick={() =>
										modalPromise.open(({ onClose }) => (
											<ModalDocumentContract
												onClose={onClose}
												isOpen
												documentUuid={document.uuid}
											/>
										))
									}
								/>
							</div>
						);
					})
				)}
			</div>
		</>
	);
}
ListDocuments.propTypes = {
	receptionUuid: PropTypes.string.isRequired
};
