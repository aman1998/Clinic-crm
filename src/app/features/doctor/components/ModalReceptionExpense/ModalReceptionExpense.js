import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { Grid, TableBody, TableCell, TableRow, Typography, useTheme } from '@material-ui/core';
import { Amount, DataTable, DrawerTemplate, TextField } from '../../../../bizKITUi';
import { BlockInfo } from '../../../../common/BlockInfo';
import { clinicService, ENTITY, productsService } from '../../../../services';
import { getFullName } from '../../../../utils';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';

export function ModalReceptionExpense({ isOpen, onClose, uuid }) {
	const { palette } = useTheme();
	const { isLoading: isLoadingStatistics, isError: isErrorStatistics, data: statistics } = useQuery(
		[ENTITY.CLINIC_RECEPTION_MEDICATIONS_STATISTICS, uuid],
		() => clinicService.getClinicReceptionMedicationsStatistics(uuid)
	);
	const diff_expense = statistics ? statistics.data.plan_expense - statistics.data.fact_expense : 0;

	const [pageMedications, setPageMedications] = useState(0);
	const [limitMedications, setLimitMedications] = useState(10);
	const { isLoading: isLoadingMedications, isError: isErrorMedications, data: medications } = useQuery(
		[
			ENTITY.CLINIC_RECEPTION_MEDICATIONS,
			uuid,
			{ limit: limitMedications, offset: limitMedications * pageMedications }
		],
		({ queryKey }) => clinicService.getClinicReceptionMedications(uuid, queryKey[2])
	);

	const columns = [
		{
			name: 'product_name',
			label: 'Медикамент',
			options: {
				customBodyRenderLite: dataIndex => {
					const { product } = medications.results[dataIndex];
					return product.name;
				}
			}
		},
		{
			name: 'product_price',
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
				customBodyRender: value => {
					return value;
				}
			}
		},
		{
			name: 'plan_expense',
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
				customBodyRender: value => {
					return value;
				}
			}
		},
		{
			name: 'fact_expense',
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
		pagination: false,
		serverSide: true,
		rowsPerPage: limitMedications,
		page: pageMedications,
		count: medications?.count ?? 0,
		onChangePage: page => setPageMedications(page),
		onChangeRowsPerPage: limit => setLimitMedications(limit),
		customTableBodyFooterRender() {
			return (
				medications.total &&
				medications?.count >= 0 && (
					<TableBody>
						<TableRow className="bg-gray-100">
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

	return (
		<>
			<DrawerTemplate
				isOpen={isOpen}
				close={onClose}
				width="sm"
				header={
					<Typography color="secondary" className="text-xl font-bold text-center">
						Расходы услуги
					</Typography>
				}
				content={
					isLoadingStatistics ? (
						<FuseLoading />
					) : isErrorStatistics ? (
						<ErrorMessage />
					) : (
						<>
							<Typography color="secondary" className="text-xl font-bold mb-16">
								Информация об услуге
							</Typography>

							<Grid container spacing={2}>
								<Grid item xs={12}>
									<TextField
										label="Услуга"
										fullWidth
										variant="outlined"
										InputProps={{ readOnly: true }}
										value={statistics.service.name}
									/>
								</Grid>
								<Grid item xs={12} md={6}>
									<TextField
										label="Врач"
										fullWidth
										variant="outlined"
										InputProps={{ readOnly: true }}
										value={getFullName(statistics.doctor)}
									/>
								</Grid>
								<Grid item xs={12} md={6}>
									<TextField
										label="Пациент"
										fullWidth
										variant="outlined"
										InputProps={{ readOnly: true }}
										value={getFullName(statistics.patient)}
									/>
								</Grid>
							</Grid>

							<Grid container spacing={2}>
								<Grid item md={4} xs={6}>
									<BlockInfo title="План расходов" color={palette.primary.main}>
										<Amount value={statistics.data.plan_expense} />
									</BlockInfo>
								</Grid>
								<Grid item md={4} xs={6}>
									<BlockInfo title="Факт расходов" color={palette.error.main}>
										<Amount value={statistics.data.fact_expense} />
									</BlockInfo>
								</Grid>
								<Grid item md={4} xs={6}>
									<BlockInfo
										title="Отклонение"
										color={
											diff_expense > 0
												? palette.success.main
												: diff_expense < 0
												? palette.error.main
												: palette.text.primary
										}
									>
										<Amount value={diff_expense} />
									</BlockInfo>
								</Grid>
							</Grid>

							<Typography color="secondary" className="text-xl font-bold my-16">
								Автосписание расходных материалов
							</Typography>

							{isLoadingMedications ? (
								<FuseLoading />
							) : isErrorMedications ? (
								<ErrorMessage />
							) : (
								<DataTable columns={columns} options={tableOptions} data={medications.results} />
							)}
						</>
					)
				}
			/>
		</>
	);
}
ModalReceptionExpense.defaultProps = {};
ModalReceptionExpense.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	uuid: PropTypes.string.isRequired
};
