import React from 'react';
import { useToolbarTitle } from '../../../hooks';
import { ListOperations } from '../components/ListOperations';

export function Operations() {
	useToolbarTitle('Операции');

	return (
		<div className="md:m-32 m-12">
			<ListOperations />
		</div>
	);
}
export default Operations;
