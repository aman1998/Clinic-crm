import React, { useContext, useEffect, useState } from 'react';
import { Paper, Divider } from '@material-ui/core';
import { useParams } from 'react-router';
import { useQuery } from 'react-query';
import { Button } from 'app/bizKITUi';
import { ModalPatient } from 'app/common/ModalPatient';
import { ModalReceive } from 'app/common/ModalReceive';
import { ENTITY } from 'app/services';
import { leadsServices } from 'app/services/leads';
import { ModalLead } from '../ModalLead';
import { ContextMenu } from '../../pages/Lead';
import { LeftSide } from './LeftSide';
import { RightSide } from './RightSide/RightSide';
import { LeftSideWithData } from './LeftSideWithData';

export const LeadDetail = () => {
	const [isShowModalPatient, setIsShowModalPatient] = useState(false);
	const [isModalReceive, setIsModalReceive] = useState(false);
	const [isModalLeadOpen, setIsModalLeadOpen] = useState(false);
	const [patientUuid, setPatientUuid] = useState(null);
	const [modalInitialValues, setModalInitialValues] = useState({});

	const { leadUuid } = useParams();

	// COMMENTS
	const { isLoading, data } = useQuery([ENTITY.LEADS_HISTORY], leadsServices.getLeadsHistory);

	const { setMenu, isLeadEdit } = useContext(ContextMenu);
	useEffect(() => {
		if (leadUuid) {
			setMenu(
				<div className="flex">
					<Button textNormal className="whitespace-no-wrap ml-10" onClick={() => setIsModalReceive(true)}>
						Добавить новый прием
					</Button>
				</div>
			);
		}

		return () => setMenu(null);
	}, [setMenu, leadUuid]);

	return (
		<>
			{isModalLeadOpen ? (
				<ModalLead onClose={() => setIsModalLeadOpen(false)} />
			) : (
				<Paper>
					<div className="sm:flex">
						{leadUuid && !isLeadEdit ? (
							<LeftSideWithData
								patientUuid={patientUuid}
								setIsShowModalPatient={setIsShowModalPatient}
								setModalInitialValues={setModalInitialValues}
								isReadOnly
							/>
						) : (
							<LeftSide />
						)}
						<div>
							<Divider className="mx-8" orientation="vertical" />
						</div>
						<RightSide
							comments={data}
							isCommentLoading={isLoading}
							setIsModalLeadOpen={setIsModalLeadOpen}
						/>
					</div>
				</Paper>
			)}
			{isShowModalPatient && (
				<ModalPatient
					isOpen
					onClose={() => setIsShowModalPatient(false)}
					// onUpdate={uuid => actionsSearchPatient.getByUuid(uuid)}
					initialValues={modalInitialValues}
					setPatientUuid={setPatientUuid}
					// patientsUuid={dataSearchPatient.value?.uuid ?? null}
				/>
			)}
			{isModalReceive && <ModalReceive isOpen onClose={() => setIsModalReceive(false)} />}
		</>
	);
};
