import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Paper, Typography, Divider, Popover, Tooltip, withStyles, useTheme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { useMutation } from 'react-query';
import { Button, ServerAutocomplete } from '../../../../bizKITUi';
import { BlockReceptions } from './BlockReceptions';
import { BlockTasks } from './BlockTasks';
import { BlockDocuments } from './BlockDocuments';
import { BlockFiles } from './BlockFiles';
import { BlockOperation } from './BlockOperation';

import {
	OPERATION_CREATED_STAGE_STATUS_DONE,
	OPERATION_CREATED_STAGE_STATUS_CANCEL,
	OPERATION_CREATED_STAGE_STATUS_REWORK,
	OPERATION_CREATED_STAGE_STATUS_PENDING,
	OPERATION_CREATED_STAGE_STATUS_IN_PROGRESS,
	OPERATION_STAGE_OPERATION,
	OPERATION_STAGE_INITIAL_CONSULTATION,
	OPERATION_STAGE_SIMPLE
} from '../../../../services/operation/constants';
import { getFullName } from '../../../../utils';
import { authService, operationService } from '../../../../services';
import { useAlert } from '../../../../hooks';
import { ModalCancelStage } from './ModalCancelStage';
import { modalPromise } from '../../../../common/ModalPromise';
import { ModalReworkStage } from './ModalReworkStage';
import { ModalAcceptStage } from './ModalAcceptStage';
import { Warning as WarningIcon } from '../../../../bizKITUi/Icons/Warning';
import { ModalFinishOperation } from './ModalFinishOperation';
import { FormDisplayCustomFields } from '../../../../common/FormDisplayCustomFields';

const useStyles = makeStyles(theme => ({
	root: {
		width: 500
	},
	pending: {
		position: 'relative',
		opacity: 0.5,
		cursor: 'not-allowed',
		'&:after': {
			content: '""',
			position: 'absolute',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			opacity: 0.5,
			backgroundColor: theme.palette.grey[300]
		}
	},
	content: {
		padding: 20
	}
}));

const LightTooltip = withStyles(theme => ({
	tooltip: {
		backgroundColor: theme.palette.common.white,
		color: 'rgba(0, 0, 0, 0.87)',
		boxShadow: theme.shadows[1],
		fontSize: 14
	}
}))(Tooltip);

