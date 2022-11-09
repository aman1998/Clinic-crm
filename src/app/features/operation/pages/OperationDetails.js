import React from 'react';
import { useParams } from 'react-router';
import { FormOperation } from '../components/FormOperation/FormOperation';

export function OperationDetails() {
	const { operationUuid } = useParams();

	return (
		<div className="md:m-32 m-12">
			<FormOperation operationUuid={operationUuid} />
		</div>
	);
}
