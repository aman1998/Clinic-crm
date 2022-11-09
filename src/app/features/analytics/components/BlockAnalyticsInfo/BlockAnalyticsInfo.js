import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { Typography, Paper } from '@material-ui/core';

export function BlockAnalyticsInfo({ title, value, info, row }) {
	return (
		<Paper className="p-16 h-full">
			<div className={clsx({ flex: row }, 'items-center')}>
				<Typography color="secondary" className={clsx({ 'mb-10': !row })}>
					{title}
				</Typography>

				<div className="ml-auto font-bold text-4xl">{value}</div>
			</div>

			{info && <div className="mt-10">{info}</div>}
		</Paper>
	);
}
BlockAnalyticsInfo.defaultProps = {
	row: true
};
BlockAnalyticsInfo.propTypes = {
	title: PropTypes.string.isRequired,
	value: PropTypes.element.isRequired,
	info: PropTypes.element,
	row: PropTypes.bool
};
