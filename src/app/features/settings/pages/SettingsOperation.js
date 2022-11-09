import React from 'react';
import { useToolbarTitle } from '../../../hooks';
import { ListOperationStages } from '../components';

export function SettingsOperation() {
	useToolbarTitle('Операции');

	return (
		<div className="md:m-32 m-12">
			<ListOperationStages />
		</div>
	);
}
export default SettingsOperation;
