import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { DisplayFile } from '../DisplayFile';

const useStyles = makeStyles({
	files: {
		display: 'flex'
	},
	file: {
		marginRight: 5,
		marginLeft: 5
	}
});

export function Files({ files }) {
	const classes = useStyles();

	return (
		<div className={classes.files}>
			{files.map((file, index) => (
				<div className={classes.file} key={index}>
					<DisplayFile file={file} />
				</div>
			))}
		</div>
	);
}
Files.propTypes = {
	files: PropTypes.arrayOf(PropTypes.string).isRequired
};
