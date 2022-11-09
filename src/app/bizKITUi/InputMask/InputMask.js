import React from 'react';
import InputMaskLib from 'react-input-mask';

export function InputMask({ children, ...props }) {
	const getChildren = propsElement => {
		return React.cloneElement(children, propsElement);
	};

	return <InputMaskLib {...props}>{getChildren}</InputMaskLib>;
}
