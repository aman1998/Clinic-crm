import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import moment from 'moment';
import { Typography } from '@material-ui/core';
import PlayCircleOutlineOutlinedIcon from '@material-ui/icons/PlayCircleOutlineOutlined';
import { DrawerTemplate, DataTable, Button } from '../../bizKITUi';
import FuseLoading from '../../../@fuse/core/FuseLoading';
import { BlockReceptionStatus } from '../BlockReceptionStatus';
import { CallStatusIndicator } from '../CallStatusIndicator';
import { ModalCallsRecord } from '../ModalCallsRecord';
import { ErrorMessage } from '../ErrorMessage';
import { ENTITY, telephonyService } from '../../services';

export function ModalPatientCallsHistory({ isOpen, onClose, patientPhone, patientUuid }) {
	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);
	const { isLoading, isError, data } = useQuery(
		[ENTITY.CALL, { patient: patientPhone, patient_uuid: patientUuid, limit, offset: page * limit }],
		({ queryKey }) => telephonyService.getCalls(queryKey[1])
	);

	const [selectedCallToListen, setSelectedCallToListen] = useState(null);

	const columns = useMemo(
		() => [
			{
				name: 'type',
				label: 'Тип',
				options: {
					customBodyRenderLite: dataIndex => {
						const currentItem = data.results[dataIndex];
						return <CallStatusIndicator status={currentItem.status} type={currentItem.type} />;
					}
				}
			},
			{
				name: 'start_date',
				label: 'Дата и время',
				options: {
					customBodyRenderLite: dataIndex => {
						const currentItem = data.results[dataIndex];
						return moment(currentItem.start_date_time).format('DD.MM.YYYY HH:mm');
					}
				}
			},
			{
				name: 'client_phone',
				label: 'Номер'
			},
			{
				name: 'status',
				label: 'Статус',
				options: {
					customBodyRenderLite: dataIndex => {
						const currentItem = data.results[dataIndex];
						return currentItem?.receive ? (
							<BlockReceptionStatus status={currentItem.receive.status} />
						) : (
							'—'
						);
					}
				}
			},
			{
				name: 'actions',
				label: 'Запись звонка',
				options: {
					customBodyRenderLite: dataIndex => {
						const currentItem = data.results[dataIndex];
						return currentItem?.record ? (
							<Button
								textNormal
								variant="text"
								startIcon={<PlayCircleOutlineOutlinedIcon />}
								onClick={event => {
									event.stopPropagation();
									setSelectedCallToListen(currentItem);
								}}
							>
								Прослушать
							</Button>
						) : (
							'—'
						);
					}
				}
			}
		],
		[data]
	);
	const tableOptions = {
		serverSide: true,
		rowsPerPage: limit,
		page,
		count: data?.count ?? 0,
		onChangePage: newPage => setPage(newPage),
		onChangeRowsPerPage: newLimit => setLimit(newLimit)
	};

	return (
		<DrawerTemplate
			isOpen={isOpen}
			close={onClose}
			header={
				<Typography color="secondary" className="text-xl font-bold text-center">
					История звонков пациента
				</Typography>
			}
			width="md"
			content={
				<>
					{isLoading ? (
						<FuseLoading />
					) : isError ? (
						<ErrorMessage />
					) : (
						<DataTable columns={columns} options={tableOptions} data={data.results} />
					)}

					{selectedCallToListen && (
						<ModalCallsRecord
							isOpen
							onClose={() => setSelectedCallToListen(null)}
							callUuid={selectedCallToListen.uuid}
						/>
					)}
				</>
			}
		/>
	);
}

ModalPatientCallsHistory.defaultProps = {
	patientPhone: null,
	patientUuid: null
};
ModalPatientCallsHistory.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	patientPhone: PropTypes.string,
	patientUuid: PropTypes.string
};
