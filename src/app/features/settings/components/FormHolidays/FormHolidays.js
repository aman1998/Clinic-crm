import React, { useState } from 'react';
import { Grid, Paper, Typography, Divider, IconButton } from '@material-ui/core';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import moment from 'moment';
import { Delete as DeleteIcon } from '@material-ui/icons';
import { Calendar } from '../../../../common/Calendar';
import { employeesService, ENTITY, ENTITY_DEPS } from '../../../../services';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { Button } from '../../../../bizKITUi';
import { useAlert, useConfirm } from '../../../../hooks';

const WORKING_DAYS = [0, 1, 2, 3, 4, 5, 6];

export function FormHolidays() {
	const queryClient = useQueryClient();
	const [openModalConfirm] = useConfirm();
	const { alertSuccess, alertError } = useAlert();

	const { isLoading, isError, data: holidays } = useQuery(
		[ENTITY.HOLIDAY, { limit: Number.MAX_SAFE_INTEGER }],
		({ queryKey }) => employeesService.getHolidays(queryKey[1])
	);

	const [selectedDate, setSelectedDate] = useState(null);
	const holidaysDates = holidays?.results.map(item => new Date(item.date));

	const createHoliday = useMutation(payload => employeesService.createHoliday(payload));
	const handleOnCreateHoliday = () => {
		createHoliday
			.mutateAsync({ date: moment(selectedDate).format('YYYY-MM-DD') })
			.then(() => {
				setSelectedDate(null);
				alertSuccess('Праздничный день успешно добавлен');

				ENTITY_DEPS.HOLIDAY.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
			})
			.catch(error => {
				alertError(`Не удалось добавить праздничный день. ${error.userMessage}`);
			});
	};

	const deleteHoliday = useMutation(uuid => employeesService.deleteHoliday(uuid));
	const handleOnDeleteHoliday = uuid => {
		deleteHoliday
			.mutateAsync(uuid)
			.then(() => {
				alertSuccess('Дата успешно удалена');

				ENTITY_DEPS.HOLIDAY.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
			})
			.catch(() => {
				alertError('Не удалось удалить дату');
			});
	};

	if (isError) {
		return <ErrorMessage />;
	}
	if (isLoading) {
		return <FuseLoading />;
	}
	return (
		<Grid container spacing={4}>
			<Grid item md={6} xs={12}>
				<Paper>
					<Typography variant="subtitle1" className="p-20">
						Календарь праздничных дней
					</Typography>

					<Divider />

					<div className="p-20">
						<Calendar
							value={selectedDate}
							disabledDates={[]}
							holidays={holidaysDates}
							workingDays={WORKING_DAYS}
							onChange={setSelectedDate}
						/>

						<Button
							textNormal
							className="mt-20"
							disabled={createHoliday.isLoading}
							onClick={handleOnCreateHoliday}
						>
							Добавить в праздники
						</Button>
					</div>
				</Paper>
			</Grid>

			<Grid item md={6} xs={12}>
				<Paper>
					<Typography variant="subtitle1" className="p-20">
						Список праздничных дней
					</Typography>

					<Divider />

					<div className="p-20">
						{holidays.results.map(item => (
							<div key={item.uuid} className="mb-20">
								<div className="flex">
									{moment(item.date).format('YYYY-MM-DD')}

									<IconButton
										className="ml-auto"
										aria-label="Удалить дату"
										size="small"
										disabled={deleteHoliday.isLoading}
										onClick={() =>
											openModalConfirm({
												title: 'Удалить дату?',
												onSuccess: () => handleOnDeleteHoliday(item.uuid)
											})
										}
									>
										<DeleteIcon fontSize="inherit" />
									</IconButton>
								</div>

								<Divider />
							</div>
						))}
					</div>
				</Paper>
			</Grid>
		</Grid>
	);
}
