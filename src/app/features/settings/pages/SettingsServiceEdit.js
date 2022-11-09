import React from 'react';
import { useParams } from 'react-router-dom';
import { Grid, Card, CardHeader, CardContent, Typography, Divider } from '@material-ui/core';
import { useToolbarTitle } from '../../../hooks';
import { FormService } from '../../../common/FormService';
import { FormServiceCustomFields } from '../components';

export default function SettingsServiceEdit() {
	const { serviceUuid } = useParams();
	useToolbarTitle('Услуги');

	return (
		<div className="md:m-32 m-12">
			<Grid container spacing={2}>
				<Grid item md={6} xs={12}>
					<Card>
						<CardHeader
							title={
								<Typography color="secondary" variant="body1">
									Информация об услуге
								</Typography>
							}
						/>
						<Divider />
						<CardContent>
							<FormService uuid={serviceUuid} />
						</CardContent>
					</Card>
				</Grid>
				<Grid item md={6} xs={12}>
					<FormServiceCustomFields serviceUuid={serviceUuid} />
				</Grid>
			</Grid>
		</div>
	);
}
