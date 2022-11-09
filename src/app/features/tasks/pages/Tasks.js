import React, { createContext, useState } from 'react';
import { Paper } from '@material-ui/core';
import { renderRoutes } from 'react-router-config';
import { TabsLink } from '../../../bizKITUi';
import { useToolbarTitle } from '../../../hooks';
import { PERMISSION } from '../../../services/auth/constants';

export const ContextMenu = createContext(null);

const tabConfig = [
	{
		label: 'Текущие задачи',
		url: '/tasks',
		auth: [PERMISSION.TASKS.VIEW_MODULE]
	},
	{
		label: 'Завершенные задачи',
		url: '/tasks/completed',
		auth: [PERMISSION.TASKS.VIEW_MODULE]
	}
];

export default function Tasks({ route }) {
	const [menu, setMenu] = useState(null);

	useToolbarTitle('Задачи');

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
