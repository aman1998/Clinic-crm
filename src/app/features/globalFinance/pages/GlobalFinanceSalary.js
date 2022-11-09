import React, { createContext } from 'react';
import { Paper } from '@material-ui/core';
import { renderRoutes } from 'react-router-config';
import { TabsLink } from '../../../bizKITUi';

export const ContextMenu = createContext(null);

const tabConfig = [
	{
		label: 'Ожидание оплаты',
		url: '/global-finance/salary'
	},
	{
		label: 'История выплат',
		url: '/global-finance/salary/history'
	}
];

export default function GlobalFinanceSalary({ route }) {
	return (
		<div>
			<Paper className="m-32 flex justify-between items-center">
				<div>
					<TabsLink config={tabConfig} />
				</div>
			</Paper>

			<div>{renderRoutes(route.routes)}</div>
		</div>
	);
}
