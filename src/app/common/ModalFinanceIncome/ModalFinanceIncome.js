import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { AddCircle as AddCircleIcon } from '@material-ui/icons';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { DialogSimpleTemplate } from '../../bizKITUi';
import { FormFinanceIncome } from '../FormFinanceIncome';
import { FormOpenCashierShift } from '../FormOpenCashierShift';
import { GuardCheckCashierShift } from '../GuardCheckCashierShift';

const useStyles = makeStyles(theme => ({
	header: {
		display: 'flex',
		alignItems: 'center'
	},
	headerIcon: {
		color: theme.palette.success.main
	},
	headerText: {
		marginLeft: theme.spacing(1)
	}
}));

function Header({ title }) {
	const classes = useStyles();

	const theme = useTheme();
	const matches = useMediaQuery(theme.breakpoints.down(768));

	return (
		<div className={classes.header}>
			{!matches && <AddCircleIcon className={classes.headerIcon} />}
			<div className={classes.headerText}>{title}</div>
		</div>
	);
}
Header.propTypes = {
	title: PropTypes.string.isRequired
};

export function ModalFinanceIncome({ isOpen, onClose, financeActionPendingUuid, financeActionUuid }) {
	const title = financeActionPendingUuid ? 'Приходная операция (Ожидание оплаты)' : 'Приходная операция (Платежи)';
	return (
		<DialogSimpleTemplate
			isOpen={isOpen}
			onClose={onClose}
			header={<Header title={title} />}
			fullWidth
			maxWidth="lg"
			contentPadding={false}
		>
			<GuardCheckCashierShift
				skipCheck={!!financeActionPendingUuid || !!financeActionUuid}
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
				{() => (
					<FormFinanceIncome
						financeActionPendingUuid={financeActionPendingUuid}
						financeActionUuid={financeActionUuid}
					/>
				)}
			</GuardCheckCashierShift>
		</DialogSimpleTemplate>
	);
}
ModalFinanceIncome.defaultProps = {
	financeActionUuid: null,
	financeActionPendingUuid: null
};
ModalFinanceIncome.propTypes = {
	financeActionUuid: PropTypes.string,
	financeActionPendingUuid: PropTypes.string,
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired
};
