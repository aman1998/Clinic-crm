import React from 'react';
import PropTypes from 'prop-types';

export function ErrorMessage({ message }) {
	const displayMessage = message ?? 'Произошла ошибка, попробуйте перезагрузить страницу.';

	return <div>{displayMessage}</div>;
}
ErrorMessage.defaultProps = {
	message: null
};
ErrorMessage.propTypes = {
	message: PropTypes.string
};
