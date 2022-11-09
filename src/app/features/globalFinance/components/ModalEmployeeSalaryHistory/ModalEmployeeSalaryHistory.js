import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { Box, Grid, Typography, useTheme } from '@material-ui/core';
import { Amount, DatePickerField, DrawerTemplate, TextField } from '../../../../bizKITUi';
import { BlockInfo } from '../../../../common/BlockInfo';
import { employeesService, ENTITY } from '../../../../services';
import { TableReceptions } from './TableReceptions';
import { ErrorMessage } from '../../../../common/ErrorMessage';

export function ModalEmployeeSalaryHistory({ isOpen, onClose, paymentUuid }) {
	const { palette } = useTheme();

	const { isLoading, isError, data } = useQuery([ENTITY.EMPLOYEES_SALARY_HISTORY, paymentUuid], ({ queryKey }) =>
		employeesService.getSalaryHistory(paymentUuid)
	);

	return (
		<DrawerTemplate
			isOpen={isOpen}
			close={onClose}
			isLoading={isLoading}
			width="md"
			header={
				<Typography color="secondary" className="text-xl font-bold text-center">
					Выплата заработной платы
				</Typography>
			}
			content={
				isLoading ? (
					<></>
				) : isError ? (
					<ErrorMessage />
				) : (
					<>
						<Grid container spacing={2}>
							<Grid item xs={12}>
								<TextField
									label="Сотрудник"
									value={data.counterparty.name}
									InputProps={{ readOnly: true }}
									fullWidth
									variant="outlined"
									margin="none"
								/>
							</Grid>
							<Grid item xs={6}>
								<DatePickerField
									label="Дата от"
									inputVariant="outlined"
									margin="none"
									fullWidth
									onlyValid
									readOnly
									value={data.data.period_start}
								/>
							</Grid>
							<Grid item xs={6}>
								<DatePickerField
									label="Дата до"
									inputVariant="outlined"
									margin="none"
									fullWidth
									onlyValid
									readOnly
									value={data.data.period_end}
								/>
							</Grid>
						</Grid>
						<Box className="grid grid-cols-3 gap-16 my-16">
							<BlockInfo title="Оклад" color={palette.text.primary}>
								<Amount value={data.data.salary} />
							</BlockInfo>
							<BlockInfo title="Кол-во приемов" color={palette.text.primary}>
								{data.data.receptions_count}
							</BlockInfo>
							<BlockInfo title="Сумма приемов" color={palette.text.primary}>
								<Amount value={data.data.receptions_summ} />
							</BlockInfo>
							<BlockInfo title="Сумма расходов" color={palette.error.main}>
								<Amount value={data.data.expense} />
							</BlockInfo>
							<BlockInfo title="Сумма доходов" color={palette.success.main}>
								<Amount value={data.data.income} />
							</BlockInfo>
							<BlockInfo title="Итого выплачено" color={palette.primary.main}>
								<Amount value={data.data.payout_total} />
							</BlockInfo>
						</Box>

						<Typography className="my-16" variant="subtitle2">
							Детализация приемов
						</Typography>
						<TableReceptions paymentUuid={data.uuid} />

						<Box className="mt-16" />
						<Typography component="span" variant="subtitle2">
							Статус оплаты:
						</Typography>
						<Typography className="text-success" component="span" variant="subtitle2">
							{' '}
							Выплачено
						</Typography>
					</>
				)
			}
		/>
	);
}

ModalEmployeeSalaryHistory.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	paymentUuid: PropTypes.string.isRequired
};
