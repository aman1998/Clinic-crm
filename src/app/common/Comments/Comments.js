import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { useQuery } from 'react-query';
import _ from '@lodash';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import SendIcon from '@material-ui/icons/Send';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import PropTypes from 'prop-types';
import { authService, ENTITY } from '../../services';

const useStyles = makeStyles(theme => ({
	mainContent: {
		display: 'flex',
		flexDirection: 'column',
		height: '100%'
	},
	cardSection: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
		height: '100%',
		overflow: 'hidden'
	},
	label: {
		fontSize: '16px',
		fontWeight: 'bold'
	},
	button: {
		marginLeft: '10px',
		width: '40px',
		height: '40px'
	},
	root: {
		height: '64px',
		padding: '2px 0',
		display: 'flex',
		alignItems: 'center',
		boxShadow: 'none',
		borderTop: '2px solid #E0E0E0',
		borderRadius: '4px'
	},
	input: {
		marginLeft: theme.spacing(1),
		flex: 1
	},
	iconButton: {
		padding: 10
	},
	divider: {
		height: 50,
		margin: 4
	},
	commentsBlock: {
		padding: 20,
		marginTop: 20,
		overflowY: 'scroll'
	},
	tabsRoot: {
		width: '100%',
		borderBottom: '2px solid #E0E0E0'
	},
	tagsList: {
		position: 'absolute',
		bottom: '60px',
		backgroundColor: '#fff'
	},
	userTag: {
		color: theme.palette.primary.main
	}
}));

const StyledTab = withStyles({
	root: {
		fontSize: '14px',
		fontWeight: 'normal',
		textTransform: 'none'
	}
})(Tab);

export function Comments({ comments, history, isDisableAdd, addComment, isHideHistory }) {
	const classes = useStyles();

	const inputRef = useRef();

	const { data: users } = useQuery([ENTITY.USER, { limit: Number.MAX_SAFE_INTEGER }], () =>
		authService.getUsers({ limit: Number.MAX_SAFE_INTEGER })
	);

	const [formattedUsers, setFormattedUsers] = useState([]);
	const [filteredUsers, setFilteredUsers] = useState([]);

	const [value, setValue] = useState(0);
	const [newCommentText, setNewCommentText] = useState('');

	const containerRef = useRef();
	useEffect(() => {
		containerRef.current.scrollTo(0, containerRef.current.scrollHeight);
	}, [comments]);

	useEffect(() => {
		if (!_.isEmpty(users)) {
			const convertedUsers = users?.results?.map(user => {
				return { name: `@${user.first_name}${user.last_name}`, uuid: user.uuid };
			});
			setFormattedUsers(convertedUsers);
		}
	}, [users, setFormattedUsers]);

	const setCommentText = text => {
		setNewCommentText(text);
		const splittedText = text.split(' ');
		const lastWord = splittedText[splittedText.length - 1];
		if (lastWord.indexOf('@') === 0) {
			const newUserList = formattedUsers.filter(user => user.name.toLowerCase().includes(lastWord.toLowerCase()));
			setFilteredUsers(newUserList);
		} else {
			setFilteredUsers([]);
		}
	};
	const addUserTag = userTag => {
		const splittedText = newCommentText.split(' ');
		splittedText[splittedText.length - 1] = `${userTag} `;
		setNewCommentText(splittedText.join(' '));
		setFilteredUsers([]);
		inputRef.current.focus();
	};
	const addNewNote = () => {
		const splittedText = newCommentText.split(' ');

		const convertedComment = splittedText
			.map(word =>
				word.replace(new RegExp(`^(${formattedUsers.map(user => user.name).join('|')})`), mention => {
					const mentionedUser = formattedUsers.find(user => user.name === mention);
					return `<span style='color: #007BFF;' user-uuid='${mentionedUser.uuid}'>${mention}</span>`;
				})
			)
			.join(' ');

		addComment(convertedComment);
		setNewCommentText('');
	};

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	const listenKeyDown = e => {
		if (e.keyCode === 13) {
			e.preventDefault();
			if (newCommentText.trim() !== '') {
				addNewNote();
			}
		}
	};

	return (
		<div className={classes.mainContent}>
			<Tabs
				className={classes.tabsRoot}
				value={value}
				onChange={handleChange}
				indicatorColor="primary"
				textColor="primary"
				variant="fullWidth"
			>
				<StyledTab label="Комментарии" />
				{!isHideHistory && <StyledTab label="История" />}
			</Tabs>
			<div className={classes.cardSection}>
				<div
					ref={containerRef}
					className={clsx(classes.commentsBlock, 'flex flex-col mt-0 ')}
					style={{
						position: 'relative'
					}}
				>
					{value === 0 && comments}
					{value === 1 && history}
				</div>
				{value === 0 && (
					<Paper component="form" className={classes.root}>
						{filteredUsers.length > 0 && (
							<List component="nav" aria-label="secondary mailbox folder" className={classes.tagsList}>
								{filteredUsers.map(user => (
									<ListItem key={user.uuid} dense button onClick={() => addUserTag(user.name)}>
										<ListItemText primary={user.name} />
									</ListItem>
								))}
							</List>
						)}
						<InputBase
							inputRef={inputRef}
							className={classes.input}
							placeholder="Написать комментарий или @уведомление"
							value={newCommentText}
							onChange={e => setCommentText(e.target.value)}
							onKeyDown={e => listenKeyDown(e)}
							disabled={isDisableAdd}
						/>
						<Divider className={classes.divider} orientation="vertical" />
						<IconButton
							color="secondary"
							disabled={newCommentText === ''}
							className={classes.iconButton}
							onClick={addNewNote}
							aria-label="directions"
						>
							<SendIcon />
						</IconButton>
					</Paper>
				)}
			</div>
		</div>
	);
}
Comments.defaultProps = {
	isDisableAdd: false,
	isHideHistory: false,
	history: <></>
};
Comments.propTypes = {
	comments: PropTypes.element.isRequired,
	history: PropTypes.element,
	isDisableAdd: PropTypes.bool,
	addComment: PropTypes.func.isRequired,
	isHideHistory: PropTypes.bool
};
