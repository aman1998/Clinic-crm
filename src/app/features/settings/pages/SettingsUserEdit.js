import React from 'react';
import { useParams } from 'react-router-dom';
import { Grid, Card, CardHeader, CardContent, Typography, Divider } from '@material-ui/core';
import { useToolbarTitle } from '../../../hooks';
import { FormUser } from '../components/FormUser';
import { FormNotifications } from '../../../common/FormNotifications';

export default function SettingsUserEdit() {
	const { userUuid } = useParams();
	useToolbarTitle('Пользователь');

	return (
		<>
			<div className="md:m-32 m-12">
				<Grid container spacing={2}>
					<Grid item md={6} xs={12}>
						<Card>
							<CardHeader
								title={
									<Typography color="secondary" variant="body1">
										Общая информация
									</Typography>
								}
							/>
							<Divider />
							<CardContent>
								<FormUser uuid={userUuid} />
							</CardContent>
						</Card>
					</Grid>
					<Grid item md={6} xs={12}>
						<Card>
							<CardHeader
								title={
									<Typography color="secondary" variant="body1">
										Настройка уведомлений
									</Typography>
								}
							/>
							<Divider />
							<CardContent>
								<FormNotifications />
							</CardContent>
						</Card>
					</Grid>
				</Grid>
			</div>
		</>
	);
}
