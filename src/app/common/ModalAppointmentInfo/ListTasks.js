import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Event as EventIcon, Person as PersonIcon } from '@material-ui/icons';
import { makeStyles, Typography, useTheme } from '@material-ui/core';
import { useQuery } from 'react-query';
import { Card } from '../../bizKITUi';
import { TASK_END_FAILURE, TASK_STATUS_DONE } from '../../services/tasks/constants';
import { getShortName } from '../../utils';
import { modalPromise } from '../ModalPromise';
import { ModalTask } from '../ModalTask';
import { ENTITY, tasksService } from '../../services';
import { ErrorMessage } from '../ErrorMessage';
import FuseLoading from '../../../@fuse/core/FuseLoading';

const useStyles = makeStyles(theme => ({
	infoText: {
		margin: '0 8px 0 10px',
		fontSize: 13,
		color: theme.palette.secondary.main,
		[theme.breakpoints.down('xs')]: {
			fontSize: '12px'
		}
	},
	icon: {
		width: '16px',
		height: '16px'
	}
}));

export function ListTasks({ receptionUuid }) {
	const classes = useStyles();
	const theme = useTheme();

	const { isLoading, isError, data: listTasks } = useQuery(
		[ENTITY.TASK, { reception: receptionUuid }],
		({ queryKey }) => tasksService.getTasks(queryKey[1])
	);

	const getTaskColor = task => {
		const isTaskStatusDone = task.status === TASK_STATUS_DONE;

		const isTaskHaveError = task.history.some(item => [TASK_END_FAILURE].includes(item.type));

		if (isTaskHaveError) {
			return theme.palette.error.main;
		}

		if (isTaskStatusDone) {
			return theme.palette.success.main;
		}

		return theme.palette.primary.main;
	};

	const planEndDate = date => {
		const isValidEndDate = moment(date).isValid();

		return isValidEndDate ? moment(date).format('ddd, D MMM YYYY, HH:mm') : 'Не указано';
	};

	return (
		<>
			<Typography color="secondary" className="text-lg font-bold">
				Задачи
			</Typography>
			<div className="mt-10">
				{isError ? (
					<ErrorMessage />
				) : isLoading ? (
					<FuseLoading />
				) : listTasks.results.length <= 0 ? (
					<Typography color="secondary" variant="subtitle2">
						Нет прикреплённых задач
					</Typography>
				) : (
					listTasks.results.map(task => (
						<div key={task.uuid} className="mb-10">
							<Card
								color={getTaskColor(task)}
								leftTop={
									<Typography color="secondary" variant="subtitle1">
										{task.name}
									</Typography>
								}
								leftBottom={
									<div className="flex items-center">
										<PersonIcon size="small" className={classes.icon} color="inherit" />
										<span className={classes.infoText}>{getShortName(task.assignee)}</span>
									</div>
								}
								rightBottom={
									<div className="flex items-center">
										<EventIcon size="small" className={classes.icon} color="inherit" />
										<span className={classes.infoText}>{planEndDate(task.plan_end_at)}</span>
									</div>
								}
								rightTop={
									<span className={classes.infoText}>
										{tasksService.getTaskStatus(task.status)?.name}
									</span>
								}
								onClick={() =>
									modalPromise.open(({ onClose }) => (
										<ModalTask isOpen onClose={onClose} taskUuid={task.uuid} />
									))
								}
							/>
						</div>
					))
				)}
			</div>
		</>
	);
}
ListTasks.propTypes = {
	receptionUuid: PropTypes.string.isRequired
};
