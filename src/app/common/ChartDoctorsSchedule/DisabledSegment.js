import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Tooltip } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
	container: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		backgroundColor: theme.palette.grey[100]
	}
}));

export function DisabledSegment({ hint }) {
	const classes = useStyles();

	const [position, setPosition] = useState({ x: null, y: null });

	return (
		<Tooltip
			open={!!position.x && !!position.y}
			title={hint}
			placement="top"
			PopperProps={{
				anchorEl: {
					clientHeight: 0,
					clientWidth: 0,
					getBoundingClientRect: () => ({
						top: position.y,
						left: position.x,
						right: position.x,
						bottom: position.y,
						width: 0,
						height: 0
					})
				}
			}}
		>
			<div
				className={classes.container}
				onMouseMove={event => setPosition({ x: event.pageX, y: event.pageY })}
				onMouseLeave={() => setPosition({ x: null, y: null })}
			/>
		</Tooltip>
	);
}
