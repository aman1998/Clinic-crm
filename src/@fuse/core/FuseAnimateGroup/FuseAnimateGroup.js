import PropTypes from 'prop-types';
import React from 'react';
import { VelocityTransitionGroup } from 'velocity-react';
import 'velocity-animate/velocity.ui';

const enterAnimationDefaults = {
	animation: 'transition.fadeIn',
	stagger: 50,
	duration: 200,
	display: null,
	visibility: 'visible',
	delay: 0
};

const leaveAnimationDefaults = {
	stagger: 50,
	duration: 200,
	display: null,
	visibility: 'visible',
	delay: 0
};

function FuseAnimateGroup(props) {
	return (
		<VelocityTransitionGroup
			{...props}
			enter={{ ...enterAnimationDefaults, ...props.enter }}
			leave={{ ...leaveAnimationDefaults, ...props.leave }}
		/>
	);
}

FuseAnimateGroup.defaultProps = {
	enter: enterAnimationDefaults,
	leave: leaveAnimationDefaults,
	easing: [0.4, 0.0, 0.2, 1],
	runOnMount: true,
	enterHideStyle: {
		visibility: 'visible'
	},
	enterShowStyle: {
		visibility: 'hidden'
	},
	children: null
};

FuseAnimateGroup.propTypes = {
	enter: PropTypes.shape({
		animation: PropTypes.string,
		stagger: PropTypes.number,
		duration: PropTypes.number,
		display: PropTypes.string,
		visibility: PropTypes.string,
		delay: PropTypes.number
	}),
	leave: PropTypes.shape({
		stagger: PropTypes.number,
		duration: PropTypes.number,
		display: PropTypes.string,
		visibility: PropTypes.string,
		delay: PropTypes.number
	}),
	enterHideStyle: PropTypes.object,
	enterShowStyle: PropTypes.object,
	easing: PropTypes.arrayOf(PropTypes.number),
	runOnMount: PropTypes.bool,
	children: PropTypes.node
};

export default React.memo(FuseAnimateGroup);
