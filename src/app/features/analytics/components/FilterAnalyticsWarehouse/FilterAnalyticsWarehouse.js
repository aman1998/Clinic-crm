import React, { useEffect, useMemo, useState } from 'react';
import { useTheme, Paper, Typography, Grid, Divider, makeStyles } from '@material-ui/core';
import { usePromise } from '../../../../hooks';
import { ChartPie } from '../ChartPie';
import { AbcAnalysis } from '../AbcAnalysis';
import { productsService, waybillsService } from '../../../../services';
import { BlockAnalyticsInfo } from '../BlockAnalyticsInfo';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { ModalPopularByCount } from '../ModalPopularByCount';
import { WAYBILL_TYPE_ACCEPTANCE, WAYBILL_TYPE_EXPENSE } from '../../../../services/waybills/constants';
import { numberFormat } from '../../../../utils';

const MAX_ITEMS = 4;

const useStyles = makeStyles(theme => ({
	itemChart: {
		width: '100%'
	}
}));

export function FilterAnalyticsWarehouse() {
	const { palette } = useTheme();
	const classes = useStyles();

	const colors = useMemo(
		() => [palette.success.main, palette.warning.main, palette.primary.main, palette.error.main],
		[palette.error.main, palette.primary.main, palette.success.main, palette.warning.main]
	);

	const {
		isLoading: isLoadingWaybillsStatistics,
		error: errorWaybillsStatistics,
		results: resultsWaybillsStatistics,
		update: updateWaybillsStatistics
	} = usePromise();
	useEffect(() => {
		updateWaybillsStatistics(() => waybillsService.getWaybillsStatistics().then(({ data }) => data));
	}, [updateWaybillsStatistics]);

	const {
		isLoading: isLoadingProductsStatisticsWaybillsAcceptancePopular,
		error: errorProductsStatisticsWaybillsAcceptancePopular,
		results: resultsProductsStatisticsWaybillsAcceptancePopular,
		update: updateProductsStatisticsWaybillsAcceptancePopular
	} = usePromise();
	useEffect(() => {
		updateProductsStatisticsWaybillsAcceptancePopular(() =>
			productsService
				.getProductsStatisticsWaybillsPopular({ waybill_type: WAYBILL_TYPE_ACCEPTANCE })
				.then(({ data }) => ({
					list: data.results,
					totalCount: data.count
				}))
		);
	}, [updateProductsStatisticsWaybillsAcceptancePopular]);
	const normalizeDataProductsStatisticsWaybillsAcceptancePopular = useMemo(() => {
		if (!resultsProductsStatisticsWaybillsAcceptancePopular) {
			return [];
		}

		return resultsProductsStatisticsWaybillsAcceptancePopular.list.slice(0, MAX_ITEMS).map((item, index) => ({
			label: item.name,
			value: item.count ?? 0,
			color: colors[index]
		}));
	}, [colors, resultsProductsStatisticsWaybillsAcceptancePopular]);

	const {
		isLoading: isLoadingProductsStatisticsWaybillsExpensePopular,
		error: errorProductsStatisticsWaybillsExpensePopular,
		results: resultsProductsStatisticsWaybillsExpensePopular,
		update: updateProductsStatisticsWaybillsExpensePopular
	} = usePromise();
	useEffect(() => {
		updateProductsStatisticsWaybillsExpensePopular(() =>
			productsService
				.getProductsStatisticsWaybillsPopular({ waybill_type: WAYBILL_TYPE_EXPENSE })
				.then(({ data }) => ({
					list: data.results,
					totalCount: data.count
				}))
		);
	}, [updateProductsStatisticsWaybillsExpensePopular]);
	const normalizeDataProductsStatisticsWaybillsExpensePopular = useMemo(() => {
		if (!resultsProductsStatisticsWaybillsExpensePopular) {
			return [];
		}

		return resultsProductsStatisticsWaybillsExpensePopular.list.slice(0, MAX_ITEMS).map((item, index) => ({
			label: item.name,
			value: item.count ?? 0,
			color: colors[index]
		}));
	}, [colors, resultsProductsStatisticsWaybillsExpensePopular]);

	const {
		isLoading: isLoadingProductsStatisticsWaybillsAcceptanceAbcAnalysis,
		error: errorProductsStatisticsWaybillsAcceptanceAbcAnalysis,
		results: resultsProductsStatisticsWaybillsAcceptanceAbcAnalysis,
		update: updateProductsStatisticsWaybillsAcceptanceAbcAnalysis
	} = usePromise();
	useEffect(() => {
		updateProductsStatisticsWaybillsAcceptanceAbcAnalysis(() =>
			productsService
				.getProductsStatisticsWaybillsAbcAnalysis({ waybill_type: WAYBILL_TYPE_ACCEPTANCE })
				.then(({ data }) => data)
		);
	}, [updateProductsStatisticsWaybillsAcceptanceAbcAnalysis]);
	const normalizeProductsStatisticsWaybillsAcceptanceAbcAnalysis = useMemo(() => {
		if (!resultsProductsStatisticsWaybillsAcceptanceAbcAnalysis) {
			return null;
		}

		return {
			segments: resultsProductsStatisticsWaybillsAcceptanceAbcAnalysis.segments,
			columns: [
				{ label: '????????????????????????' },
				{ label: '??????????????', template: 'currency' },
				{ label: '??????-????' },
				{ label: '????????', template: 'percent' },
				{ label: '??????????????', template: 'segment' }
			],
			list: resultsProductsStatisticsWaybillsAcceptanceAbcAnalysis.states.map(item => [
				item.name,
				item.sum,
				item.count ?? 0,
				item.contribution,
				item.segment
			])
		};
	}, [resultsProductsStatisticsWaybillsAcceptanceAbcAnalysis]);

	const {
		isLoading: isLoadingProductsStatisticsWaybillsExpenseAbcAnalysis,
		error: errorProductsStatisticsWaybillsExpenseAbcAnalysis,
		results: resultsProductsStatisticsWaybillsExpenseAbcAnalysis,
		update: updateProductsStatisticsWaybillsExpenseAbcAnalysis
	} = usePromise();
	useEffect(() => {
		updateProductsStatisticsWaybillsExpenseAbcAnalysis(() =>
			productsService
				.getProductsStatisticsWaybillsAbcAnalysis({ waybill_type: WAYBILL_TYPE_EXPENSE })
				.then(({ data }) => data)
		);
	}, [updateProductsStatisticsWaybillsExpenseAbcAnalysis]);
	const normalizeProductsStatisticsWaybillsExpenseAbcAnalysis = useMemo(() => {
		if (!resultsProductsStatisticsWaybillsExpenseAbcAnalysis) {
			return null;
		}

		return {
			segments: resultsProductsStatisticsWaybillsExpenseAbcAnalysis.segments,
			columns: [
				{ label: '????????????????????????' },
				{ label: '??????????????', template: 'currency' },
				{ label: '??????-????' },
				{ label: '????????', template: 'percent' },
				{ label: '??????????????', template: 'segment' }
			],
			list: resultsProductsStatisticsWaybillsExpenseAbcAnalysis.states.map(item => [
				item.name,
				item.sum,
				item.count ?? 0,
				item.contribution,
				item.segment
			])
		};
	}, [resultsProductsStatisticsWaybillsExpenseAbcAnalysis]);

	const [isShowModalDetailsServices, setIsShowModalDetailsServices] = useState(false);
	const [isShowModalDetailsProducts, setIsShowModalDetailsProducts] = useState(false);

	const isLoading =
		isLoadingWaybillsStatistics ||
		isLoadingProductsStatisticsWaybillsAcceptancePopular ||
		isLoadingProductsStatisticsWaybillsExpensePopular ||
		isLoadingProductsStatisticsWaybillsAcceptanceAbcAnalysis ||
		isLoadingProductsStatisticsWaybillsExpenseAbcAnalysis ||
		!resultsWaybillsStatistics ||
		!resultsProductsStatisticsWaybillsAcceptancePopular ||
		!resultsProductsStatisticsWaybillsExpensePopular ||
		!resultsProductsStatisticsWaybillsAcceptanceAbcAnalysis ||
		!resultsProductsStatisticsWaybillsExpenseAbcAnalysis;
	const isError =
		errorWaybillsStatistics ||
		errorProductsStatisticsWaybillsAcceptancePopular ||
		errorProductsStatisticsWaybillsExpensePopular ||
		errorProductsStatisticsWaybillsAcceptanceAbcAnalysis ||
		errorProductsStatisticsWaybillsExpenseAbcAnalysis;

	return (
		<>
			{isError ? (
				<ErrorMessage />
			) : isLoading ? (
				<FuseLoading />
			) : (
				<>
					{resultsWaybillsStatistics.count <= 0 ? (
						<Typography color="secondary" className="mt-32 font-bold">
							???? ?????????????????? ???????????? ???? ?????????????????? ???????????? ?????????????? ???? ??????????????
						</Typography>
					) : (
						<>
							<Typography color="secondary" className="mt-32 text-lg font-bold">
								???????????????????? ?????????????? ???? ???????????????????? ?? ????????????????
							</Typography>
							<Grid container spacing={2} className="mt-20">
								<Grid item lg={4}>
									<BlockAnalyticsInfo
										row={false}
										title="?????????? ?????????????????? ??????????????????"
										value={
											<span className="text-primary">
												{numberFormat.currency(resultsWaybillsStatistics.acceptance_sum)} ???
											</span>
										}
									/>
								</Grid>
								<Grid item lg={4}>
									<BlockAnalyticsInfo
										row={false}
										title="?????????? ?????????????????? ??????????????????"
										value={
											<span className="text-success">
												{numberFormat.currency(resultsWaybillsStatistics.expense_sum)} ???
											</span>
										}
									/>
								</Grid>
								<Grid item lg={4}>
									<BlockAnalyticsInfo
										row={false}
										title="????????????????????????????"
										value={
											<span>
												{resultsWaybillsStatistics.acceptance_sum -
													resultsWaybillsStatistics.expense_sum}
											</span>
										}
									/>
								</Grid>
								<Grid item lg={3}>
									<BlockAnalyticsInfo
										title="?????????????????? ??????????????????"
										value={
											<span className="text-primary">
												{resultsWaybillsStatistics.acceptance_count}
											</span>
										}
									/>
								</Grid>
								<Grid item lg={3}>
									<BlockAnalyticsInfo
										title="?????????????????? ??????????????????"
										value={
											<span className="text-success">
												{resultsWaybillsStatistics.expense_count}
											</span>
										}
									/>
								</Grid>
								<Grid item lg={3}>
									<BlockAnalyticsInfo
										title="?????????????????? ???? ????????????????"
										value={
											<span className="text-error">
												{resultsWaybillsStatistics.write_off_count}
											</span>
										}
									/>
								</Grid>
								<Grid item lg={3}>
									<BlockAnalyticsInfo
										title="?????????????????? ???? ??????????????????????"
										value={
											<span className="text-success">
												{resultsWaybillsStatistics.moving_count}
											</span>
										}
									/>
								</Grid>
							</Grid>

							<Grid className="mt-20" container spacing={2}>
								<Grid item lg={6} xs={12}>
									<Paper>
										<Typography color="secondary" className="text-16 font-bold p-20">
											?????????? ???????????????????? ????????????
										</Typography>

										<Divider />

										<div className={`inline-block p-20 ${classes.itemChart}`}>
											<ChartPie
												data={normalizeDataProductsStatisticsWaybillsAcceptancePopular}
												legend={{
													label: '??????????',
													value: '??????-????'
												}}
												onClickDetail={() => setIsShowModalDetailsServices(true)}
											/>
										</div>
									</Paper>
								</Grid>

								<Grid item lg={6} xs={12}>
									<Paper>
										<Typography color="secondary" className="text-16 font-bold p-20">
											?????????? ?????????????????????? ????????????
										</Typography>

										<Divider />

										<div className={`inline-block p-20 ${classes.itemChart}`}>
											<ChartPie
												data={normalizeDataProductsStatisticsWaybillsExpensePopular}
												legend={{
													label: '??????????',
													value: '??????-????'
												}}
												onClickDetail={() => setIsShowModalDetailsProducts(true)}
											/>
										</div>
									</Paper>
								</Grid>
							</Grid>

							<Grid className="mt-20" container spacing={2}>
								<Grid item lg={6} xs={12}>
									<AbcAnalysis
										title="ABC-???????????? ?????????????? ??????????????"
										legendTitle="?????? ????????????"
										segments={normalizeProductsStatisticsWaybillsAcceptanceAbcAnalysis.segments}
										columns={normalizeProductsStatisticsWaybillsAcceptanceAbcAnalysis.columns}
										list={normalizeProductsStatisticsWaybillsAcceptanceAbcAnalysis.list}
									/>
								</Grid>

								<Grid item lg={6} xs={12}>
									<AbcAnalysis
										title="ABC-???????????? ?????????????? ??????????????"
										legendTitle="?????? ????????????"
										segments={normalizeProductsStatisticsWaybillsExpenseAbcAnalysis.segments}
										columns={normalizeProductsStatisticsWaybillsExpenseAbcAnalysis.columns}
										list={normalizeProductsStatisticsWaybillsExpenseAbcAnalysis.list}
									/>
								</Grid>
							</Grid>
						</>
					)}

					<ModalPopularByCount
						title="?????????? ???????????????????? ????????????"
						list={resultsProductsStatisticsWaybillsAcceptancePopular.list}
						isOpen={isShowModalDetailsServices}
						onClose={() => setIsShowModalDetailsServices(false)}
					/>

					<ModalPopularByCount
						title="?????????? ?????????????????????? ????????????"
						list={resultsProductsStatisticsWaybillsExpensePopular.list}
						isOpen={isShowModalDetailsProducts}
						onClose={() => setIsShowModalDetailsProducts(false)}
					/>
				</>
			)}
		</>
	);
}
