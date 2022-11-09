import React from 'react';
import { ListTasks } from '../components/ListTasks';

export function TasksCompleted() {
	return (
		<div className="md:m-32 m-12">
			<ListTasks onlyCompletedTasks />
		</div>
	);
}
