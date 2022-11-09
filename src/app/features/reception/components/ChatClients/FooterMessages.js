import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '../../../../bizKITUi';
import { modalPromise } from '../../../../common/ModalPromise';
import { ModalReceive } from '../../../../common/ModalReceive';
import { ButtonPatientReceptions } from './ButtonPatientReceptions';
import { ModalReserve } from '../../../../common/ModalReserve';
import { ButtonPatientReserves } from './ButtonPatientReserves';
import { ModalTask } from '../../../../common/ModalTask';
import { ButtonPatientTasks } from './ButtonPatientTasks';

const useStyles = makeStyles({
	footer: {
		display: 'grid',
		gridTemplateColumns: '1fr 1fr 1fr',
		gridGap: 10,
		alignItems: 'flex-start'
	}
});

export function FooterMessages({ conversation }) {
	const classes = useStyles();

	return (
		<div className={classes.footer}>
			<div>
				<Button
					textNormal
					fullWidth
					disabled={!conversation?.patient}
					onClick={() =>
						modalPromise.open(({ onClose }) => (
							<ModalReceive
								isOpen
								initialValues={{
									patient: conversation?.patient?.uuid,
									patientNumber: conversation.main_phone
								}}
								onClose={onClose}
							/>
						))
					}
				>
					Создать прием
				</Button>

				{conversation?.patient && <ButtonPatientReceptions patientUuid={conversation.patient.uuid} />}
			</div>

			<div>
				<Button
					textNormal
					fullWidth
					variant="outlined"
					disabled={!conversation?.patient}
					onClick={() =>
						modalPromise.open(({ onClose }) => (
							<ModalReserve
								isOpen
								initialValues={{
									patient: conversation?.patient?.uuid
								}}
								onClose={onClose}
							/>
						))
					}
				>
					Создать резерв
				</Button>

				{conversation?.patient && <ButtonPatientReserves patientUuid={conversation.patient.uuid} />}
			</div>

			<div>
				<Button
					textNormal
					fullWidth
					customColor="accent"
					disabled={!conversation?.patient}
					onClick={() =>
						modalPromise.open(({ onClose }) => (
							<ModalTask
								isOpen
								initialValues={{
									patient: conversation?.patient?.uuid
								}}
								onClose={onClose}
							/>
						))
					}
				>
					Создать задачу
				</Button>

				{conversation?.patient && <ButtonPatientTasks patientUuid={conversation.patient.uuid} />}
			</div>
		</div>
	);
}
FooterMessages.defaultProps = {
	conversation: null
};
FooterMessages.propTypes = {
	conversation: PropTypes.shape({
		patient: PropTypes.shape({
			uuid: PropTypes.string.isRequired
		}),
		main_phone: PropTypes.string.isRequired
	})
};
