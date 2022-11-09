import React, { useState, createContext } from 'react';
import { Paper } from '@material-ui/core';
import { renderRoutes } from 'react-router-config';
import { PERMISSION } from 'app/services/auth/constants';
import { TabsLink } from '../../../bizKITUi';
import { useToolbarTitle } from '../../../hooks';

export const ContextMenu = createContext(null);

const tabConfig = [
	{
		label: 'Операции',
		url: '/global-finance',
		auth: [PERMISSION.FINANCE.VIEW_FINANCE_OPERATIONS]
	},
	{
		label: 'Прибыль и убытки',
		url: '/global-finance/income-loss-report',
		auth: [PERMISSION.FINANCE.VIEW_FINANCE_PROFIT_LOSS]
	},
	{
		label: 'Себестоимость услуг',
		url: '/global-finance/cost-price',
		auth: [PERMISSION.FINANCE.VIEW_FINANCE_COST_SERVICES]
	},
	{
		label: 'Заработная плата',
		url: '/global-finance/salary',
		auth: [PERMISSION.FINANCE.VIEW_FINANCE_SALARY]
	}
];

export default function GlobalFinance({ route }) {
	const [menu, setMenu] = useState(null);

	useToolbarTitle('Финансы');

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
