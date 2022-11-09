import React from 'react';
import { TextField as TextFieldLib } from '@material-ui/core';
import { HttpsOutlined as HttpsOutlinedIcon } from '@material-ui/icons';

function Label({ label, readOnly }) {
	return readOnly ? (
		<>
			{label} <HttpsOutlinedIcon fontSize="inherit" />
		</>
	) : (
		label
	);
}

export function TextField({ children, label, ...props }) {
	return (
		<TextFieldLib label={label && <Label label={label} readOnly={props.InputProps?.readOnly} />} {...props}>
			{children}
		</TextFieldLib>
	);
}
