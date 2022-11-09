import React, { useEffect, useState, useRef, Children } from 'react';
import { Element, scroller } from 'react-scroll';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core';

const PREFIX = 'paperHorizontalScroll';
let id = 0;

const useStyles = makeStyles(theme => ({
	element: {
		display: 'flex',
		overflowX: 'auto'
	}
}));

export function PaperHorizontalScroll({ children, value, offset }) {
	const classes = useStyles();
	const childrenAsArray = Children.toArray(children);
	const lastChildRef = useRef(null);
	const [offsetContainer, setOffsetContainer] = useState(0);

	useEffect(() => {
		if (childrenAsArray.length > 1) {
			setOffsetContainer(lastChildRef?.current?.offsetWidth ?? 0);

			scroller.scrollTo(String(value), {
				duration: 250,
				delay: 100,
				smooth: true,
				horizontal: true,
				containerId: `${PREFIX}${id}`
			});
		}
	}, [childrenAsArray.length, value]);

	useEffect(() => {
		id += 1;
	}, []);

	const isEnableOffset = childrenAsArray.length > 1;

	return (
		<Element id={`${PREFIX}${id}`} className={classes.element}>
			{childrenAsArray.map((child, index) => (
				<div key={index} ref={lastChildRef}>
					<Element name={`${index}`} style={{ marginRight: offset }}>
						{child}
					</Element>
				</div>
			))}

			{isEnableOffset && <div style={{ minWidth: `calc(100% - ${offsetContainer}px)` }} />}
		</Element>
	);
}
PaperHorizontalScroll.defaultProps = {
	offset: '100px'
};
PaperHorizontalScroll.propTypes = {
	children: PropTypes.node.isRequired,
	value: PropTypes.number.isRequired,
	offset: PropTypes.string
};
