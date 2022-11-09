import React from 'react';
import { TablePagination as TablePaginationLib } from '@material-ui/core';

export function TablePagination({ ...props }) {
	return (
		<TablePaginationLib
			backIconButtonText="Предыдущая страница"
			nextIconButtonText="Следующая страница"
			labelRowsPerPage="Записей на странице:"
			{...props}
		/>
	);
}
