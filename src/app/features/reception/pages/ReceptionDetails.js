import React from 'react';
import { Paper } from '@material-ui/core';
import { renderRoutes } from 'react-router-config';
import { TabsLink } from '../../../bizKITUi';

const tabConfig = [
	{
		label: 'Врачи',
		url: '/reception'
	},
	{
		label: 'Оборудование',
		url: '/reception/equipment'
	}
];

export default function ReceptionDetails({ route }) {
	return (
		<div>
			<Paper className="inline-block md:m-32 m-12 md:mb-0">
				<TabsLink config={tabConfig} />
			</Paper>

			<div>{renderRoutes(route.routes)}</div>
		</div>
	);
}
