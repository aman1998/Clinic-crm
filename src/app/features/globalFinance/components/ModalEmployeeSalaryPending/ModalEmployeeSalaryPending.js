import React from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery } from 'react-query';
import { Box, Grid, Typography, useTheme } from '@material-ui/core';
import { Amount, Button, DatePickerField, DrawerTemplate, TextField } from '../../../../bizKITUi';
import { BlockInfo } from '../../../../common/BlockInfo';
import { employeesService, ENTITY } from '../../../../services';
import { defaults } from '../../../../utils';
import { TableReceptions } from './TableReceptions';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { useAlert, useDebouncedFilterForm } from '../../../../hooks';

const now = new Date();
const defaultValues = {
	period_start: new Date(),
	period_end: new Date(now.setMonth(now.getMonth() + 1))
};

export function ModalEmployeeSalaryPending({ isOpen, onClose, counterpartyUuid, counterpartyType, initialValues }) {
	const { alertSuccess, alertError } = useAlert();
	const { palette } = useTheme();

	const { form, debouncedForm, setInForm } = useDebouncedFilterForm(defaults(initialValues, defaultValues));
	const { isLoading, isError, data } = useQuery(
		[ENTITY.DOCTOR_SALARY, counterpartyType, counterpartyUuid, debouncedForm],
		({ queryKey }) => employeesService.getCounterpartySalary(counterpartyType, counterpartyUuid, queryKey[3])
	);

	const paySalary = useMutation(payload => employeesService.payCounterpartySalary(payload));
	const handlePaySalary = () => {
		const payload = {
			...form,
			counterparty_type: counterpartyType,
			counterparty: counterpartyUuid
		};
		paySalary
			.mutateAsync(payload)
			.then(() => {
				alertSuccess('ЗП успешно выплачена');
				onClose();
			})
			.catch(error => {
				alertError('Не удалось выплатить ЗП');
			});
	};

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
									value={form.period_start}
									onChange={date => setInForm('period_start', date)}
								/>
							</Grid>
							<Grid item xs={6}>
								<DatePickerField
									label="Дата до"
									inputVariant="outlined"
									margin="none"
									fullWidth
									onlyValid
									value={form.period_end}
									onChange={date => setInForm('period_end', date)}
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
							<BlockInfo title="Итого к выплате" color={palette.primary.main}>
								<Amount value={data.data.payout_total} />
							</BlockInfo>
						</Box>

						<Typography className="my-16" variant="subtitle2">
							Детализация приемов
						</Typography>
						<TableReceptions
							counterpartyUuid={counterpartyUuid}
							counterpartyType={counterpartyType}
							periodStart={form.period_start}
							periodEnd={form.period_end}
						/>

						<Box className="mt-16" />
						<Typography component="span" variant="subtitle2">
							Статус оплаты:
						</Typography>
						<Typography className="text-error" component="span" variant="subtitle2">
							{' '}
							Ожидает оплаты
						</Typography>
					</>
				)
			}
			footer={
				<Button onClick={handlePaySalary} disabled={isError || isLoading || paySalary.isLoading} textNormal>
					Провести выплату
				</Button>
			}
		/>
	);
}

ModalEmployeeSalaryPending.defaultProps = {
	initialValues: {}
};
ModalEmployeeSalaryPending.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	counterpartyUuid: PropTypes.string.isRequired,
	counterpartyType: PropTypes.string.isRequired,
	initialValues: PropTypes.shape({
		period_start: PropTypes.instanceOf(Date).isRequired,
		period_end: PropTypes.instanceOf(Date)
	})
};
