import React, { useState, createContext } from 'react';
import { Paper } from '@material-ui/core';
import { renderRoutes } from 'react-router-config';
import { TabsLink } from '../../../bizKITUi';
import { useToolbarTitle } from '../../../hooks';
import { PERMISSION } from '../../../services/auth/constants';

export const ContextMenu = createContext(null);

const tabConfig = [
	{
		label: 'Список обращений',
		url: '/quality-control',
		auth: [PERMISSION.QUALITY_CONTROL.VIEW_QUALITY_CONTROL]
	},
	{
		label: 'Аналитика',
		url: '/quality-control/analytics',
		auth: [PERMISSION.QUALITY_CONTROL.VIEW_ANALYTICS]
	}
];

export default function QualityControl({ route }) {
	const [menu, setMenu] = useState(null);

	useToolbarTitle('Контроль качества');

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
