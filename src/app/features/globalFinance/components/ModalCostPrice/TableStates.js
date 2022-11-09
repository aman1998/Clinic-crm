import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { TableBody, TableCell, TableRow } from '@material-ui/core';
import { Amount, DataTable } from '../../../../bizKITUi';
import { clinicService, ENTITY } from '../../../../services';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';

export function TableStates({ receptionUuid }) {
	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);

	const { isLoading, isError, data: states } = useQuery(
		[ENTITY.CLINIC_RECEPTION_STATES, receptionUuid, { limit, offset: page * limit }],
		({ queryKey }) => clinicService.getClinicReceptionStates(receptionUuid, queryKey[2])
	);

	const columns = [
		{
			name: 'name',
			label: 'Статья расходов',
			options: {
				customBodyRenderLite: dataIndex => {
					const { state } = states.results[dataIndex];
					return state.name;
				}
			}
		},
		{
			name: 'cost',
			label: 'Значение',
			options: {
				customBodyRenderLite: dataIndex => {
					const { percent, value } = states.results[dataIndex];
					return percent ? `${value}%` : <Amount value={value} />;
				}
			}
		},
		{
			name: 'plan_count',
			label: 'Тип расчета',
			options: {
				customBodyRenderLite: dataIndex => {
					const { percent, type } = states.results[dataIndex];
					return percent ? clinicService.getCalculationByType(type).name : 'Фиксированная сумма';
				}
			}
		},
		{
			name: 'plan_cost',
			label: 'Сумма',
			options: {
				customBodyRenderLite: dataIndex => {
					const { sum } = states.results[dataIndex];
					return <Amount value={sum} />;
				}
			}
		}
	];
	const tableOptions = {
		serverSide: true,
		rowsPerPage: limit,
		page,
		count: states?.count ?? 0,
		onChangePage: newPage => setPage(newPage),
		onChangeRowsPerPage: newLimit => setLimit(newLimit),
		customTableBodyFooterRender() {
			return (
				states.count > 0 && (
					<TableBody>
						<TableRow>
							<TableCell className="font-bold">Итого</TableCell>
							<TableCell />
							<TableCell />
							<TableCell className="font-bold">
								<Amount value={states.total.sum} />
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
	return <DataTable data={states.results} columns={columns} options={tableOptions} />;
}
TableStates.propTypes = {
	receptionUuid: PropTypes.string.isRequired
};
