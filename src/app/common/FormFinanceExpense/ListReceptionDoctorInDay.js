import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { TableBody, TableRow, TableCell, Typography } from '@material-ui/core';
import moment from 'moment';
import { ErrorMessage } from '../ErrorMessage';
import FuseLoading from '../../../@fuse/core/FuseLoading';
import { DataTable } from '../../bizKITUi';
import { getFullName, numberFormat } from '../../utils';
import { STATUS_RECEPTION_PAID } from '../../services/clinic/constants';
import { clinicService, ENTITY } from '../../services';

export function ListReceptionDoctorInDay({ filter }) {
	const { data, isError, isLoading } = useQuery(
		[
			ENTITY.CLINIC_RECEPTION,
			{
				...filter,
				limit: Number.MAX_SAFE_INTEGER,
				status: STATUS_RECEPTION_PAID
			}
		],
		({ queryKey }) => {
			return clinicService.getReceptions(queryKey[1]);
		}
	);

	const columns = [
		{
			name: 'time',
			label: 'Время',
			options: {
				customBodyRenderLite: dataIndex => {
					return moment(data.results[dataIndex].paid_date_time).format('HH:mm');
				}
			}
		},
		{
			name: 'patient',
			label: 'Пациент',
			options: {
				customBodyRenderLite: dataIndex => {
					const { patient } = data.results[dataIndex];

					return `${getFullName({ lastName: patient.last_name, firstName: patient.first_name })}`;
				}
			}
		},
		{
			name: 'amountReception',
			label: 'Сумма приема',
			options: {
				customBodyRenderLite: dataIndex => {
					return `${numberFormat.currency(data.results[dataIndex].service.cost)} ₸`;
				}
			}
		},
		{
			name: 'payDoctor',
			label: 'К оплате врачу',
			options: {
				customBodyRenderLite: dataIndex => {
					return `${numberFormat.currency(data.results[dataIndex].service.doctor_cost)} ₸`;
				}
			}
		}
	];
	const tableOptions = {
		elevation: 0,
		pagination: false,
		responsive: 'standard',
		customTableBodyFooterRender() {
			const totalCost = data.results.reduce((prev, current) => prev + current.service.cost, 0);
			const totalDoctorCost = data.results.reduce((prev, current) => prev + current.service.doctor_cost, 0);

			return (
				data.totalCount > 0 && (
					<TableBody>
						<TableRow>
							<TableCell className="font-bold">Итого</TableCell>
							<TableCell />
							<TableCell className="font-bold">{`${numberFormat.currency(totalCost)} ₸`}</TableCell>
							<TableCell className="font-bold">{`${numberFormat.currency(totalDoctorCost)} ₸`}</TableCell>
						</TableRow>
					</TableBody>
				)
			);
		}
	};

	return isError ? (
		<ErrorMessage />
	) : isLoading ? (
		<FuseLoading />
	) : (
		<div>
			<Typography className="mb-6 text-xl">Приемы врача за день</Typography>
			<DataTable columns={columns} options={tableOptions} data={data.results} />
		</div>
	);
}
ListReceptionDoctorInDay.propTypes = {
	filter: PropTypes.shape({
		date: PropTypes.instanceOf(Date).isRequired,
		doctor: PropTypes.string.isRequired
	}).isRequired
};
