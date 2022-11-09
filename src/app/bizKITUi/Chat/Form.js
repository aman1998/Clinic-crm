import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '@material-ui/core';
import { Send as SendIcon, AttachFile as AttachFileIcon } from '@material-ui/icons';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { TextField } from '../TextField';
import { PreviewFile } from '../PreviewFile';

const useStyles = makeStyles({
	fileItem: {
		marginTop: 5
	}
});

export function Form({ onSubmit }) {
	const classes = useStyles();
	const theme = useTheme();

	const [text, setText] = useState('');
	const [files, setFiles] = useState([]);

	const handleOnSendMessage = sendMessage => {
		if (!sendMessage && files.length === 0) {
			return;
		}

		onSubmit({ text, files });

		setText('');
		setFiles([]);
	};

	const handleOnSubmit = event => {
		event.preventDefault();
		handleOnSendMessage(text);
	};

	const handleOnKeyPress = event => {
		switch (event.charCode) {
			case 13:
				event.preventDefault();
				handleOnSendMessage(text);
				break;
			default:
		}
	};

	const inputFileRef = useRef(null);
	const handleOnDeleteFile = index => {
		const newFiles = files.filter((_, fileIndex) => fileIndex !== index);

		setFiles(newFiles);
	};
	const handleOnChangeFile = event => {
		setFiles([...event.target.files]);
		inputFileRef.current.value = '';
	};

	return (
		<form onSubmit={handleOnSubmit}>
			<input ref={inputFileRef} type="file" multiple hidden onChange={handleOnChangeFile} />

			<TextField
				value={text}
				aria-label="Сообщение"
				multiline
				rowsMax={6}
				size="small"
				name="message"
				placeholder="Сообщение"
				variant="outlined"
				fullWidth
				InputProps={{
					startAdornment: (
						<IconButton size="small" onClick={() => inputFileRef.current.click()}>
							<AttachFileIcon color="inherit" fontSize="inherit" />
						</IconButton>
					),
					endAdornment: (
						<IconButton type="submit" size="small" style={{ color: theme.palette.success.main }}>
							<SendIcon color="inherit" fontSize="inherit" />
						</IconButton>
					)
				}}
				onKeyPress={handleOnKeyPress}
				onChange={event => setText(event.target.value)}
			/>

			{files.map((file, index) => (
				<PreviewFile
					key={index}
					name={file.name}
					className={classes.fileItem}
					onDelete={() => handleOnDeleteFile(index)}
				/>
			))}
		</form>
	);
}
Form.defaultProps = {
	onSubmit: () => {}
};
Form.propTypes = {
	onSubmit: PropTypes.func
};
