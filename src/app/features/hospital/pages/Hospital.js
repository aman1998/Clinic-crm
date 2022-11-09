import React, { useState, createContext } from 'react';
import { Paper } from '@material-ui/core';
import { renderRoutes } from 'react-router-config';
import { TabsLink } from '../../../bizKITUi/TabsLink';
import { useToolbarTitle } from '../../../hooks';
import { PERMISSION } from '../../../services/auth/constants';

export const ContextMenu = createContext(null);

const tabConfig = [
	{
		label: 'Приёмы',
		url: '/hospital',
		auth: [PERMISSION.HOSPITAL.VIEW_STATIONARY_RECEPTION]
	},
	{
		label: 'Склад',
		url: '/hospital/warehouse',
		auth: [PERMISSION.HOSPITAL.VIEW_WAREHOUSE]
	}
];

export default function Hospital({ route }) {
	const [menu, setMenu] = useState(null);

	useToolbarTitle('Стационар');

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
