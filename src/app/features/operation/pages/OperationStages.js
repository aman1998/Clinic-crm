import React, { useEffect, useState } from 'react';
import { Tab, Tabs, Paper } from '@material-ui/core';
import { useParams } from 'react-router';
import { useQuery } from 'react-query';
import { makeStyles } from '@material-ui/core/styles';
import { PaperHorizontalScroll } from '../../../bizKITUi';
import { OperationStage } from '../components/OperationStage/OperationStage';
import { ENTITY, operationService } from '../../../services';
import { ErrorMessage } from '../../../common/ErrorMessage';
import FuseLoading from '../../../../@fuse/core/FuseLoading';
import {
	OPERATION_CREATED_STAGE_STATUS_IN_PROGRESS,
	OPERATION_CREATED_STAGE_STATUS_CANCEL,
	OPERATION_CREATED_STAGE_STATUS_REWORK,
	OPERATION_CREATED_STAGE_STATUS_DONE
} from '../../../services/operation/constants';

const useStyles = makeStyles(theme => ({
	tabDefault: {
		color: `${theme.palette.primary.main} !important`
	},
	tabDone: {
		color: `${theme.palette.success.main} !important`
	},
	tabRework: {
		color: `${theme.palette.warning.main} !important`
	},
	tabCancel: {
		color: `${theme.palette.error.main} !important`
	}
}));

export function OperationStages() {
	const classes = useStyles();
	const { operationUuid } = useParams();

	const { isLoading: isLoadingStages, isError: isErrorStages, data: stages } = useQuery(
		[ENTITY.OPERATION_CREATED_STAGE, { operation: operationUuid, limit: Number.MAX_SAFE_INTEGER }],
		({ queryKey }) => operationService.getOperationCreatedStages(queryKey[1])
	);
	const sortedList = stages?.results.sort((a, b) => a.number - b.number);

	const [tab, setTab] = useState(0);
	const handleOnChangeTab = (_, newTab) => {
		setTab(newTab);
	};
	useEffect(() => {
		if (!stages) {
			return;
		}

		const activeStageIndex = stages.results.findIndex(
			stage =>
				stage.status === OPERATION_CREATED_STAGE_STATUS_IN_PROGRESS ||
				stage.status === OPERATION_CREATED_STAGE_STATUS_CANCEL
		);

		setTab(activeStageIndex === -1 ? stages.results.length - 1 : activeStageIndex);
	}, [stages]);

	const getStageColor = status => {
		return {
			[OPERATION_CREATED_STAGE_STATUS_DONE]: classes.tabDone,
			[OPERATION_CREATED_STAGE_STATUS_REWORK]: classes.tabRework,
			[OPERATION_CREATED_STAGE_STATUS_CANCEL]: classes.tabCancel,
			[undefined]: classes.tabDefault
		}[status];
	};

	if (isErrorStages) {
		return (
			<div className="p-10">
				<ErrorMessage />
			</div>
		);
	}
	if (isLoadingStages) {
		return (
			<div className="p-10">
				<FuseLoading />
			</div>
		);
	}

	return (
		<div className="p-10">
			<Paper className="inline-block my-20">
				<Tabs
					value={tab}
					indicatorColor="primary"
					textColor="primary"
					variant="scrollable"
					onChange={handleOnChangeTab}
				>
					{sortedList.map(stage => (
						<Tab key={stage.uuid} label={stage.name} className={getStageColor(stage.status)} />
					))}
				</Tabs>
			</Paper>

			<div className="mt-20">
				<PaperHorizontalScroll value={tab} offset="25px">
					{sortedList.map((stage, index) => (
						<OperationStage
							key={stage.uuid}
							stageUuid={stage.uuid}
							operationUuid={operationUuid}
							name={stage.name}
							isShowReceptions={stage.show_receptions}
							isShowDocuments={stage.documents.length > 0}
							isShowFiles={stage.show_files}
							isShowTasks={stage.show_tasks}
							isFinishStage={sortedList.length === index + 1}
							isFirstStage={index === 0}
							documents={stage.documents}
							responsible={stage.responsible}
							status={stage.status}
							type={stage.type}
							comment={stage.comment}
							customFields={stage.custom_fields?.sections ?? []}
							initialReceptionUuid={stage.reception?.uuid}
						/>
					))}
				</PaperHorizontalScroll>
			</div>
		</div>
	);
}