export function OperationStage({
	stageUuid,
	operationUuid,
	name,
	isShowReceptions,
	isShowDocuments,
	isShowFiles,
	isShowTasks,
	isFinishStage,
	isFirstStage,
	documents,
	status,
	type,
	responsible,
	comment,
	customFields,
	initialReceptionUuid
}) {
	const classes = useStyles();
	const theme = useTheme();
	const { alertSuccess, alertError } = useAlert();

	const [anchorMenu, setAnchorMenu] = useState(null);

	const [currentResponsible, setCurrentResponsible] = useState(responsible);
	useEffect(() => {
		setCurrentResponsible(responsible);
	}, [responsible]);

	const changeCurrentResponsible = useMutation(({ uuid, payload }) =>
		operationService.changeResponsibleOperationCreatedStage(uuid, payload)
	);
	const handleOnChangeCurrentResponsible = value => {
		setCurrentResponsible(value);

		changeCurrentResponsible
			.mutateAsync({ uuid: stageUuid, payload: { responsible: value?.uuid ?? null } })
			.then(() => alertSuccess('Ответственный успешно изменён'))
			.catch(() => alertError('Не удалось изменить ответственного'));
	};

	const patchOperationCreatedStage = useMutation(({ uuid, payload }) =>
		operationService.patchOperationCreatedStage(uuid, payload)
	);
	const [currentCustomFields, setCurrentCustomFields] = useState(customFields);
	useEffect(() => {
		setCurrentCustomFields(customFields);
	}, [customFields]);
	const handleOnChangeCustomFields = (currentValue, sectionIndex, fieldIndex) => {
		if (!currentCustomFields) {
			return;
		}

		const oldValue = currentCustomFields[sectionIndex].fields[fieldIndex].value;

		if (oldValue === currentValue) {
			return;
		}

		const copyFields = [...currentCustomFields];
		copyFields[sectionIndex].fields[fieldIndex].value = currentValue;
		setCurrentCustomFields(copyFields);

		patchOperationCreatedStage
			.mutateAsync({ uuid: stageUuid, payload: { custom_fields: { sections: copyFields } } })
			.catch(() => alertError('Не удалось обновить значение в одном из полей'));
	};

	const stageIsPending = status === OPERATION_CREATED_STAGE_STATUS_PENDING;
	const stageIsInProgress = status === OPERATION_CREATED_STAGE_STATUS_IN_PROGRESS;
	const stageIsDone = status === OPERATION_CREATED_STAGE_STATUS_DONE;
	const stageIsRework = status === OPERATION_CREATED_STAGE_STATUS_REWORK;
	const stageIsCancel = status === OPERATION_CREATED_STAGE_STATUS_CANCEL;

	return (
		<Paper className={clsx(classes.root, { [classes.pending]: stageIsPending })}>
			<div className={`flex justify-between items-center ${classes.content}`}>
				<Typography color="secondary" className="text-lg font-bold break-all">
					{name}
				</Typography>

				<div>
					{isFinishStage && stageIsInProgress && (
						<Button
							className="whitespace-no-wrap"
							textNormal
							onClick={() =>
								modalPromise.open(({ onClose }) => (
									<ModalFinishOperation isOpen stageUuid={stageUuid} onClose={onClose} />
								))
							}
						>
							Завершить операцию
						</Button>
					)}
					{stageIsInProgress && !isFinishStage && (
						<>
							<Button
								className="whitespace-no-wrap"
								textNormal
								onClick={event => setAnchorMenu(event.target)}
							>
								Завершить этап
							</Button>
							<Popover
								open={!!anchorMenu}
								anchorEl={anchorMenu}
								anchorOrigin={{
									vertical: 'bottom',
									horizontal: 'right'
								}}
								transformOrigin={{
									vertical: 'top',
									horizontal: 'right'
								}}
								onClick={() => setAnchorMenu(null)}
								onClose={() => setAnchorMenu(null)}
							>
								<div className="grid gap-10 p-10">
									<Button
										textNormal
										fullWidth
										customColor="primary"
										onClick={() =>
											modalPromise.open(({ onClose }) => (
												<ModalAcceptStage isOpen stageUuid={stageUuid} onClose={onClose} />
											))
										}
									>
										Следующий этап
									</Button>
									{!isFirstStage && (
										<Button
											textNormal
											fullWidth
											customColor="accent"
											onClick={() =>
												modalPromise.open(({ onClose }) => (
													<ModalReworkStage isOpen stageUuid={stageUuid} onClose={onClose} />
												))
											}
										>
											Вернуть на доработку
										</Button>
									)}
									<Button
										textNormal
										fullWidth
										customColor="secondary"
										onClick={() =>
											modalPromise.open(({ onClose }) => (
												<ModalCancelStage isOpen stageUuid={stageUuid} onClose={onClose} />
											))
										}
									>
										Отменить
									</Button>
								</div>
							</Popover>
						</>
					)}

					{stageIsDone && (
						<LightTooltip title={comment}>
							<WarningIcon color="primary" />
						</LightTooltip>
					)}
					{stageIsRework && (
						<LightTooltip title={comment}>
							<WarningIcon style={{ color: theme.palette.warning.main }} />
						</LightTooltip>
					)}
					{stageIsCancel && (
						<LightTooltip title={comment}>
							<WarningIcon color="error" />
						</LightTooltip>
					)}
				</div>
			</div>

			<Divider />

			{type === OPERATION_STAGE_OPERATION && (
				<>
					<div className={classes.content}>
						<BlockOperation operationUuid={operationUuid} />
					</div>

					<Divider />
				</>
			)}

			{currentCustomFields.length > 0 && (
				<>
					<div className={classes.content}>
						<FormDisplayCustomFields
							fields={currentCustomFields}
							onChangeData={handleOnChangeCustomFields}
							isReadOnly={!stageIsInProgress}
							TypographyComponent={({ children }) => (
								<Typography color="secondary" className="text-16 font-bold">
									{children}
								</Typography>
							)}
						/>
					</div>

					<Divider />
				</>
			)}

			<div className={classes.content}>
				<ServerAutocomplete
					value={currentResponsible}
					getOptionLabel={option => getFullName(option)}
					fullWidth
					label="Ответственный"
					readOnly={!stageIsInProgress}
					onChange={handleOnChangeCurrentResponsible}
					onFetchList={search => authService.getUsers({ search, limit: 10 }).then(res => res.results)}
					onFetchItem={fetchUuid => authService.getUser(fetchUuid).then(res => res.data)}
				/>
			</div>

			<Divider />

			{(isShowReceptions || initialReceptionUuid) && (
				<>
					<div className={classes.content}>
						<BlockReceptions
							isShowReceptions={isShowReceptions}
							stageUuid={stageUuid}
							disabled={!stageIsInProgress}
							initialReceptionUuid={initialReceptionUuid}
						/>
					</div>

					<Divider />
				</>
			)}

			{isShowDocuments > 0 && (
				<>
					<div className={classes.content}>
						<BlockDocuments documents={documents} stageUuid={stageUuid} disabled={!stageIsInProgress} />
					</div>

					<Divider />
				</>
			)}

			{isShowFiles && (
				<>
					<div className={classes.content}>
						<BlockFiles stageUuid={stageUuid} disabled={!stageIsInProgress} />
					</div>

					<Divider />
				</>
			)}

			{isShowTasks && (
				<div className={classes.content}>
					<BlockTasks stageUuid={stageUuid} disabled={!stageIsInProgress} />
				</div>
			)}
		</Paper>
	);
}
OperationStage.defaultProps = {
	comment: '',
	initialReceptionUuid: null,
	responsible: null
};
OperationStage.propTypes = {
	stageUuid: PropTypes.string.isRequired,
	operationUuid: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	isShowReceptions: PropTypes.bool.isRequired,
	isShowDocuments: PropTypes.bool.isRequired,
	isShowFiles: PropTypes.bool.isRequired,
	isShowTasks: PropTypes.bool.isRequired,
	isFinishStage: PropTypes.bool.isRequired,
	isFirstStage: PropTypes.bool.isRequired,
	comment: PropTypes.string,
	documents: PropTypes.arrayOf(
		PropTypes.shape({
			uuid: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired
		})
	).isRequired,
	responsible: PropTypes.shape({
		uuid: PropTypes.string.isRequired,
		first_name: PropTypes.string.isRequired,
		last_name: PropTypes.string.isRequired,
		middle_name: PropTypes.string.isRequired
	}),
	status: PropTypes.oneOf([
		OPERATION_CREATED_STAGE_STATUS_DONE,
		OPERATION_CREATED_STAGE_STATUS_CANCEL,
		OPERATION_CREATED_STAGE_STATUS_REWORK,
		OPERATION_CREATED_STAGE_STATUS_PENDING,
		OPERATION_CREATED_STAGE_STATUS_IN_PROGRESS
	]).isRequired,
	type: PropTypes.oneOf([OPERATION_STAGE_OPERATION, OPERATION_STAGE_INITIAL_CONSULTATION, OPERATION_STAGE_SIMPLE])
		.isRequired,
	customFields: PropTypes.arrayOf(PropTypes.object).isRequired,
	initialReceptionUuid: PropTypes.string
};
