import React, { useState, createContext } from 'react';
import { Paper } from '@material-ui/core';
import { renderRoutes } from 'react-router-config';
import { TabsLink } from '../../../bizKITUi';

export const ContextMenu = createContext(null);

const tabConfig = [
	{
		label: 'Групповой бонус',
		url: '/settings/group-bonus'
	}
];

export default function SettingsGroupBonus({ route }) {
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
