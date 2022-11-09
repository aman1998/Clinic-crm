import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import moment from 'moment';
import { Typography } from '@material-ui/core';
import { Amount, DataTable } from '../../../../bizKITUi';
import { employeesService, ENTITY } from '../../../../services';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { getShortName } from '../../../../utils';
import { PayoutDetails } from '../PayoutDetails';

export function TableReceptions({ paymentUuid }) {
	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);

	const { isLoading, isError, data } = useQuery(
		[ENTITY.DOCTOR_SALARY_RECEPTIONS, { limit, offset: page * limit, payment: paymentUuid }],
		({ queryKey }) => employeesService.getCounterpartySalaryReceptions(queryKey[1])
	);

	const columns = [
		{
			name: 'date_time',
			label: 'Дата и время',
			options: {
				customBodyRenderLite: dataIndex => {
					const { date_time } = data.results[dataIndex];
					return moment(date_time).format('DD.MM.YYYY HH:mm');
				}
			}
		},
		{
			name: 'patient',
			label: 'Пациент',
			options: {
				customBodyRenderLite: dataIndex => {
					const { patient } = data.results[dataIndex];
					return <span className="whitespace-no-wrap">{getShortName(patient)}</span>;
				}
			}
		},
		{
			name: 'service',
			label: 'Услуга',
			options: {
				customBodyRenderLite: dataIndex => {
					const { service } = data.results[dataIndex];
					return service.name;
				}
			}
		},
		{
			name: 'cost',
			label: 'Сумма приема',
			options: {
				customBodyRenderLite: dataIndex => {
					const { cost } = data.results[dataIndex];
					return <Amount value={cost} />;
				}
			}
		},
		{
			name: 'expense',
			label: 'Расходы',
			options: {
				customBodyRenderLite: dataIndex => {
					const { expense } = data.results[dataIndex];
					return <Amount value={expense} />;
				}
			}
		},
		{
			name: 'payout',
			label: 'Выплата',
			options: {
				customBodyRenderLite: dataIndex => {
					const { payout_percent, payout_value, payout_percent_with_expense } = data.results[dataIndex];
					return (
						<PayoutDetails
							payoutPercent={payout_percent}
							payoutPercentWithExpense={payout_percent_with_expense}
							payoutValue={payout_value}
						/>
					);
				}
			}
		},
		{
			name: 'income',
			label: 'Доход',
			options: {
				customBodyRenderLite: dataIndex => {
					const { income } = data.results[dataIndex];
					return <Amount className="text-success" value={income} />;
				}
			}
		}
	];
	const tableOptions = {
		serverSide: true,
		rowsPerPage: limit,
		page,
		count: data?.count ?? 0,
		onChangePage: newPage => setPage(newPage),
		onChangeRowsPerPage: newLimit => setLimit(newLimit)
	};

	if (isLoading) {
		return <FuseLoading />;
	}
	if (isError) {
		return <ErrorMessage />;
	}
	return (
		<>
			<DataTable data={data.results} columns={columns} options={tableOptions} />
			<div className="mt-10 text-right">
				Выплаты:{' '}
				<Typography component="span" color="error">
					С учётом расходов
				</Typography>{' '}
				/{' '}
				<Typography component="span" color="primary">
					От полной стоимости
				</Typography>
			</div>
		</>
	);
}
TableReceptions.propTypes = {
	paymentUuid: PropTypes.string.isRequired
};
