import React, { useState, createContext } from 'react';
import { Paper } from '@material-ui/core';
import { renderRoutes } from 'react-router-config';
import { TabsLink } from '../../../bizKITUi';
import { useToolbarTitle } from '../../../hooks';
import { PERMISSION } from '../../../services/auth/constants';

export const ContextMenu = createContext(null);

const tabConfig = [
	{
		label: 'Расписание',
		url: '/reception',
		auth: [PERMISSION.CLINIC.VIEW_EMPLOYEES]
	},
	{
		label: 'Список пациентов',
		url: '/reception/patient-list',
		auth: [PERMISSION.CLINIC.VIEW_PATIENT]
	},
	{
		label: 'Резервы',
		url: '/reception/reserves',
		auth: [PERMISSION.CLINIC.VIEW_RESERVE]
	},
	{
		label: 'Звонки',
		url: '/reception/calls',
		auth: [PERMISSION.CLINIC.VIEW_CALLS]
	},
	{
		label: 'Чат',
		url: '/reception/chat'
	}
];

export default function Reception({ route }) {
	const [menu, setMenu] = useState(null);

	useToolbarTitle('Регистратура');

	return (
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
