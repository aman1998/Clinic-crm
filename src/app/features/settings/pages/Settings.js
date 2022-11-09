import React, { useState, createContext } from 'react';
import { Paper } from '@material-ui/core';
import { renderRoutes } from 'react-router-config';
import { TabsLink } from '../../../bizKITUi';
import { PERMISSION } from '../../../services/auth/constants';

export const ContextMenu = createContext(null);

const tabConfig = [
	{
		label: 'Услуги',
		url: '/settings/services',
		auth: [PERMISSION.CLINIC.VIEW_SERVICE]
	},
	{
		label: 'Направления',
		url: '/settings/services/directions',
		auth: [PERMISSION.CLINIC.VIEW_DIRECTION]
	},
	{
		label: 'Программа лояльности',
		url: '/settings/services/promotions'
	}
];

export default function Settings({ route }) {
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
