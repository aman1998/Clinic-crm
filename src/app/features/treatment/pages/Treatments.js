import React, { useState, createContext } from 'react';
import { Paper } from '@material-ui/core';
import { renderRoutes } from 'react-router-config';
import { TabsLink } from '../../../bizKITUi/TabsLink';
import { useToolbarTitle } from '../../../hooks';

export const ContextMenu = createContext(null);

const tabConfig = [
	{
		label: 'Пациенты',
		url: '/treatment'
	}
];

export default function Treatments({ route }) {
	const [menu, setMenu] = useState(null);

	useToolbarTitle('Лечение');

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
