import React, { useEffect } from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import TextField from '@material-ui/core/TextField';
import { useStateForm } from '../../../../../../../hooks';

function CardChecklistItem({ item, onListItemChange, index, onListItemRemove }) {
	const { form, handleChange } = useStateForm(item);

	useEffect(() => {
		if (!form || !index) {
			return;
		}
		onListItemChange(form, index);
	}, [form, index, onListItemChange]);

	if (!form) {
		return null;
	}

	return (
		<ListItem className="px-0" key={form.id} dense>
			<Checkbox checked={form.checked} name="checked" onChange={handleChange} tabIndex={-1} disableRipple />
			<TextField
				className="flex flex-1 mx-8"
				name="name"
				value={form.name}
				onChange={handleChange}
				variant="outlined"
			/>
			<IconButton aria-label="Delete" onClick={onListItemRemove}>
				<Icon>delete</Icon>
			</IconButton>
		</ListItem>
	);
}

export default CardChecklistItem;
