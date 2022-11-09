import React, { useState } from 'react';
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { DropzoneAreaBase as DropzoneAreaLib } from 'material-ui-dropzone';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { PreviewFile } from '../PreviewFile';

const materialTheme = theme =>
	createMuiTheme({
		...theme,
		overrides: {
			MuiDropzoneArea: {
				root: {
					marginTop: '16px',
					borderColor: theme.palette.primary.main,
					borderWidth: '1px',
					minHeight: 74
				},
				textContainer: {
					padding: ' 0 20px',
					fontSize: '20px',
					color: theme.palette.secondary.main,
					display: 'flex',
					alignItems: 'center'
				},
				text: {
					fontSize: '14px'
				},
				icon: {
					color: theme.palette.primary.main,
					width: '40px',
					height: '40px',
					marginLeft: '20px'
				}
			}
		}
	});

const useStyles = makeStyles(theme => ({
	mt4: {
		marginTop: theme.spacing(1)
	},
	mt10: {
		marginTop: theme.spacing(2)
	},
	hide: {
		display: 'none'
	}
}));

export function DropzoneArea({
	files,
	filesLimit,
	serverFiles,
	dropzoneText,
	disabled,
	onAddFiles,
	onDeleteFile,
	onDeleteServerFile
}) {
	const classes = useStyles();

	const [deleteServerFiles, setDeleteServerFiles] = useState(new Set());

	const handleOnDeleteFile = index => {
		const copyFiles = files.slice();

		copyFiles.splice(index, 1);
		onDeleteFile(copyFiles);
	};

	const handleOnDeleteServerFile = index => {
		deleteServerFiles.add(serverFiles[index]);
		setDeleteServerFiles(deleteServerFiles);

		onDeleteServerFile(index);
	};

	const handleOnAddFiles = array => {
		const newArray = array.map(item => item.file);

		onAddFiles(newArray);
	};

	return (
		<>
			<ThemeProvider theme={materialTheme}>
				<DropzoneAreaLib
					dropzoneText={dropzoneText}
					showPreviewsInDropzone={false}
					showAlerts={false}
					filesLimit={filesLimit}
					fileObjects={[]}
					dropzoneProps={{
						disabled
					}}
					onAdd={handleOnAddFiles}
				/>
			</ThemeProvider>

			<div className={classes.mt10}>
				{files.map((item, index) => (
					<PreviewFile
						key={index}
						name={item.name}
						className={classes.mt4}
						disabled={disabled}
						onDelete={() => handleOnDeleteFile(index)}
					/>
				))}

				{serverFiles.map((item, index) => (
					<PreviewFile
						key={index}
						name={item.split('/').pop()}
						url={item}
						className={clsx(classes.mt4, { [classes.hide]: deleteServerFiles.has(serverFiles[index]) })}
						disabled={disabled}
						onDelete={() => handleOnDeleteServerFile(index)}
					/>
				))}
			</div>
		</>
	);
}
DropzoneArea.defaultProps = {
	disabled: false,
	files: [],
	filesLimit: 100,
	serverFiles: [],
	onDeleteServerFile: () => {},
	onDeleteFile: () => {}
};
DropzoneArea.propTypes = {
	files: PropTypes.arrayOf(PropTypes.instanceOf(Blob)),
	filesLimit: PropTypes.number,
	serverFiles: PropTypes.arrayOf(PropTypes.string),
	dropzoneText: PropTypes.string.isRequired,
	disabled: PropTypes.bool,
	onAddFiles: PropTypes.func.isRequired,
	onDeleteFile: PropTypes.func,
	onDeleteServerFile: PropTypes.func
};
