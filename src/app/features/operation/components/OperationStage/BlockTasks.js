import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, useTheme } from '@material-ui/core';
import { Event as EventIcon, Person as PersonIcon } from '@material-ui/icons';
import { useQuery } from 'react-query';
import moment from 'moment';
import { Button, Card } from '../../../../bizKITUi';
import { ModalTask } from '../../../../common/ModalTask';
import { modalPromise } from '../../../../common/ModalPromise';
import { StyledTab, StyledTabs } from './Tabs';
import { ENTITY, tasksService } from '../../../../services';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { getFullName } from '../../../../utils';
import { TASK_STATUS_PLAN, TASK_STATUS_DONE } from '../../../../services/tasks/constants';

export function BlockTasks({ stageUuid, disabled }) {
	const theme = useTheme();
	const [status, setStatus] = useState(TASK_STATUS_PLAN);

	const { isLoading, isError, data } = useQuery(
		[ENTITY.TASK, { status, stage: stageUuid, limit: Number.MAX_SAFE_INTEGER }],
		({ queryKey }) => tasksService.getTasks(queryKey[1])
	);

	return (
		<>
			<div className="flex justify-between items-center flex-no-wrap mb-10">
				<div className="flex items-center">
					<Typography color="secondary" className="text-16 font-bold">
						Задачи
					</Typography>

					<StyledTabs
						value={status}
						indicatorColor="primary"
						textColor="primary"
						centered
						onChange={(_, newTab) => setStatus(newTab)}
					>
						<StyledTab label="Текущие" value={TASK_STATUS_PLAN} />
						<StyledTab label="Завершенные" value={TASK_STATUS_DONE} />
					</StyledTabs>
				</div>

				<Button
					variant="outlined"
					textNormal
					disabled={disabled}
					onClick={() =>
						modalPromise.open(({ onClose }) => (
							<ModalTask isOpen initialValues={{ stage: stageUuid }} onClose={onClose} />
						))
					}
				>
					Добавить задачу
				</Button>
			</div>

			{isError ? (
				<ErrorMessage />
			) : isLoading ? (
				<FuseLoading />
			) : (
				data.results.map(task => (
					<div key={task.uuid} className="mb-10 text-md">
						<Card
							height={110}
							color={theme.palette.primary.main}
							leftTop={
								<Typography color="secondary" className="font-bold">
									{task.name}
								</Typography>
							}
							rightTop={
								<div className="flex items-center">
									<EventIcon className="text-16 mr-4" color="inherit" />
									<Typography color="secondary">
										{task.plan_end_at
											? moment(task.plan_end_at).format('DD.MM.YYYY')
											: 'Не указано'}
									</Typography>
								</div>
							}
							rightBottom={
								<Typography color="secondary">
									{tasksService.getTaskStatus(task.status)?.name}
								</Typography>
							}
							leftBottom={
								<div className="flex items-center">
									<PersonIcon className="text-16 mr-4" color="inherit" />
									<Typography color="secondary">{getFullName(task.assignee)}</Typography>
								</div>
							}
							onClick={() =>
								modalPromise.open(({ onClose }) => (
									<ModalTask isOpen taskUuid={task.uuid} onClose={onClose} />
								))
							}
						/>
					</div>
				))
			)}
		</>
	);
}
BlockTasks.propTypes = {
	stageUuid: PropTypes.string.isRequired,
	disabled: PropTypes.bool.isRequired
};
