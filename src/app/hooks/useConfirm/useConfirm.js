import React, { useCallback } from 'react';
import { DialogActions, DialogTitle } from '@material-ui/core';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Button } from '../../bizKITUi';
import { openDialog, closeDialog } from '../../store/fuse/actions/fuse';

export function Confirm({ title, onSuccess, onReject }) {
	return (
		<>
			<DialogTitle>{title}</DialogTitle>
			<DialogActions>
				<Button onClick={onReject} color="primary">
					Нет
				</Button>
				<Button onClick={onSuccess} customColor="secondary" autoFocus>
					Да
				</Button>
			</DialogActions>
		</>
	);
}
Confirm.defaultProps = {
	title: '',
	onSuccess: () => {},
	onReject: () => {}
};
Confirm.propTypes = {
	title: PropTypes.string,
	onSuccess: PropTypes.func,
	onReject: PropTypes.func
};

export function useConfirm() {
	const dispatch = useDispatch();

	const closeModalConfirm = useCallback(() => {
		dispatch(closeDialog());
	}, [dispatch]);

	const openModalConfirm = useCallback(
		({ title, onSuccess, onReject }) => {
			const handleOnSuccess = () => {
				if (typeof onSuccess === 'function') {
					onSuccess();
				}
				closeModalConfirm();
			};
			const handleOnReject = () => {
				if (typeof onReject === 'function') {
					onReject();
				}
				closeModalConfirm();
			};

			dispatch(
				openDialog({
					children: <Confirm title={title} onSuccess={handleOnSuccess} onReject={handleOnReject} />
				})
			);
		},
		[closeModalConfirm, dispatch]
	);

	return [openModalConfirm, closeModalConfirm];
}
