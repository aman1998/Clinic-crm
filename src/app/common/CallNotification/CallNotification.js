import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import PhoneIcon from '@material-ui/icons/Phone';
import { ModalReceive } from '../ModalReceive';
import { telephonyService } from '../../services';
import { getFullName } from '../../utils';
import { CALL_TYPE_IN, CALL_EVENT_ACCEPTED, CALL_EVENT_COMPLETED } from '../../services/telephony/constants';

const useStyles = makeStyles(theme => ({
	toast: {
		position: 'fixed',
		right: theme.spacing(2),
		bottom: theme.spacing(2),
		display: 'flex',
		alignItems: 'center',
		padding: theme.spacing(2),
		borderRadius: 10,
		cursor: 'pointer',
		zIndex: 3
	},
	toastIcon: {
		marginRight: theme.spacing(2),
		color: theme.palette.success.main
	},
	toastTitle: {
		fontWeight: 700,
		marginBottom: theme.spacing(1)
	}
}));

export function CallNotification() {
	const classes = useStyles();
	const role = useSelector(({ auth }) => auth.user.role);
	const [dataCall, setDataCall] = useState(null);
	const [isShowModalReceive, setIsShowModalReceive] = useState(false);

	useEffect(() => {
		let unsubscribe = () => {};

		const handleOnSubscribeNotification = data => {
			switch (data.type) {
				case CALL_EVENT_ACCEPTED:
					setDataCall(data);
					setIsShowModalReceive(true);
					break;
				case CALL_EVENT_COMPLETED:
					setDataCall(null);
					break;
				default:
					throw new Error('Unknown event type');
			}
		};

		if (role.length > 0) {
			unsubscribe = telephonyService.subscribeCall(handleOnSubscribeNotification);
		}

		return () => {
			unsubscribe();
		};
	}, [role.length]);

	return (
		<>
			{isShowModalReceive && (
				<ModalReceive
					isOpen
					initialValues={{
						callType: CALL_TYPE_IN,
						patient: dataCall?.patient?.uuid,
						patientNumber: dataCall?.phone
					}}
					onClose={() => setIsShowModalReceive(false)}
				/>
			)}

			{dataCall && (
				<Paper onClick={() => setIsShowModalReceive(true)} className={classes.toast}>
					<PhoneIcon className={classes.toastIcon} />
					<div>
						<div>
							<Typography className={classes.toastTitle}>Входящий звонок</Typography>
						</div>
						<div>
							{dataCall.phone} {dataCall.patient && `(${getFullName(dataCall.patient)})`}
						</div>
					</div>
				</Paper>
			)}
		</>
	);
}
