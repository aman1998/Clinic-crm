import React, { useMemo, useState } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Divider, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from 'react-query';
import clsx from 'clsx';
import { Amount, DataTable, Button } from '../../../../bizKITUi';
import { ENTITY, patientsService } from '../../../../services';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { modalPromise } from '../../../../common/ModalPromise';
import { ModalFinanceIncome } from '../../../../common/ModalFinanceIncome';

const useStyles = makeStyles(theme => ({
	writeOff: {
		color: theme.palette.error.main
	},
	accrual: {
		color: theme.palette.success.main
	}
}));

export function BonusHistoryTable({ patientUuid }) {
	const classes = useStyles();

	const [limit, setLimit] = useState(10);
	const [page, setPage] = useState(0);

	const { isLoading, isError, data } = useQuery({
		queryKey: [ENTITY.PATIENT_BONUS_BALANCE_HISTORY, { limit, offset: page * limit }],
		queryFn: ({ queryKey }) => patientsService.getPatientBonusHistory(patientUuid, queryKey[1])
	});

	const columns = useMemo(
		() => [
			{
				name: 'created_at',
				label: 'Дата',
				options: {
					customBodyRender: value => {
						return moment(value).format('DD.MM.YYYY');
					}
				}
			},
			{
				name: 'type',
				label: 'Тип',
				options: {
					customBodyRender: value => {
						const types = {
							WRITE_OFF: 'Списание',
							ACCRUAL: 'Начисление'
						};
						return types[value];
					}
				}
			},
			{
				name: 'cost',
				label: 'Сумма',
				options: {
					customBodyRenderLite: dataIndex => {
						const { new_balance, old_balance } = data.results[dataIndex];
						const cost = new_balance - old_balance;
						return (
							<Amount
								value={cost}
								className={clsx({
									[classes.accrual]: cost > 0,
									[classes.writeOff]: cost < 0
								})}
							/>
						);
					}
				}
			},
			{
				name: 'actions',
				label: '',
				options: {
					customBodyRenderLite: dataIndex => {
						const { finance_action } = data.results[dataIndex];
						return (
							<div className="flex justify-end">
								<Button
									onClick={() =>
										modalPromise.open(({ onClose }) => (
											<ModalFinanceIncome
												isOpen
												onClose={onClose}
												financeActionUuid={finance_action}
											/>
										))
									}
									textNormal
									variant="text"
								>
									Подробнее
								</Button>
							</div>
						);
					}
				}
			}
		],
		[data, classes.accrual, classes.writeOff]
	);

	const tableOptions = {
		elevation: 0,
		serverSide: true,
		rowsPerPage: limit,
		page,
		count: data?.count ?? 0,
		onChangePage: newPage => setPage(newPage),
		onChangeRowsPerPage: newLimit => setLimit(newLimit)
	};

	return (
		<Paper className="px-20">
			<Typography variant="subtitle1" className="py-20">
				История бонусов
			</Typography>
			<Divider />
			{isLoading ? (
				<div className="p-32">
					<FuseLoading />
				</div>
			) : isError ? (
				<ErrorMessage />
			) : (
				<DataTable columns={columns} options={tableOptions} data={data?.results ?? []} />
			)}
		</Paper>
	);
}

BonusHistoryTable.propTypes = {
	patientUuid: PropTypes.string.isRequired
};
