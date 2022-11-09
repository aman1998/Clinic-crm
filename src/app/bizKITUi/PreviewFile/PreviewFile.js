import React from 'react';
import { IconButton, Link, makeStyles } from '@material-ui/core';
import { Delete as DeleteIcon } from '@material-ui/icons';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const useStyles = makeStyles(theme => ({
	wrap: {
		display: 'flex',
		alignItems: 'center'
	},
	iconButton: {
		marginLeft: theme.spacing(1)
	},
	link: {
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	}
}));

export function PreviewFile({ name, url, disabled, className, onDelete }) {
	const classes = useStyles();

	return (
		<div className={clsx(classes.wrap, className)}>
			{url ? (
				<Link href={url} className={classes.link} target="_blank">
					{name}
				</Link>
			) : (
				<p>{name}</p>
			)}

			<IconButton
				className={classes.iconButton}
				aria-label={`Удалить файл с названием ${name}`}
				size="small"
				disabled={disabled}
				onClick={onDelete}
			>
				<DeleteIcon fontSize="inherit" />
			</IconButton>
		</div>
	);
}
PreviewFile.defaultProps = {
	url: '',
	disabled: false,
	className: ''
};
PreviewFile.propTypes = {
	name: PropTypes.string.isRequired,
	url: PropTypes.string,
	disabled: PropTypes.bool,
	className: PropTypes.string,
	onDelete: PropTypes.func.isRequired
};
