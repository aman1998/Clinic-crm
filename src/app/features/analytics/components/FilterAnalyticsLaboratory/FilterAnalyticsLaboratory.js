import React, { useEffect, useMemo, useState } from 'react';
import { useTheme, Paper, Typography, Grid, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Autocomplete, Button, DatePickerField, TextField } from '../../../../bizKITUi';
import { useStateForm, usePromise } from '../../../../hooks';
import { useSearchClinicService } from '../../../../common/hooks/useSearchClinicService';
import { ChartPie } from '../ChartPie';
import { AbcAnalysis } from '../AbcAnalysis';
import { laboratoryService, clinicService, productsService, companiesService } from '../../../../services';
import { BlockAnalyticsInfo } from '../BlockAnalyticsInfo';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { ModalPopularByCount } from '../ModalPopularByCount';
import { numberFormat } from '../../../../utils';
import { TYPE_SERVICE_LABORATORY } from '../../../../services/clinic/constants';

const MAX_ITEMS = 4;

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
	},
	button: {
		display: 'flex',
		marginLeft: 'auto',
		[theme.breakpoints.down(1379)]: {
			margin: '0'
		}
	}
}));

const now = new Date();
const initialValues = {
	service: null,
	date_from: new Date(now.setMonth(now.getMonth() - 1)),
	date_to: new Date()
};

