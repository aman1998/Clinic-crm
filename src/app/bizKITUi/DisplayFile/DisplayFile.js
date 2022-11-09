import React from 'react';
import PropType from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { DescriptionOutlined as DescriptionOutlinedIcon } from '@material-ui/icons';
import { Icon } from '@material-ui/core';
import imageExtensions from './imageExtensions.json';
import videoExtensions from './videoExtensions.json';

const useStyles = makeStyles({
	image: {
		width: 100,
		height: 100,
		objectFit: 'cover'
	},
	video: {
		width: 300,
		height: 100
	}
});

export function DisplayFile({ file }) {
	const classes = useStyles();

	const fileExtension = file.split('.').pop();
	const isImage = imageExtensions.includes(fileExtension);
	const isVideo = videoExtensions.includes(fileExtension);

	switch (true) {
		case isImage:
			return (
				<a href={file} target="_blank" rel="noreferrer">
					<img src={file} alt="" className={classes.image} />
				</a>
			);
		case isVideo:
			// eslint-disable-next-line jsx-a11y/media-has-caption
			return <video src={file} controls className={classes.video} />;
		default:
			return (
				<a href={file} target="_blank" rel="noreferrer">
					<Icon fontSize="large">
						<DescriptionOutlinedIcon fontSize="inherit" />
					</Icon>
				</a>
			);
	}
}
DisplayFile.propTypes = {
	file: PropType.string.isRequired
};
