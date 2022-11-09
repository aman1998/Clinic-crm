import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Checkbox, IconButton, ListItem, Fab, Typography, LinearProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Delete as DeleteIcon, Add as AddIcon } from '@material-ui/icons';
import { TextField } from '../TextField';

let checkboxId = 0;

const useStyles = makeStyles(theme => ({
	checkList: {
		width: '100%'
	},
	linearProgressWrap: {
		display: 'flex',
		alignItems: 'center'
	},
	linearProgress: {
		flex: 1
	},
	linearProgressTitle: {
		display: 'flex',
		fontWeight: '600',
		margin: '0 6px',
		color: theme.palette.secondary.main
	},
	title: {
		fontWeight: 'bold',
		textAlign: 'left',
		marginLeft: '48px',
		color: theme.palette.secondary.main
	},
	listItem: {
		paddingLeft: '0',
		paddingRight: '0'
	},
	listItemTextField: {
		display: 'flex',
		flex: '1',
		margin: '0 8px'
	},
	listItemButton: {
		margin: '0 4px'
	},
	listItemSpan: {
		width: '40px'
	}
}));

function Progress({ list }) {
	const classes = useStyles();

	const checkedItemsCount = list.filter(item => item.checked).length;
	const progress = list.length > 0 ? (100 * checkedItemsCount) / list.length : 0;

	return (
		<div className={classes.linearProgressWrap}>
			<Typography className={classes.linearProgressTitle} color="secondary">
				{`${checkedItemsCount} / ${list.length}`}
			</Typography>
			<LinearProgress variant="determinate" value={progress} className={classes.linearProgress} />
		</div>
	);
}
Progress.defaultProps = {
	list: []
};
Progress.propTypes = {
	list: PropTypes.arrayOf(
		PropTypes.shape({
			checked: PropTypes.bool.isRequired
		})
	)
};

function Title({ title }) {
	const classes = useStyles();

	return typeof title === 'string' ? (
		<Typography variant="subtitle1" className={classes.title}>
			{title}
		</Typography>
	) : (
		title
	);
}
Title.defaultProps = {
	title: null
};
Title.propTypes = {
	title: PropTypes.node
};

export function Checklist({ title, list, onChange, isDisableEdit, isDisableCheck, isShowStat }) {
	const classes = useStyles();

	const [name, setName] = useState('');

	const handleOnChange = (item, index) => {
		const newList = [...list];

		newList.splice(index, 1, {
			...list[index],
			...item
		});

		onChange(newList);
	};

	const handleOnRemove = index => {
		const newList = [...list];

		newList.splice(index, 1);

		onChange(newList);
	};

	const handleOnAdd = () => {
		const newItem = {
			id: checkboxId,
			name,
			checked: false
		};

		onChange([...list, newItem]);

		setName('');
		checkboxId += 1;
	};

	return (
		<div className={classes.checkList}>
			<Title title={title} />

			{isShowStat && <Progress list={list} />}

			{list.map((checkItem, index) => (
				<ListItem className={classes.listItem} key={checkItem.id} dense>
					<Checkbox
						checked={checkItem.checked}
						disableRipple
						color="primary"
						disabled={isDisableCheck}
						onChange={event => handleOnChange({ checked: event.target.checked }, index)}
					/>
					<TextField
						className={classes.listItemTextField}
						name="name"
						value={checkItem.name}
						variant="outlined"
						multiline
						InputProps={{
							readOnly: isDisableEdit
						}}
						onChange={event => handleOnChange({ name: event.target.value }, index)}
					/>
					<IconButton
						aria-label="Удалить элемент"
						disabled={isDisableEdit}
						onClick={() => handleOnRemove(index)}
					>
						<DeleteIcon />
					</IconButton>
				</ListItem>
			))}

			{!isDisableEdit && (
				<ListItem className={classes.listItem} dense>
					<span className={classes.listItemSpan} />
					<TextField
						className={classes.listItemTextField}
						name="name"
						value={name}
						variant="outlined"
						placeholder="Добавить чекбокс"
						onChange={event => setName(event.target.value)}
					/>
					<Fab
						className={classes.listItemButton}
						size="small"
						color="primary"
						disabled={!name}
						onClick={handleOnAdd}
					>
						<AddIcon />
					</Fab>
				</ListItem>
			)}
		</div>
	);
}

Checklist.defaultProps = {
	isDisableEdit: false,
	isDisableCheck: false,
	isShowStat: false,
	title: ''
};

Checklist.propTypes = {
	title: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
	list: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
			name: PropTypes.string.isRequired,
			checked: PropTypes.bool.isRequired
		})
	).isRequired,
	isDisableEdit: PropTypes.bool,
	isDisableCheck: PropTypes.bool,
	isShowStat: PropTypes.bool,
	onChange: PropTypes.func.isRequired
};
