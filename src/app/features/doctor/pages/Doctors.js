import React, { useState, createContext } from 'react';
import { renderRoutes } from 'react-router-config';
import { Paper } from '@material-ui/core';
import { useToolbarTitle } from '../../../hooks';
import { TabsLink } from '../../../bizKITUi';
import { PERMISSION } from '../../../services/auth/constants';

const tabConfig = [
	{
		label: 'Список врачей',
		url: `/all-doctors`,
		auth: [PERMISSION.EMPLOYEES.VIEW_MODULE]
	},
	{
		label: 'Отчёт дня',
		url: `/all-doctors/daily-report`,
		auth: [PERMISSION.EMPLOYEES.VIEW_MODULE]
	}
];

export const ContextMenu = createContext(null);

export default function Doctors({ route }) {
	const [menu, setMenu] = useState(null);

	useToolbarTitle({
		name: 'Врачи'
	});

	return (
		<ContextMenu.Provider value={setMenu}>
			<div>
				<Paper className="flex justify-between items-center scroll-control">
					<div className="flex items-center">
						<TabsLink config={tabConfig} />
					</div>

					<div className="pr-32">{menu}</div>
				</Paper>

				<div>{renderRoutes(route.routes)}</div>
			</div>
		</ContextMenu.Provider>
	);
}
