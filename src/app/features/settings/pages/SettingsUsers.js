import React, { useState, createContext } from 'react';
import { Paper } from '@material-ui/core';
import { renderRoutes } from 'react-router-config';
import { TabsLink } from '../../../bizKITUi';
import { PERMISSION } from '../../../services/auth/constants';

export const ContextMenu = createContext(null);

const tabConfig = [
	{
		label: 'Пользователи',
		url: '/settings/users',
		auth: [PERMISSION.USERS.VIEW_USER]
	},
	{
		label: 'Врачи',
		url: '/settings/users/doctors',
		auth: [PERMISSION.USERS.VIEW_USER]
	},
	{
		label: 'Группы пользователей',
		url: '/settings/users/groups'
	}
];

export default function SettingsUsers({ route }) {
	const [menu, setMenu] = useState(null);

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
