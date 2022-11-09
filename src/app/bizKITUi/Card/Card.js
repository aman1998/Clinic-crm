import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles({
	card: {
		position: 'relative',
		padding: '8px',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
		borderStyle: 'solid',
		borderWidth: '1px',
		borderRadius: '5px',
		cursor: 'pointer',
		minWidth: '100%',

		'&:hover': {
			boxShadow: '11px 10px 6px -12px rgba(0,0,0,0.75)'
		},
		'&:focus': {
			outline: 'none'
		}
	},
	wrapButton: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		opacity: 0
	},
	cardContent: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between'
	},
	cardRow: {
		display: 'flex',
		justifyContent: 'space-between'
	},
	cardRightElement: {
		marginLeft: 'auto'
	}
});

function CardElement({ element }) {
	return typeof element === 'string' ? <Typography variant="body2">{element}</Typography> : element;
}
CardElement.defaultProps = {
	element: null
};
CardElement.propTypes = {
	element: PropTypes.node
};

export function Card({ color, center, leftTop, rightTop, leftBottom, rightBottom, height, onClick }) {
	const classes = useStyles();

	return (
		<div className={classes.card} style={{ borderColor: color, color, minHeight: height }}>
			<button className={classes.wrapButton} type="button" aria-label="Кнопка" onClick={onClick} />
			<div className={classes.cardContent}>
				<div className={classes.cardRow}>
					<div>
						<CardElement element={leftTop} />
					</div>
					<div className={classes.cardRightElement}>
						<CardElement element={rightTop} />
					</div>
				</div>

				<CardElement element={center} />

				<div className={classes.cardRow}>
					<div>
						<CardElement element={leftBottom} />
					</div>
					<div className={classes.cardRightElement}>
						<CardElement element={rightBottom} />
					</div>
				</div>
			</div>
		</div>
	);
}

Card.defaultProps = {
	onClick: () => {},
	center: '',
	leftTop: '',
	rightTop: '',
	leftBottom: '',
	rightBottom: '',
	height: 'auto'
};

Card.propTypes = {
	color: PropTypes.string.isRequired,
	center: PropTypes.node,
	leftTop: PropTypes.node,
	rightTop: PropTypes.node,
	leftBottom: PropTypes.node,
	rightBottom: PropTypes.node,
	height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	onClick: PropTypes.func
};
