import React from 'react';
import { ToastContainer as ToastContainerLib } from 'react-toastify';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
	container: {
		width: '400px !important',

		'@media only screen and (max-width: 480px)': {
			width: '100% !important',

			'& .Toastify__toast': {
				marginBottom: '1rem !important'
			}
		}
	}
}));

export function ToastContainer(props) {
	const classes = useStyles();

	return <ToastContainerLib className={classes.container} {...props} />;
}