export function FilterAnalyticsLaboratory() {
	const { palette } = useTheme();
	const classes = useStyles();

	const { form, setInForm, setForm } = useStateForm(initialValues);
	const [filter, setFilter] = useState({});

	const colors = useMemo(
		() => [palette.success.main, palette.warning.main, palette.primary.main, palette.error.main],
		[palette.error.main, palette.primary.main, palette.success.main, palette.warning.main]
	);

	const {
		status: statusSearchClinicService,
		actions: actionsSearchClinicService,
		data: dataSearchClinicService
	} = useSearchClinicService();

	const {
		isLoading: isLoadingLaboratoryStatisticsReceptions,
		error: errorLaboratoryStatisticsReceptions,
		results: resultsLaboratoryStatisticsReceptions,
		update: updateLaboratoryStatisticsReceptions
	} = usePromise();
	useEffect(() => {
		updateLaboratoryStatisticsReceptions(() =>
			laboratoryService.getLaboratoryStatisticsReceptions(filter).then(({ data }) => data)
		);
	}, [filter, updateLaboratoryStatisticsReceptions]);

	const {
		isLoading: isLoadingClinicServicesStatisticsLaboratoryReceptionsPopular,
		error: errorClinicServicesStatisticsLaboratoryReceptionsPopular,
		results: resultsClinicServicesStatisticsLaboratoryReceptionsPopular,
		update: updateClinicServicesStatisticsLaboratoryReceptionsPopular
	} = usePromise();
	useEffect(() => {
		updateClinicServicesStatisticsLaboratoryReceptionsPopular(() =>
			clinicService.getClinicServicesStatisticsLaboratoryReceptionsPopular(filter).then(({ data }) => ({
				list: data.results,
				totalCount: data.count
			}))
		);
	}, [filter, updateClinicServicesStatisticsLaboratoryReceptionsPopular]);
	const normalizeDataClinicServicesStatisticsLaboratoryReceptionsPopular = useMemo(() => {
		if (!resultsClinicServicesStatisticsLaboratoryReceptionsPopular) {
			return [];
		}

		return resultsClinicServicesStatisticsLaboratoryReceptionsPopular.list
			.slice(0, MAX_ITEMS)
			.map((item, index) => ({
				label: item.name,
				value: item.count ?? 0,
				color: colors[index]
			}));
	}, [colors, resultsClinicServicesStatisticsLaboratoryReceptionsPopular]);

	const {
		isLoading: isLoadingClinicServicesStatisticsLaboratoryReceptionsAbcAnalysis,
		error: errorClinicServicesStatisticsLaboratoryReceptionsAbcAnalysis,
		results: resultsClinicServicesStatisticsLaboratoryReceptionsAbcAnalysis,
		update: updateClinicServicesStatisticsLaboratoryReceptionsAbcAnalysis
	} = usePromise();
	useEffect(() => {
		updateClinicServicesStatisticsLaboratoryReceptionsAbcAnalysis(() =>
			clinicService.getClinicServicesStatisticsLaboratoryReceptionsAbcAnalysis(filter).then(({ data }) => data)
		);
	}, [filter, updateClinicServicesStatisticsLaboratoryReceptionsAbcAnalysis]);
	const normalizeClinicServicesStatisticsLaboratoryReceptionsAbcAnalysis = useMemo(() => {
		if (!resultsClinicServicesStatisticsLaboratoryReceptionsAbcAnalysis) {
			return null;
		}

		return {
			segments: resultsClinicServicesStatisticsLaboratoryReceptionsAbcAnalysis.segments,
			columns: [
				{ label: 'Наименование' },
				{ label: 'Выручка', template: 'currency' },
				{ label: 'Кол-во' },
				{ label: 'Доля', template: 'percent' },
				{ label: 'Сегмент', template: 'segment' }
			],
			list: resultsClinicServicesStatisticsLaboratoryReceptionsAbcAnalysis.states.map(item => [
				item.name,
				item.sum,
				item.count ?? 0,
				item.contribution,
				item.segment
			])
		};
	}, [resultsClinicServicesStatisticsLaboratoryReceptionsAbcAnalysis]);

	const {
		isLoading: isLoadingProductsStatisticsLaboratoryReceptionsPopular,
		error: errorProductsStatisticsLaboratoryReceptionsPopular,
		results: resultsProductsStatisticsLaboratoryReceptionsPopular,
		update: updateProductsStatisticsLaboratoryReceptionsPopular
	} = usePromise();
	useEffect(() => {
		updateProductsStatisticsLaboratoryReceptionsPopular(() =>
			productsService.getProductsStatisticsLaboratoryReceptionsPopular(filter).then(({ data }) => ({
				list: data.results,
				totalCount: data.count
			}))
		);
	}, [filter, updateProductsStatisticsLaboratoryReceptionsPopular]);
	const normalizeDataProductsStatisticsLaboratoryReceptionsPopular = useMemo(() => {
		if (!resultsProductsStatisticsLaboratoryReceptionsPopular) {
			return [];
		}

		return resultsProductsStatisticsLaboratoryReceptionsPopular.list.slice(0, MAX_ITEMS).map((item, index) => ({
			label: item.name,
			value: item.count ?? 0,
			color: colors[index]
		}));
	}, [colors, resultsProductsStatisticsLaboratoryReceptionsPopular]);

	const {
		isLoading: isLoadingProductsStatisticsLaboratoryReceptionsAbcAnalysis,
		error: errorProductsStatisticsLaboratoryReceptionsAbcAnalysis,
		results: resultsProductsStatisticsLaboratoryReceptionsAbcAnalysis,
		update: updateProductsStatisticsLaboratoryReceptionsAbcAnalysis
	} = usePromise();
	useEffect(() => {
		updateProductsStatisticsLaboratoryReceptionsAbcAnalysis(() =>
			productsService.getProductsStatisticsLaboratoryReceptionsAbcAnalysis(filter).then(({ data }) => data)
		);
	}, [filter, updateProductsStatisticsLaboratoryReceptionsAbcAnalysis]);
	const normalizeProductsStatisticsLaboratoryReceptionsAbcAnalysis = useMemo(() => {
		if (!resultsProductsStatisticsLaboratoryReceptionsAbcAnalysis) {
			return null;
		}

		return {
			segments: resultsProductsStatisticsLaboratoryReceptionsAbcAnalysis.segments,
			columns: [
				{ label: 'Наименование' },
				{ label: 'Выручка', template: 'currency' },
				{ label: 'Кол-во' },
				{ label: 'Доля', template: 'percent' },
				{ label: 'Сегмент', template: 'segment' }
			],
			list: resultsProductsStatisticsLaboratoryReceptionsAbcAnalysis.states.map(item => [
				item.name,
				item.sum,
				item.count ?? 0,
				item.contribution,
				item.segment
			])
		};
	}, [resultsProductsStatisticsLaboratoryReceptionsAbcAnalysis]);

	const {
		isLoading: isLoadingCompaniesPartnersStatisticsLaboratoryReceptionsPopular,
		error: errorCompaniesPartnersStatisticsLaboratoryReceptionsPopular,
		results: resultsCompaniesPartnersStatisticsLaboratoryReceptionsPopular,
		update: updateCompaniesPartnersStatisticsLaboratoryReceptionsPopular
	} = usePromise();
	useEffect(() => {
		updateCompaniesPartnersStatisticsLaboratoryReceptionsPopular(() =>
			companiesService.getCompaniesPartnersStatisticsLaboratoryReceptionsPopular(filter).then(({ data }) => ({
				list: data.results,
				totalCount: data.count
			}))
		);
	}, [filter, updateCompaniesPartnersStatisticsLaboratoryReceptionsPopular]);
	const normalizeDataCompaniesPartnersStatisticsLaboratoryReceptionsPopular = useMemo(() => {
		if (!resultsCompaniesPartnersStatisticsLaboratoryReceptionsPopular) {
			return [];
		}

		return resultsCompaniesPartnersStatisticsLaboratoryReceptionsPopular.list
			.slice(0, MAX_ITEMS)
			.map((item, index) => ({
				label: item.name,
				value: item.count ?? 0,
				color: colors[index]
			}));
	}, [colors, resultsCompaniesPartnersStatisticsLaboratoryReceptionsPopular]);

	const {
		isLoading: isLoadingCompaniesPartnersStatisticsLaboratoryReceptionsAbcAnalysis,
		error: errorCompaniesPartnersStatisticsLaboratoryReceptionsAbcAnalysis,
		results: resultsCompaniesPartnersStatisticsLaboratoryReceptionsAbcAnalysis,
		update: updateCompaniesPartnersStatisticsLaboratoryReceptionsAbcAnalysis
	} = usePromise();
	useEffect(() => {
		updateCompaniesPartnersStatisticsLaboratoryReceptionsAbcAnalysis(() =>
			companiesService
				.getCompaniesPartnersStatisticsLaboratoryReceptionsAbcAnalysis(filter)
				.then(({ data }) => data)
		);
	}, [filter, updateCompaniesPartnersStatisticsLaboratoryReceptionsAbcAnalysis]);
	const normalizeCompaniesPartnersStatisticsLaboratoryReceptionsAbcAnalysis = useMemo(() => {
		if (!resultsCompaniesPartnersStatisticsLaboratoryReceptionsAbcAnalysis) {
			return null;
		}

		return {
			segments: resultsCompaniesPartnersStatisticsLaboratoryReceptionsAbcAnalysis.segments,
			columns: [
				{ label: 'Наименование' },
				{ label: 'Выплаты', template: 'currency' },
				{ label: 'Кол-во' },
				{ label: 'Доля', template: 'percent' },
				{ label: 'Сегмент', template: 'segment' }
			],
			list: resultsCompaniesPartnersStatisticsLaboratoryReceptionsAbcAnalysis.states.map(item => [
				item.name,
				item.sum,
				item.count ?? 0,
				item.contribution,
				item.segment
			])
		};
	}, [resultsCompaniesPartnersStatisticsLaboratoryReceptionsAbcAnalysis]);

	const [isShowModalDetailsServices, setIsShowModalDetailsServices] = useState(false);
	const [isShowModalDetailsProducts, setIsShowModalDetailsProducts] = useState(false);

	const handleOnApplyFilter = event => {
		event.preventDefault();

		setFilter({
			...form,
			service: form.service?.uuid ?? null
		});
	};

	const handleOnResetFilter = () => {
		setFilter({});
		setForm(initialValues);
	};

	const isLoading =
		isLoadingLaboratoryStatisticsReceptions ||
		isLoadingClinicServicesStatisticsLaboratoryReceptionsPopular ||
		isLoadingClinicServicesStatisticsLaboratoryReceptionsAbcAnalysis ||
		isLoadingProductsStatisticsLaboratoryReceptionsPopular ||
		isLoadingProductsStatisticsLaboratoryReceptionsAbcAnalysis ||
		isLoadingCompaniesPartnersStatisticsLaboratoryReceptionsPopular ||
		isLoadingCompaniesPartnersStatisticsLaboratoryReceptionsAbcAnalysis ||
		!resultsLaboratoryStatisticsReceptions ||
		!resultsClinicServicesStatisticsLaboratoryReceptionsPopular ||
		!resultsClinicServicesStatisticsLaboratoryReceptionsAbcAnalysis ||
		!resultsProductsStatisticsLaboratoryReceptionsPopular ||
		!resultsProductsStatisticsLaboratoryReceptionsAbcAnalysis ||
		!resultsCompaniesPartnersStatisticsLaboratoryReceptionsPopular ||
		!resultsCompaniesPartnersStatisticsLaboratoryReceptionsAbcAnalysis;
	const isError =
		errorLaboratoryStatisticsReceptions ||
		errorClinicServicesStatisticsLaboratoryReceptionsPopular ||
		errorClinicServicesStatisticsLaboratoryReceptionsAbcAnalysis ||
		errorProductsStatisticsLaboratoryReceptionsPopular ||
		errorProductsStatisticsLaboratoryReceptionsAbcAnalysis ||
		errorCompaniesPartnersStatisticsLaboratoryReceptionsPopular ||
		errorCompaniesPartnersStatisticsLaboratoryReceptionsAbcAnalysis;

	return (
		<>
			<Paper className="p-12 mb-32">
				<form className={`gap-10 ${classes.form}`} onSubmit={handleOnApplyFilter}>
					<Autocomplete
						isLoading={statusSearchClinicService.isLoading}
						options={dataSearchClinicService.listServices}
						getOptionLabel={option => option?.name}
						filterOptions={options => options}
						getOptionSelected={(option, value) => option.uuid === value?.uuid}
						onChange={(_, value) => setInForm('service', value)}
						onOpen={() =>
							actionsSearchClinicService.update(dataSearchClinicService.keyword, {
								doctor: form.doctor,
								type: TYPE_SERVICE_LABORATORY
							})
						}
						onInputChange={(_, newValue) =>
							actionsSearchClinicService.update(newValue, {
								doctor: form.doctor,
								type: TYPE_SERVICE_LABORATORY
							})
						}
						value={form.service}
						renderInput={params => <TextField {...params} label="Услуга" size="small" variant="outlined" />}
					/>

					<DatePickerField
						label="Дата начала"
						inputVariant="outlined"
						size="small"
						onlyValid
						value={form.date_from}
						onChange={date => setInForm('date_from', date)}
					/>

					<DatePickerField
						label="Дата окончания"
						inputVariant="outlined"
						size="small"
						onlyValid
						value={form.date_to}
						onChange={date => setInForm('date_to', date)}
					/>

					<div className={classes.button}>
						<Button textNormal type="submit" disabled={isLoading}>
							Применить
						</Button>

						<Button textNormal className="ml-16" disabled={isLoading} onClick={handleOnResetFilter}>
							Сбросить
						</Button>
					</div>
				</form>
			</Paper>

			{isError ? (
				<ErrorMessage />
			) : isLoading ? (
				<FuseLoading />
			) : (
				<>
					{resultsLaboratoryStatisticsReceptions.count <= 0 ? (
						<Typography color="secondary" className="mt-32 font-bold">
							По выбранной услуге за указанный период приемов не найдено
						</Typography>
					) : (
						<>
							<Typography color="secondary" className="mt-32 text-lg font-bold">
								Статистика приемов по количеству и статусам
							</Typography>
							<Grid container spacing={2} className="mt-20">
								<Grid item lg={2}>
									<BlockAnalyticsInfo
										row={false}
										title="Всего приемов"
										value={
											<span className="text-success">
												{resultsLaboratoryStatisticsReceptions.count}
											</span>
										}
									/>
								</Grid>
								<Grid item lg={2}>
									<BlockAnalyticsInfo
										row={false}
										title="Прием подтвержден"
										value={
											<span className="text-warning">
												{resultsLaboratoryStatisticsReceptions.confirmed}
											</span>
										}
									/>
								</Grid>
								<Grid item lg={2}>
									<BlockAnalyticsInfo
										row={false}
										title="Отправлено на кассу"
										value={
											<span className="text-success">
												{resultsLaboratoryStatisticsReceptions.cash}
											</span>
										}
									/>
								</Grid>
								<Grid item lg={2}>
									<BlockAnalyticsInfo
										row={false}
										title="Оплачено пациентом"
										value={
											<span className="text-success">
												{resultsLaboratoryStatisticsReceptions.paid}
											</span>
										}
									/>
								</Grid>
								<Grid item lg={4}>
									<BlockAnalyticsInfo
										row={false}
										title="Факт приемов"
										value={
											<span className="text-success">
												{numberFormat.currency(resultsLaboratoryStatisticsReceptions.fact)} ₸
											</span>
										}
									/>
								</Grid>
							</Grid>
							<Grid container spacing={2} className="mt-20">
								<Grid item lg={2}>
									<BlockAnalyticsInfo
										row={false}
										title="Приемы партнеров"
										value={
											<span className="text-success">
												{resultsLaboratoryStatisticsReceptions.partner_count}
											</span>
										}
									/>
								</Grid>
								<Grid item lg={4}>
									<BlockAnalyticsInfo
										row={false}
										title="Выплаты партнерам"
										value={
											<span className="text-success">
												{`${numberFormat.currency(
													resultsLaboratoryStatisticsReceptions.partner_sum
												)} ₸`}
											</span>
										}
									/>
								</Grid>
							</Grid>

							<Grid className="mt-20" container spacing={2}>
								<Grid item lg={6} xs={12}>
									<Paper>
										<Typography color="secondary" className="text-16 font-bold p-20">
											Популярные услуги
										</Typography>

										<Divider />

										<div className="inline-block p-20">
											<ChartPie
												data={normalizeDataClinicServicesStatisticsLaboratoryReceptionsPopular}
												legend={{
													label: 'Услуга',
													value: 'Кол-во приемов'
												}}
												onClickDetail={() => setIsShowModalDetailsServices(true)}
											/>
										</div>
									</Paper>
								</Grid>

								<Grid item lg={6} xs={12}>
									<Paper>
										<Typography color="secondary" className="text-16 font-bold p-20">
											Популярные медикаменты
										</Typography>

										<Divider />

										<div className="inline-block p-20">
											<ChartPie
												data={normalizeDataProductsStatisticsLaboratoryReceptionsPopular}
												legend={{
													label: 'Направление',
													value: 'Кол-во применений'
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
										title="ABC-анализ услуг"
										legendTitle="Все услуги"
										segments={
											normalizeClinicServicesStatisticsLaboratoryReceptionsAbcAnalysis.segments
										}
										columns={
											normalizeClinicServicesStatisticsLaboratoryReceptionsAbcAnalysis.columns
										}
										list={normalizeClinicServicesStatisticsLaboratoryReceptionsAbcAnalysis.list}
									/>
								</Grid>

								<Grid item lg={6} xs={12}>
									<AbcAnalysis
										title="ABC-анализ медикаментов"
										legendTitle="Все направления"
										segments={normalizeProductsStatisticsLaboratoryReceptionsAbcAnalysis.segments}
										columns={normalizeProductsStatisticsLaboratoryReceptionsAbcAnalysis.columns}
										list={normalizeProductsStatisticsLaboratoryReceptionsAbcAnalysis.list}
									/>
								</Grid>
							</Grid>

							<Grid className="mt-20" container spacing={2}>
								<Grid item lg={6} xs={12}>
									<Paper>
										<Typography color="secondary" className="text-16 font-bold p-20">
											Популярные партнеры
										</Typography>

										<Divider />

										<div className="inline-block p-20">
											<ChartPie
												data={
													normalizeDataCompaniesPartnersStatisticsLaboratoryReceptionsPopular
												}
												legend={{
													label: 'Партнер',
													value: 'Кол-во приемов'
												}}
											/>
										</div>
									</Paper>
								</Grid>
							</Grid>

							<Grid className="mt-20" container spacing={2}>
								<Grid item lg={6} xs={12}>
									<AbcAnalysis
										title="ABC-анализ партнеров"
										legendTitle="Все партнеры"
										segments={
											normalizeCompaniesPartnersStatisticsLaboratoryReceptionsAbcAnalysis.segments
										}
										columns={
											normalizeCompaniesPartnersStatisticsLaboratoryReceptionsAbcAnalysis.columns
										}
										list={normalizeCompaniesPartnersStatisticsLaboratoryReceptionsAbcAnalysis.list}
									/>
								</Grid>
							</Grid>
						</>
					)}

					<ModalPopularByCount
						title="Популярные услуги"
						list={resultsClinicServicesStatisticsLaboratoryReceptionsPopular.list}
						isOpen={isShowModalDetailsServices}
						onClose={() => setIsShowModalDetailsServices(false)}
					/>

					<ModalPopularByCount
						title="Популярные медикаменты"
						list={resultsProductsStatisticsLaboratoryReceptionsPopular.list}
						isOpen={isShowModalDetailsProducts}
						onClose={() => setIsShowModalDetailsProducts(false)}
					/>
				</>
			)}
		</>
	);
}
