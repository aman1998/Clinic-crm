import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { TableBody, TableCell, TableRow } from '@material-ui/core';
import { Amount, DataTable } from '../../../../bizKITUi';
import { clinicService, ENTITY, productsService } from '../../../../services';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';

export function TableMedications({ receptionUuid }) {
	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);

	const { isLoading, isError, data: medications } = useQuery(
		[ENTITY.CLINIC_RECEPTION_MEDICATIONS, receptionUuid, { limit, offset: page * limit }],
		() => clinicService.getClinicReceptionMedications(receptionUuid)
	);

	const columns = [
		{
			name: 'name',
			label: 'Медикамент',
			options: {
				customBodyRenderLite: dataIndex => {
					const { product } = medications.results[dataIndex];
					return product.name;
				}
			}
		},
		{
			name: 'cost',
			label: 'Цена',
			options: {
				customBodyRenderLite: dataIndex => {
					const { cost } = medications.results[dataIndex];
					return <Amount value={cost} />;
				}
			}
		},
		{
			name: 'packing',
			label: 'Ед.изм.',
			options: {
				customBodyRenderLite: dataIndex => {
					const { packing } = medications.results[dataIndex];
					return packing.name;
				}
			}
		},
		{
			name: 'plan_count',
			label: 'Кол-во план',
			options: {
				customBodyRenderLite: dataIndex => {
					const { plan_count } = medications.results[dataIndex];
					return plan_count;
				}
			}
		},
		{
			name: 'plan_cost',
			label: 'Сумма план',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = medications.results[dataIndex];
					return (
						<Amount
							value={productsService.getProductCost(
								currentItem,
								currentItem.packing,
								currentItem.plan_count,
								currentItem.cost
							)}
						/>
					);
				}
			}
		},
		{
			name: 'fact_count',
			label: 'Кол-во факт',
			options: {
				customBodyRenderLite: dataIndex => {
					const { fact_count } = medications.results[dataIndex];
					return fact_count;
				}
			}
		},
		{
			name: 'fact_cost',
			label: 'Сумма факт',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = medications.results[dataIndex];
					return (
						<Amount
							value={productsService.getProductCost(
								currentItem,
								currentItem.packing,
								currentItem.fact_count,
								currentItem.cost
							)}
						/>
					);
				}
			}
		}
	];
	const tableOptions = {
		serverSide: true,
		rowsPerPage: limit,
		page,
		count: medications?.count ?? 0,
		onChangePage: newPage => setPage(newPage),
		onChangeRowsPerPage: newLimit => setLimit(newLimit),
		customTableBodyFooterRender() {
			return (
				medications.count > 0 && (
					<TableBody>
						<TableRow>
							<TableCell className="font-bold">Итого</TableCell>
							<TableCell />
							<TableCell />
							<TableCell className="font-bold">{medications.total.count_plan}</TableCell>
							<TableCell className="font-bold">
								<Amount value={medications.total.sum_plan} />
							</TableCell>
							<TableCell className="font-bold">{medications.total.count_fact}</TableCell>
							<TableCell className="font-bold">
								<Amount value={medications.total.sum_fact} />
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
	return <DataTable data={medications.results} columns={columns} options={tableOptions} />;
}
TableMedications.propTypes = {
	receptionUuid: PropTypes.string.isRequired
};
