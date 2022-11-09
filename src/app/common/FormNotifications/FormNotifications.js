import React from 'react';
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Switch } from '@material-ui/core';

export function FormNotifications() {
	return (
		<>
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Уведомление</TableCell>
							<TableCell align="right">Push</TableCell>
							<TableCell align="right">Email</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						<TableRow>
							<TableCell>Напоминание о начале выполнения задачи</TableCell>
							<TableCell align="right">
								<Switch edge="end" />
							</TableCell>
							<TableCell align="right">
								<Switch edge="end" />
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</TableContainer>
		</>
	);
}
