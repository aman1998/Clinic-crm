import React, { useState, createContext } from 'react';
import { Paper } from '@material-ui/core';
import { renderRoutes } from 'react-router-config';
import { TabsLink } from '../../../bizKITUi';
import { useToolbarTitle } from '../../../hooks';

export const ContextMenu = createContext(null);

const tabConfig = [
	{
		label: 'В работе',
		url: '/leads'
		// auth: [PERMISSION.CLINIC.VIEW_EMPLOYEES]
	}
	// {
	// 	label: 'Успешные',
	// 	url: '/leads/success',
	// 	auth: [PERMISSION.CLINIC.VIEW_PATIENT]
	// },
	// {
	// 	label: 'Отказанные',
	// 	url: '/leads/refused',
	// 	auth: [PERMISSION.CLINIC.VIEW_RESERVE]
	// }
];

export default function Leads({ route }) {
	const [menu, setMenu] = useState(null);

	useToolbarTitle('Лиды');

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
