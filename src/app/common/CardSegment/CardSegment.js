import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { ButtonBase } from '@material-ui/core';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
	root: {
		height: '100%'
	},
	information: {
		display: 'none',
		height: '100%',
		padding: 10,
		'& div': {
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			whiteSpace: 'nowrap'
		}
	},
	large: {
		display: 'grid',
		gridTemplateRows: 'auto 1fr auto'
	},
	medium: {
		display: 'block',
		'& div': {
			display: 'none'
		},
		'& > span': {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
			height: '100%',
			lineHeight: 1
		}
	},
	small: {
		display: 'block',
		'& div': {
			display: 'none'
		},
		'& > span': {
			position: 'absolute',
			bottom: -8,
			left: '50%',
			transformOrigin: '0 0',
			transform: 'rotate(270deg) translate(0, -50%)'
		}
	},
	button: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		zIndex: 2
	}
});

export function CardSegment({ date_time, duration, patient, onClick }) {
	const classes = useStyles();

	const timeStart = moment(date_time);
	const timeEnd = moment(date_time).add(duration, 'minute');

	const [containerClass, setContainerClass] = useState('');
	const buttonRef = useRef(null);
	useEffect(() => {
		const { offsetWidth } = buttonRef.current;
		let className = '';

		switch (true) {
			case offsetWidth >= 100:
				className = classes.large;
				break;
			case offsetWidth >= 50 && offsetWidth < 100:
				className = classes.medium;
				break;
			case offsetWidth < 50 && offsetWidth > 20:
				className = classes.small;
				break;
			default:
		}

		if (containerClass !== className) {
			setContainerClass(className);
		}
	}, [containerClass, classes.large, classes.medium, classes.small]);

	return (
		<div ref={buttonRef} className={classes.root}>
			<div className={clsx(classes.information, containerClass)}>
				<div>{patient.last_name}</div>
				<div>{patient.first_name}</div>

				<span>
					<span>{timeStart.format('HH:mm')}</span> — <span>{timeEnd.format('HH:mm')}</span>
				</span>
			</div>

			<ButtonBase className={classes.button} onClick={() => onClick()} />
		</div>
	);
}
CardSegment.defaultProps = {
	onClick: () => {}
};
CardSegment.propTypes = {
	date_time: PropTypes.string.isRequired,
	duration: PropTypes.number.isRequired,
	patient: PropTypes.shape({
		last_name: PropTypes.string.isRequired,
		first_name: PropTypes.string.isRequired
	}).isRequired,
	onClick: PropTypes.func
};
