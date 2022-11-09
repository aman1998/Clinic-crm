import React from 'react';
import { makeStyles } from '@material-ui/core';
import { Button } from 'app/bizKITUi';

const useStyles = makeStyles(theme => ({
	container: {
		border: '2px solid rgba(181, 181, 181, 0.5)',
		borderRadius: 4
	},
	boldText: {
		fontWeight: 700,
		color: '#3D5170',
		fontSize: 14,
		marginLeft: 25
	},
	header: {
		borderBottom: '2px solid #ABABAB'
	},
	deadline: {
		color: '#F7716E'
	}
}));

export const Todo = () => {
	const classes = useStyles();
	return (
		<div className={classes.container}>
			<div className={`${classes.header} flex justify-between px-8 pt-8`}>
				<div className="mt-12 mb-6">Перезвонить через неделю</div>
				<div className={`${classes.deadline} items-end ml-6 `}> Просрочена</div>
			</div>
			<div>
				<div className="my-8 px-8 ">
					<div>
						Выполнить до: <span className={classes.boldText}>29.11.2021</span>
					</div>
					<div>
						Исполнитель: <span className={classes.boldText}>Иванов Иван</span>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-10 mt-6 px-8 pb-8">
					<Button type="button" color="primary">
						Подробнее
					</Button>
					<Button type="button" customColor="primary">
						Завершить
					</Button>
				</div>
			</div>
		</div>
	);
};
