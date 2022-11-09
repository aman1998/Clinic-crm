import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
	audio: {
		width: '310px',
		margin: 0
	}
});

export function Audio({ src }) {
	const classes = useStyles();

	// eslint-disable-next-line jsx-a11y/media-has-caption
	return <audio className={classes.audio} controls src={src} />;
}
Audio.propTypes = {
	src: PropTypes.string.isRequired
};
