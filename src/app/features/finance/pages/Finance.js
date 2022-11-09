import React, { useState, createContext } from 'react';
import { Paper } from '@material-ui/core';
import { renderRoutes } from 'react-router-config';
import { TabsLink } from '../../../bizKITUi';
import { useToolbarTitle } from '../../../hooks';
import { PERMISSION } from '../../../services/auth/constants';

export const ContextMenu = createContext(null);

const tabConfig = [
	{
		label: 'Ожидание оплаты',
		url: '/finance',
		auth: [PERMISSION.FINANCE.VIEW_PENDING_ACTION]
	},
	{
		label: 'Платежи',
		url: '/finance/payments',
		auth: [PERMISSION.FINANCE.VIEW_ACTIONS]
	} /*
	{
		label: 'Отчёт дня',
		url: '/finance/report',
		auth: [PERMISSION.FINANCE.VIEW_REPORTS]
	}, */,
	{
		label: 'Кассовая смена',
		url: '/finance/cashier-shift'
	}
];

export default function Finance({ route }) {
	const [menu, setMenu] = useState(null);

	useToolbarTitle('Касса');

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
