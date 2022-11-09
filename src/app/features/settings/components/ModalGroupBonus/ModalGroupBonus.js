import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles, Typography } from '@material-ui/core';
import { Controller, useForm } from 'react-hook-form';
import { productsService } from 'app/services';
import { useMutation } from 'react-query';
import { useAlert } from 'app/hooks';
import { DrawerTemplate, Button, TextField, DatePickerField } from '../../../../bizKITUi';
import { TableEmployees } from './FormGroupBonus/TableEmployees';

const defaultValues = {
	name: '',
	date_time_start: null,
	date_time_end: null,
	employees: []
};

const useStyles = makeStyles(() => ({
	button: {
		marginTop: 16,
		width: 200
	}
}));

export function ModalGroupBonus({ groupBonusUuid, onClose, isOpen }) {
	const modalTitle = groupBonusUuid ? 'Изменить группу' : 'Добавить новую группу';
	const classes = useStyles();
	const { alertSuccess, alertError } = useAlert();

	const { control, errors, clearErrors, reset, getValues } = useForm({
		mode: 'onBlur',
		defaultValues: { ...defaultValues }
	});

	const createGroupBonus = useMutation(payload => productsService.createGroupBonus(payload));

	const handleOnCreateGroupBonus = event => {
		event.preventDefault();
		clearErrors();

		createGroupBonus
			.mutateAsync(getValues())
			.then(() => {
				alertSuccess('Групповой бонус успешно создан');
				reset(defaultValues);
			})
			.catch(error => {
				alertError('Не удалось создать групповой бонус');
			});
	};

	return (
		<DrawerTemplate
			close={onClose}
			isOpen={isOpen}
			width="sm"
			header={
				<Typography variant="h6" component="h2">
					{modalTitle}
				</Typography>
			}
			content={
				<div>
					<form>
						<Controller
							as={<TextField />}
							control={control}
							fullWidth
							label="Наименование"
							variant="outlined"
							name="name"
							className="mb-10"
							error={!!errors.name}
							helperText={errors.name?.message}
						/>
						<div className="flex">
							<Controller
								control={control}
								className="mb-10"
								name="date_time_start"
								as={
									<DatePickerField
										label="Дата начала"
										fullWidth
										margin="none"
										variant="outlined"
										error={!!errors.date_time_start}
										helperText={errors.date_time_start?.message}
									/>
								}
							/>
							<Controller
								control={control}
								name="date_time_end"
								className="mb-10 ml-10"
								as={
									<DatePickerField
										label="Дата окончания"
										fullWidth
										margin="none"
										variant="outlined"
										error={!!errors.date_time_end}
										helperText={errors.date_time_end?.message}
									/>
								}
							/>
						</div>
						<Controller
							control={control}
							name="employees"
							render={({ value, onChange }) => <TableEmployees employees={value} onChange={onChange} />}
						/>
					</form>
				</div>
			}
			footer={
				!groupBonusUuid ? (
					<Button textNormal onClick={handleOnCreateGroupBonus} className={classes.button}>
						Сохранить
					</Button>
				) : (
					<Button textNormal className={classes.button}>
						Изменить
					</Button>
				)
			}
		/>
	);
}

ModalGroupBonus.defaultProps = {
	groupBonusUuid: null
};

ModalGroupBonus.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	groupBonusUuid: PropTypes.string,
	onClose: PropTypes.func.isRequired
};
