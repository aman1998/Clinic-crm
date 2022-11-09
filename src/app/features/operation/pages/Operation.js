import React, { createContext, useState } from 'react';
import { useParams } from 'react-router';
import { Paper } from '@material-ui/core';
import { renderRoutes } from 'react-router-config';
import { useQuery } from 'react-query';
import moment from 'moment';
import { useToolbarTitle } from '../../../hooks';
import { TabsLink } from '../../../bizKITUi';
import { ENTITY, operationService } from '../../../services';

export const ContextMenu = createContext(null);

export function Operation({ route }) {
	const { operationUuid } = useParams();

	const tabConfig = [
		{
			label: 'Информация',
			url: `/operation/${operationUuid}`
		},
		{
			label: 'Этапы',
			url: `/operation/${operationUuid}/stages`
		}
	];

	const [menu, setMenu] = useState(null);

	const { data: operation } = useQuery([ENTITY.OPERATION, operationUuid], ({ queryKey }) =>
		operationService.getOperation(queryKey[1])
	);

	useToolbarTitle(operation ? `${operation.service.name} / ${moment(operation.date_time).format('DD MMMM')}` : '');

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
export default Operation;
