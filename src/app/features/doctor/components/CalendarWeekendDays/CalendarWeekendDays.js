import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardContent, Typography, Divider, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
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

const useStyles = makeStyles(theme => ({
	card: {
		marginBottom: theme.spacing(2)
	}
}));

export function CalendarWeekendDays({ doctorUuid }) {
	const classes = useStyles();
	const queryClient = useQueryClient();
	const [openModalConfirm] = useConfirm();
	const { alertSuccess, alertError } = useAlert();

	const { isLoading: isLoadingHolidays, isError: isErrorHolidays, data: holidays } = useQuery(
		[ENTITY.HOLIDAY, { limit: Number.MAX_SAFE_INTEGER }],
		({ queryKey }) => employeesService.getHolidays(queryKey[1])
	);

	const {
		isLoading: isLoadingWeekends,
		isFetching: isFetchingWeekends,
		isError: isErrorWeekends,
		data: weekends
	} = useQuery([ENTITY.DOCTOR_HOLIDAY, { doctor: doctorUuid, limit: Number.MAX_SAFE_INTEGER }], ({ queryKey }) =>
		employeesService.getDoctorHolidays(queryKey[1])
	);

	const [selectedDate, setSelectedDate] = useState(null);

	const holidaysDates = holidays?.results.map(item => new Date(item.date)) ?? [];
	const weekendDates = weekends?.results.map(item => new Date(item.date)) ?? [];
	const allDaysOff = [...holidaysDates, ...weekendDates];

	const createWeekendDay = useMutation(payload => employeesService.createDoctorHoliday(payload));
	const handleOnCreateWeekendDay = () => {
		createWeekendDay
			.mutateAsync({ doctor: doctorUuid, date: moment(selectedDate).format('YYYY-MM-DD') })
			.then(() => {
				setSelectedDate(null);
				alertSuccess('Выходной день успешно добавлен');

				ENTITY_DEPS.DOCTOR_HOLIDAY.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
			})
			.catch(error => {
				alertError(`Не удалось добавить выходной день. ${error.userMessage}`);
			});
	};

	const deleteWeekendDay = useMutation(uuid => employeesService.deleteDoctorHoliday(uuid));
	const handleOnDeleteWeekendDay = uuid => {
		deleteWeekendDay
			.mutateAsync(uuid)
			.then(() => {
				alertSuccess('Дата успешно удалена');

				ENTITY_DEPS.DOCTOR_HOLIDAY.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
			})
			.catch(() => {
				alertError('Не удалось удалить дату');
			});
	};

	const isLoading = isLoadingHolidays || isLoadingWeekends;
	const isError = isErrorHolidays || isErrorWeekends;

	if (isError) {
		return <ErrorMessage />;
	}
	if (isLoading) {
		return <FuseLoading />;
	}
	return (
		<>
			<Card className={classes.card}>
				<CardHeader
					title={
						<Typography color="secondary" variant="body1">
							Календарь выходных дней
						</Typography>
					}
				/>
				<Divider />
				<CardContent>
					<Calendar
						value={selectedDate}
						disabledDates={[]}
						holidays={allDaysOff}
						workingDays={WORKING_DAYS}
						onChange={setSelectedDate}
					/>
					<div className="p-20">
						<Button
							textNormal
							className="mt-20"
							disabled={createWeekendDay.isLoading || isFetchingWeekends}
							onClick={handleOnCreateWeekendDay}
						>
							Добавить в выходные
						</Button>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader
					title={
						<Typography color="secondary" variant="body1">
							Список выходных дней
						</Typography>
					}
				/>
				<Divider />
				<CardContent>
					<div className="p-10">
						{weekends.results.map(item => (
							<div key={item.uuid} className="mb-20">
								<div className="flex">
									{moment(item.date).format('YYYY-MM-DD')}

									<IconButton
										className="ml-auto"
										aria-label="Удалить дату"
										size="small"
										disabled={deleteWeekendDay.isLoading || isFetchingWeekends}
										onClick={() =>
											openModalConfirm({
												title: 'Удалить дату?',
												onSuccess: () => handleOnDeleteWeekendDay(item.uuid)
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
				</CardContent>
			</Card>
		</>
	);
}

CalendarWeekendDays.propTypes = {
	doctorUuid: PropTypes.string.isRequired
};
