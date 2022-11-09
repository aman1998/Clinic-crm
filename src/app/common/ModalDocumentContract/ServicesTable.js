import React, { useMemo } from 'react';
import { TableBody, TableCell, TableRow, Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import { Amount, DataTable } from '../../bizKITUi';
import { getFullName } from '../../utils';

export function ServicesTable({ services }) {
	const columns = useMemo(
		() => [
			{
				name: 'name',
				label: 'Наименование'
			},
			{
				name: 'doctor',
				label: 'Врач',
				options: {
					customBodyRender: value => {
						return value ? getFullName(value) : '';
					}
				}
			},
			{
				name: 'cost',
				label: 'Сумма',
				options: {
					customBodyRender: value => {
						return <Amount value={value} />;
					}
				}
			}
		],
		[]
	);
	return (
		<>
			<Typography color="secondary" className="text-lg font-bold mt-28 mb-8">
				Информация об услугах
			</Typography>
			<DataTable
				columns={columns}
				options={{
					elevation: 0,
					pagination: false,
					customTableBodyFooterRender() {
						const totalCost = services.reduce((prev, current) => prev + current.cost, 0);
						const totalCount = services.length;

						return (
							totalCount > 0 && (
								<TableBody>
									<TableRow>
										<TableCell className="font-bold">Итого</TableCell>
										<TableCell />
										<TableCell className="font-bold">
											<Amount value={totalCost} />
										</TableCell>
									</TableRow>
								</TableBody>
							)
						);
					}
				}}
				data={services}
			/>
		</>
	);
}

ServicesTable.propTypes = {
	services: PropTypes.arrayOf(
		PropTypes.shape({
			name: PropTypes.string.isRequired,
			doctor: PropTypes.shape({
				last_name: PropTypes.string,
				first_name: PropTypes.string,
				middle_name: PropTypes.string
			}).isRequired,
			cost: PropTypes.number.isRequired
		})
	).isRequired
};
