import React from 'react';
import PropTypes from 'prop-types';

export const PenIcon = ({ iconColor }) => {
	return (
		<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M10.5169 0.159834C10.3038 -0.0532782 9.95879 -0.0532782 9.74622 0.159834C9.69226 0.213794 9.60996 0.226887 9.5391 0.199089C8.95427 -0.0254692 8.26643 0.0977198 7.79497 0.569184L1.86813 6.49598C1.78256 6.58101 1.78256 6.71947 1.86813 6.8045L4.64296 9.57933C4.72799 9.66435 4.86589 9.66435 4.95091 9.57933L10.8777 3.65249C11.3498 3.18103 11.4729 2.49318 11.2478 1.90834C11.2206 1.83694 11.2337 1.75518 11.2876 1.70122C11.5007 1.48811 11.5007 1.1431 11.2876 0.930529L10.5169 0.159834ZM10.2384 2.44194C10.3234 2.52697 10.3234 2.6654 10.2384 2.75043L4.95091 8.03794C4.86589 8.12296 4.72799 8.12296 4.64296 8.03794L3.40952 6.8045C3.3245 6.71947 3.3245 6.58101 3.40952 6.49598L8.69702 1.20907C8.78204 1.1235 8.91994 1.1235 9.00497 1.20907L10.2384 2.44194Z"
				fill={iconColor}
			/>
			<path
				d="M0.275463 11.4282C0.113039 11.4723 -0.0363017 11.323 0.00784693 11.1606L0.964952 7.65152C1.0091 7.48965 1.21132 7.43624 1.32959 7.55452L3.88148 10.107C3.99975 10.2252 3.94635 10.4269 3.78447 10.4711L0.275463 11.4282Z"
				fill={iconColor}
			/>
		</svg>
	);
};

PenIcon.defaultProps = {
	iconColor: 'white'
};
PenIcon.propTypes = {
	iconColor: PropTypes.bool
};
