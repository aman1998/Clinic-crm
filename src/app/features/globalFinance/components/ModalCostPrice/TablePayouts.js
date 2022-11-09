import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { TableBody, TableCell, TableRow } from '@material-ui/core';
import { Amount, DataTable } from '../../../../bizKITUi';
import { clinicService, ENTITY, globalFinanceService } from '../../../../services';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';

export function TablePayouts({ receptionUuid }) {
	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);

	const { isLoading, isError, data: payouts } = useQuery(
		[ENTITY.CLINIC_RECEPTION_PAYOUTS, receptionUuid, { limit, offset: page * limit }],
		({ queryKey }) => clinicService.getReceptionPayouts(receptionUuid, queryKey[2])
	);

	const columns = [
		{
			name: 'counterparty_name',
			label: 'Контрагент',
			options: {
				customBodyRenderLite: dataIndex => {
					const { counterparty_name } = payouts.results[dataIndex];
					return counterparty_name;
				}
			}
		},
		{
			name: 'type',
			label: 'Тип',
			options: {
				customBodyRenderLite: dataIndex => {
					const { counterparty_type } = payouts.results[dataIndex];
					return globalFinanceService.getCounterpartyTypeNameByType(counterparty_type);
				}
			}
		},
		{
			name: 'value',
			label: 'Значение',
			options: {
				customBodyRenderLite: dataIndex => {
					const { percent, value } = payouts.results[dataIndex];
					return percent ? `${value}%` : <Amount value={value} />;
				}
			}
		},
		{
			name: 'plan_cost',
			label: 'Сумма',
			options: {
				customBodyRenderLite: dataIndex => {
					const { sum } = payouts.results[dataIndex];
					return <Amount value={sum} />;
				}
			}
		}
	];
	const tableOptions = {
		serverSide: true,
		rowsPerPage: limit,
		page,
		count: payouts?.count ?? 0,
		onChangePage: newPage => setPage(newPage),
		onChangeRowsPerPage: newLimit => setLimit(newLimit),
		customTableBodyFooterRender() {
			return (
				payouts.count > 0 && (
					<TableBody>
						<TableRow>
							<TableCell className="font-bold">Итого</TableCell>
							<TableCell />
							<TableCell />
							<TableCell className="font-bold">
								<Amount value={payouts.total.sum} />
							</TableCell>
						</TableRow>
					</TableBody>
				)
			);
		}
	};

	if (isLoading) {
		return <FuseLoading />;
	}
	if (isError) {
		return <ErrorMessage />;
	}
	return <DataTable data={payouts.results} columns={columns} options={tableOptions} />;
}
TablePayouts.propTypes = {
	receptionUuid: PropTypes.string.isRequired
};
