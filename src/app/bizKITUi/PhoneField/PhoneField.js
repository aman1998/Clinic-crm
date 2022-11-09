import React from 'react';
import { TextField } from '../TextField';
import { InputMask } from '../InputMask';

export function PhoneField({ onChange, ...props }) {
	const handleOnChange = ({ target: { value } }) => {
		onChange(value.replace(/[\s\-()]+/g, ''));
	};

	return (
		<InputMask {...props} mask="+9 999 999 99 99" variant="outlined" onChange={handleOnChange}>
			<TextField />
		</InputMask>
	);
}
