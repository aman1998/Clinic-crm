import React from 'react';
import { HttpsOutlined as HttpsOutlinedIcon } from '@material-ui/icons';
import PropTypes from 'prop-types';

export function Label({ label, readOnly }) {
	return readOnly ? (
		<>
			{label} <HttpsOutlinedIcon fontSize="inherit" />
		</>
	) : (
		label
	);
}
Label.defaultProps = {
	readOnly: false
};
Label.propTypes = {
	label: PropTypes.any.isRequired,
	readOnly: PropTypes.bool
};
