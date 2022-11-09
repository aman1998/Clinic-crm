import React, { useState, createContext } from 'react';
import { useParams } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { useQuery } from 'react-query';
import { Paper } from '@material-ui/core';
import { TabsLink } from '../../../bizKITUi';
import { useToolbarTitle } from '../../../hooks';
import { getFullName } from '../../../utils';
import { ErrorMessage } from '../../../common/ErrorMessage';
import FuseLoading from '../../../../@fuse/core/FuseLoading';
import { PERMISSION } from '../../../services/auth/constants';
import { ENTITY, patientsService } from '../../../services';

export const ContextMenu = createContext(null);

export default function Patient({ route }) {
	const { patientUuid } = useParams();

	const { isLoading, isError, data } = useQuery([ENTITY.PATIENT, patientUuid], () =>
		patientsService.getPatientByUuid(patientUuid).then(({ data: results }) => results)
	);

	const [menu, setMenu] = useState(null);

	useToolbarTitle(getFullName(data ? { lastName: data.last_name, firstName: data.first_name } : {}));

	const tabConfig = [
		{
			label: 'Информация',
			url: `/patients/${patientUuid}`
		},
		{
			label: 'Приёмы',
			url: `/patients/${patientUuid}/receptions`,
			auth: [PERMISSION.PATIENTS.VIEW_RECEPTION]
		},
		{
			label: 'Анализы',
			url: `/patients/${patientUuid}/laboratory`,
			auth: [PERMISSION.PATIENTS.VIEW_RESULTS]
		},
		{
			label: 'Стационар',
			url: `/patients/${patientUuid}/hospital`,
			auth: [PERMISSION.PATIENTS.VIEW_STATIONARY]
		},
		{
			label: 'Оплаты',
			url: `/patients/${patientUuid}/finance`,
			auth: [PERMISSION.PATIENTS.VIEW_PAYMENTS]
		},
		{
			label: 'Задачи',
			url: `/patients/${patientUuid}/tasks`,
			auth: [PERMISSION.PATIENTS.VIEW_TASKS]
		},
		{
			label: 'Документы',
			url: `/patients/${patientUuid}/documents`,
			auth: [PERMISSION.PATIENTS.VIEW_DOCUMENTS]
		}
	];

	return isLoading ? (
		<FuseLoading />
	) : isError ? (
		<ErrorMessage />
	) : (
		<ContextMenu.Provider value={setMenu}>
			<div>
				<Paper className="flex justify-between items-center scroll-control">
					<div>
						<TabsLink config={tabConfig} />
					</div>

					<div className="pr-32">{menu}</div>
				</Paper>

				<div>{renderRoutes(route.routes)}</div>
			</div>
		</ContextMenu.Provider>
	);
}
