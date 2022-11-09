import React, { useState, createContext } from 'react';
import { useParams } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { useQuery } from 'react-query';
import { Paper } from '@material-ui/core';
import { TabsLink } from '../../../bizKITUi';
import { useToolbarTitle } from '../../../hooks';
import { ErrorMessage } from '../../../common/ErrorMessage';
import FuseLoading from '../../../../@fuse/core/FuseLoading';
import { getFullName } from '../../../utils';
import { PERMISSION } from '../../../services/auth/constants';
import { employeesService, ENTITY } from '../../../services';

export const ContextMenu = createContext(null);

export function Doctor({ route }) {
	const { doctorUuid } = useParams();

	const { isLoading, isError, data } = useQuery([ENTITY.DOCTOR, doctorUuid], () =>
		employeesService.getDoctor(doctorUuid).then(({ data: results }) => results)
	);

	const [menu, setMenu] = useState(null);

	useToolbarTitle(getFullName(data ?? {}));

	const tabConfig = [
		{
			label: 'Услуги',
			url: `/doctors/${doctorUuid}`,
			auth: [PERMISSION.EMPLOYEES.VIEW_RECEPTION]
		},
		{
			label: 'Пациенты',
			url: `/doctors/${doctorUuid}/patients`,
			auth: [PERMISSION.EMPLOYEES.VIEW_PATIENT]
		},
		{
			label: 'Медикаменты',
			url: `/doctors/${doctorUuid}/products`,
			auth: [PERMISSION.EMPLOYEES.VIEW_MEDICINES]
		},
		{
			label: 'Отчёт дня',
			url: `/doctors/${doctorUuid}/daily-report`,
			auth: [PERMISSION.EMPLOYEES.VIEW_DAILY_REPORT]
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
