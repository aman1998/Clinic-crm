import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
	makeStyles,
	TextField,
	Button,
	IconButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	ClickAwayListener,
	InputAdornment
} from '@material-ui/core';
import {
	Delete as DeleteIcon,
	MoreVert as MoreVertIcon,
	Edit as EditIcon,
	Check as CheckIcon,
	Add as AddIcon
} from '@material-ui/icons';
import { Checklist } from '../../bizKITUi';

const useStyles = makeStyles({
	button: {
		marginLeft: '20px',
		width: '50px',
		height: '53px'
	}
});

function Title({ onRemove, isDisableEdit, name, onChange }) {
	const [isShowNameForm, setIsShowNameForm] = useState(false);
	const [newName, setNewName] = useState('');
	const [anchorMenu, setAnchorMenu] = useState(null);

	const handleOpenNameForm = () => {
		if (isDisableEdit) {
			return;
		}
		setAnchorMenu(null);
		setNewName(name);
		setIsShowNameForm(true);
	};

	const handleCancel = () => {
		setIsShowNameForm(false);
		setNewName('');
	};

	const handleSubmitName = () => {
		onChange(newName);
		setIsShowNameForm(false);
		setNewName('');
	};

	return (
		<div className="flex justify-between items-center mt-16">
			{isShowNameForm ? (
				<ClickAwayListener onClickAway={handleCancel}>
					<TextField
						value={newName}
						name="name"
						onChange={event => setNewName(event.target.value)}
						variant="outlined"
						margin="dense"
						autoFocus
						helperText={!newName && 'Поле не может быть пустым'}
						error={!newName}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton type="submit" disabled={!newName} onClick={handleSubmitName}>
										<CheckIcon />
									</IconButton>
								</InputAdornment>
							)
						}}
					/>
				</ClickAwayListener>
			) : (
				<Button
					color="secondary"
					className="text-14 font-600 cursor-pointer normal-case"
					onClick={handleOpenNameForm}
				>
					{name}
				</Button>
			)}

			<IconButton
				variant="outlined"
				size="small"
				disabled={isDisableEdit}
				onClick={event => setAnchorMenu(event.currentTarget)}
			>
				<MoreVertIcon />
			</IconButton>
			<Menu open={Boolean(anchorMenu)} anchorEl={anchorMenu} onClose={() => setAnchorMenu(null)}>
				<MenuItem onClick={onRemove}>
					<ListItemIcon className="min-w-40">
						<DeleteIcon />
					</ListItemIcon>
					<ListItemText primary="Удалить чек-лист" />
				</MenuItem>
				<MenuItem onClick={handleOpenNameForm}>
					<ListItemIcon className="min-w-40">
						<EditIcon />
					</ListItemIcon>
					<ListItemText primary="Переименовать чек-лист" />
				</MenuItem>
			</Menu>
		</div>
	);
}

Title.propTypes = {
	onRemove: PropTypes.func.isRequired,
	isDisableEdit: PropTypes.bool.isRequired,
	name: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired
};

let checklistId = 0;

export function FormCheckLists({ lists, onChange, isDisableEdit, isDisableCheck }) {
	const classes = useStyles();
	const [newChecklistName, setNewCheckListName] = useState('');

	const handleOnAdd = () => {
		const newChecklists = [...(lists ?? []), { name: newChecklistName, id: checklistId, checkItems: [] }];

		onChange(newChecklists);

		setNewCheckListName('');

		checklistId += 1;
	};

	const handleOnRemove = index => {
		const newChecklists = [...lists];

		newChecklists.splice(index, 1);

		onChange(newChecklists);
	};

	const handleOnChange = (item, index) => {
		const newChecklists = [...lists];

		const isName = typeof item === 'string';

		const newItem = isName ? { name: item } : { checkItems: item };

		newChecklists.splice(index, 1, {
			...lists[index],
			...newItem
		});

		onChange(newChecklists);
	};
	return (
		<>
			<div className="flex w-full">
				<TextField
					label="Новый чек-лист"
					type="text"
					value={newChecklistName}
					variant="outlined"
					fullWidth
					disabled={isDisableEdit}
					onChange={event => setNewCheckListName(event.target.value)}
				/>
				<Button
					variant="contained"
					color="primary"
					size="large"
					className={classes.button}
					disabled={!newChecklistName && isDisableEdit}
					onClick={handleOnAdd}
				>
					<AddIcon />
				</Button>
			</div>

			{lists.map((checklist, index) => (
				<Checklist
					title={
						<Title
							isDisableEdit={isDisableEdit}
							name={checklist.name}
							onRemove={() => handleOnRemove(index)}
							onChange={name => handleOnChange(name, index)}
						/>
					}
					key={checklist.id}
					list={checklist.checkItems}
					index={index}
					isDisableEdit={isDisableEdit}
					isDisableCheck={isDisableCheck}
					isShowStat
					onChange={list => handleOnChange(list, index)}
				/>
			))}
		</>
	);
}
FormCheckLists.defaultProps = {
	isDisableEdit: false,
	isDisableCheck: false
};
FormCheckLists.propTypes = {
	lists: PropTypes.array.isRequired,
	onChange: PropTypes.func.isRequired,
	isDisableCheck: PropTypes.bool,
	isDisableEdit: PropTypes.bool
};
