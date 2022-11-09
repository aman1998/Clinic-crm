import React from 'react';
import PropTypes from 'prop-types';
import { Divider, IconButton, InputAdornment } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Add as AddIcon } from '@material-ui/icons';
import { TextField } from '../TextField';

const useStyles = makeStyles(() => ({
	selectIcon: {
		right: 53
	},
	selectDivider: {
		height: 44
	}
}));

export function SelectField({ children, onAdd, addDisabled, InputProps, isAdd, ...props }) {
	const classes = useStyles();

	return (
		<TextField
			select
			variant="outlined"
			SelectProps={{
				classes: { icon: isAdd && classes.selectIcon }
			}}
			InputProps={{
				...InputProps,
				endAdornment: (
					<InputAdornment position="end">
						{isAdd && (
							<>
								<Divider orientation="vertical" className={classes.selectDivider} />
								<IconButton aria-label="Добавить" edge="end" onClick={onAdd} disabled={addDisabled}>
									<AddIcon color="secondary" />
								</IconButton>
							</>
						)}
					</InputAdornment>
				)
			}}
			{...props}
		>
			{children}
		</TextField>
	);
}

SelectField.propTypes = {
	onAdd: PropTypes.bool,
	addDisabled: PropTypes.bool,
	InputProps: PropTypes.objectOf({
		endAdornment: PropTypes.bool
	}),
	isAdd: PropTypes.bool,
	children: PropTypes.node
};

SelectField.defaultProps = {
	isAdd: true,
	onAdd: () => {},
	addDisabled: false,
	InputProps: {},
	children: <></>
};
