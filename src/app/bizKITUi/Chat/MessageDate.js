import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

function formatDate(date) {
	if (moment().startOf('day').valueOf() === moment(date).startOf('day').valueOf()) {
		return moment(date).format('HH:mm');
	}

	return moment(date).format('DD.MM.YYYY');
}

export function MessageDate({ date }) {
	return <div title={moment(date).format('DD MMMM YYYY, HH:mm')}>{date && formatDate(date)}</div>;
}
MessageDate.propTypes = {
	date: PropTypes.instanceOf(Date).isRequired
};
