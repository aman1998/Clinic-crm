import React, { useState, createContext } from 'react';
import { Paper } from '@material-ui/core';
import { renderRoutes } from 'react-router-config';
import { TabsLink } from '../../../bizKITUi';
import { useToolbarTitle } from '../../../hooks';
import { PERMISSION } from '../../../services/auth/constants';

export const ContextMenu = createContext(null);

const tabConfig = [
	{
		label: 'Все приёмы',
		url: '/analytics',
		auth: [PERMISSION.ANALYTICS.VIEW_RECEPTION]
	},
	{
		label: 'Регистратура',
		url: '/analytics/receptions',
		auth: [PERMISSION.ANALYTICS.VIEW_CLINIC]
	},
	// {
	// 	label: 'Врачи',
	// 	url: '/analytics/doctors'
	// },
	{
		label: 'Стационар',
		url: '/analytics/hospital',
		auth: [PERMISSION.ANALYTICS.VIEW_HOSPITAL_STATIONARY]
	},
	{
		label: 'Лаборатория',
		url: '/analytics/laboratory',
		auth: [PERMISSION.ANALYTICS.VIEW_LABORATORY]
	},
	// {
	// 	label: 'Финансы',
	// 	url: '/analytics/finance'
	// },
	{
		label: 'Склад',
		url: '/analytics/warehouse',
		auth: [PERMISSION.ANALYTICS.VIEW_WAREHOUSES]
	}
];

export default function Analytics({ route }) {
	useToolbarTitle('Аналитика');

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
