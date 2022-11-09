import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { ArrowForward as ArrowForwardIcon } from '@material-ui/icons';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { DialogSimpleTemplate } from '../../bizKITUi';
import { FormFinanceTransfer } from '../FormFinanceTransfer';
import { FormOpenCashierShift } from '../FormOpenCashierShift';
import { GuardCheckCashierShift } from '../GuardCheckCashierShift';

const useStyles = makeStyles(theme => ({
	header: {
		display: 'flex',
		alignItems: 'center'
	},
	headerIcon: {
		color: theme.palette.warning.main
	},
	headerText: {
		marginLeft: theme.spacing(1)
	}
}));

export function Header({ title }) {
	const classes = useStyles();

	const theme = useTheme();
	const matches = useMediaQuery(theme.breakpoints.down(768));

	return (
		<div className={classes.header}>
			{!matches && <ArrowForwardIcon className={classes.headerIcon} />}
			<div className={classes.headerText}>{title}</div>
		</div>
	);
}
Header.propTypes = {
	title: PropTypes.string.isRequired
};

export function ModalFinanceTransfer({ isOpen, onClose, financeActionUuid, onUpdate }) {
	const handleOnUpdate = () => {
		onUpdate();
		onClose();
	};

	return (
		<DialogSimpleTemplate
			isOpen={isOpen}
			onClose={onClose}
			header={<Header title="Перемещение средств" />}
			fullWidth
			maxWidth="sm"
			contentPadding={false}
		>
			<GuardCheckCashierShift
				skipCheck={!!financeActionUuid}
				fallback={({ isExists }) =>
					isExists ? (
						<div className="p-32">
							<Alert severity="error">
								Невозможно совершить операцию. Рабочая смена уже была закрыта
							</Alert>
						</div>
					) : (
						<div className="p-32">
							<Alert severity="warning">
								Для совершения данной операции необходимо открыть кассовую смену
							</Alert>
							<FormOpenCashierShift />
						</div>
					)
				}
			>
				{() => <FormFinanceTransfer financeActionUuid={financeActionUuid} onUpdate={handleOnUpdate} />}
			</GuardCheckCashierShift>
		</DialogSimpleTemplate>
	);
}
ModalFinanceTransfer.defaultProps = {
	financeActionUuid: null,
	onUpdate: () => {}
};
ModalFinanceTransfer.propTypes = {
	financeActionUuid: PropTypes.string,
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onUpdate: PropTypes.func
};
