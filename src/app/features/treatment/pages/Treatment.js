import React, { createContext, useState } from 'react';
import { useParams } from 'react-router';
import { Paper } from '@material-ui/core';
import { renderRoutes } from 'react-router-config';
import { useToolbarTitle } from '../../../hooks';
import { TabsLink } from '../../../bizKITUi';

export const ContextMenu = createContext(null);

export function Treatment({ route }) {
	const { treatmentUuid } = useParams();

	const tabConfig = [
		{
			label: 'Информация',
			url: `/treatment/${treatmentUuid}`
		},
		{
			label: 'Лечение',
			url: `/treatment/${treatmentUuid}/schedule`
		},
		{
			label: 'Оплаты',
			url: `/treatment/${treatmentUuid}/payment`
		}
	];

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
export default Treatment;
