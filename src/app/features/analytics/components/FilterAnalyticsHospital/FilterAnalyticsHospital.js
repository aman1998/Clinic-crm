// noinspection JSDeprecatedSymbols

import React, { useEffect, useMemo, useState } from 'react';
import { useTheme, Paper, Typography, Grid, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Autocomplete, Button, DatePickerField, TextField } from '../../../../bizKITUi';
import { useStateForm, usePromise } from '../../../../hooks';
import { useSearchClinicService } from '../../../../common/hooks/useSearchClinicService';
import { ChartPie } from '../ChartPie';
import { AbcAnalysis } from '../AbcAnalysis';
import { clinicService, hospitalService, productsService } from '../../../../services';
import { BlockAnalyticsInfo } from '../BlockAnalyticsInfo';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { ModalPopularByCount } from '../ModalPopularByCount';
import { numberFormat } from '../../../../utils';
import { TYPE_SERVICE_HOSPITAL } from '../../../../services/clinic/constants';

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

export function FilterAnalyticsHospital() {
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
		// eslint-disable-next-line import/no-deprecated
	} = useSearchClinicService();

	const {
		isLoading: isLoadingHospitalStatisticsReceptions,
		error: errorHospitalStatisticsReceptions,
		results: resultsHospitalStatisticsReceptions,
		update: updateHospitalStatisticsReceptions
	} = usePromise();
	useEffect(() => {
		updateHospitalStatisticsReceptions(() => hospitalService.getHospitalStatisticsReceptions(filter));
	}, [filter, updateHospitalStatisticsReceptions]);

	const {
		isLoading: isLoadingClinicServicesStatisticsStationaryReceptionsPopular,
		error: errorClinicServicesStatisticsStationaryReceptionsPopular,
		results: resultsClinicServicesStatisticsStationaryReceptionsPopular,
		update: updateClinicServicesStatisticsStationaryReceptionsPopular
	} = usePromise();
	useEffect(() => {
		updateClinicServicesStatisticsStationaryReceptionsPopular(() =>
			clinicService.getClinicServicesStatisticsStationaryReceptionsPopular(filter).then(({ data }) => ({
				list: data.results,
				totalCount: data.count
			}))
		);
	}, [filter, updateClinicServicesStatisticsStationaryReceptionsPopular]);
	const normalizeDataClinicServicesStatisticsStationaryReceptionsPopular = useMemo(() => {
		if (!resultsClinicServicesStatisticsStationaryReceptionsPopular) {
			return [];
		}

		return resultsClinicServicesStatisticsStationaryReceptionsPopular.list
			.slice(0, MAX_ITEMS)
			.map((item, index) => ({
				label: item.name,
				value: item.count ?? 0,
				color: colors[index]
			}));
	}, [colors, resultsClinicServicesStatisticsStationaryReceptionsPopular]);

	const {
		isLoading: isLoadingProductsStatisticsStationaryReceptionsPopular,
		error: errorProductsStatisticsStationaryReceptionsPopular,
		results: resultsProductsStatisticsStationaryReceptionsPopular,
		update: updateProductsStatisticsStationaryReceptionsPopular
	} = usePromise();
	useEffect(() => {
		updateProductsStatisticsStationaryReceptionsPopular(() =>
			productsService.getProductsStatisticsStationaryReceptionsPopular(filter).then(({ data }) => ({
				list: data.results,
				totalCount: data.count
			}))
		);
	}, [filter, updateProductsStatisticsStationaryReceptionsPopular]);
	const normalizeDataProductsStatisticsStationaryReceptionsPopular = useMemo(() => {
		if (!resultsProductsStatisticsStationaryReceptionsPopular) {
			return [];
		}

		return resultsProductsStatisticsStationaryReceptionsPopular.list.slice(0, MAX_ITEMS).map((item, index) => ({
			label: item.name,
			value: item.count ?? 0,
			color: colors[index]
		}));
	}, [colors, resultsProductsStatisticsStationaryReceptionsPopular]);

	const {
		isLoading: isLoadingClinicServicesStatisticsStationaryReceptionsAbcAnalysis,
		error: errorClinicServicesStatisticsStationaryReceptionsAbcAnalysis,
		results: resultsClinicServicesStatisticsStationaryReceptionsAbcAnalysis,
		update: updateClinicServicesStatisticsStationaryReceptionsAbcAnalysis
	} = usePromise();
	useEffect(() => {
		updateClinicServicesStatisticsStationaryReceptionsAbcAnalysis(() =>
			clinicService.getClinicServicesStatisticsStationaryReceptionsAbcAnalysis(filter).then(({ data }) => data)
		);
	}, [filter, updateClinicServicesStatisticsStationaryReceptionsAbcAnalysis]);
	const normalizeClinicServicesStatisticsStationaryReceptionsAbcAnalysis = useMemo(() => {
		if (!resultsClinicServicesStatisticsStationaryReceptionsAbcAnalysis) {
			return null;
		}

		return {
			segments: resultsClinicServicesStatisticsStationaryReceptionsAbcAnalysis.segments,
			columns: [
				{ label: 'Наименование' },
				{ label: 'Выручка', template: 'currency' },
				{ label: 'Кол-во' },
				{ label: 'Доля', template: 'percent' },
				{ label: 'Сегмент', template: 'segment' }
			],
			list: resultsClinicServicesStatisticsStationaryReceptionsAbcAnalysis.states.map(item => [
				item.name,
				item.sum,
				item.count ?? 0,
				item.contribution,
				item.segment
			])
		};
	}, [resultsClinicServicesStatisticsStationaryReceptionsAbcAnalysis]);

	const {
		isLoading: isLoadingProductsStatisticsStationaryReceptionsAbcAnalysis,
		error: errorProductsStatisticsStationaryReceptionsAbcAnalysis,
		results: resultsProductsStatisticsStationaryReceptionsAbcAnalysis,
		update: updateProductsStatisticsStationaryReceptionsAbcAnalysis
	} = usePromise();
	useEffect(() => {
		updateProductsStatisticsStationaryReceptionsAbcAnalysis(() =>
			productsService.getProductsStatisticsStationaryReceptionsAbcAnalysis(filter).then(({ data }) => data)
		);
	}, [filter, updateProductsStatisticsStationaryReceptionsAbcAnalysis]);
	const normalizeProductsStatisticsStationaryReceptionsAbcAnalysis = useMemo(() => {
		if (!resultsProductsStatisticsStationaryReceptionsAbcAnalysis) {
			return null;
		}

		return {
			segments: resultsProductsStatisticsStationaryReceptionsAbcAnalysis.segments,
			columns: [
				{ label: 'Наименование' },
				{ label: 'Выручка', template: 'currency' },
				{ label: 'Кол-во' },
				{ label: 'Доля', template: 'percent' },
				{ label: 'Сегмент', template: 'segment' }
			],
			list: resultsProductsStatisticsStationaryReceptionsAbcAnalysis.states.map(item => [
				item.name,
				item.sum,
				item.count ?? 0,
				item.contribution,
				item.segment
			])
		};
	}, [resultsProductsStatisticsStationaryReceptionsAbcAnalysis]);

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
		isLoadingHospitalStatisticsReceptions ||
		isLoadingClinicServicesStatisticsStationaryReceptionsPopular ||
		isLoadingProductsStatisticsStationaryReceptionsPopular ||
		isLoadingClinicServicesStatisticsStationaryReceptionsAbcAnalysis ||
		isLoadingProductsStatisticsStationaryReceptionsAbcAnalysis ||
		!resultsHospitalStatisticsReceptions ||
		!resultsClinicServicesStatisticsStationaryReceptionsPopular ||
		!resultsProductsStatisticsStationaryReceptionsPopular ||
		!resultsClinicServicesStatisticsStationaryReceptionsAbcAnalysis ||
		!resultsProductsStatisticsStationaryReceptionsAbcAnalysis;
	const isError =
		errorHospitalStatisticsReceptions ||
		errorClinicServicesStatisticsStationaryReceptionsPopular ||
		errorProductsStatisticsStationaryReceptionsPopular ||
		errorClinicServicesStatisticsStationaryReceptionsAbcAnalysis ||
		errorProductsStatisticsStationaryReceptionsAbcAnalysis;

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
								type: TYPE_SERVICE_HOSPITAL
							})
						}
						onInputChange={(_, newValue) =>
							actionsSearchClinicService.update(newValue, {
								doctor: form.doctor,
								type: TYPE_SERVICE_HOSPITAL
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
					{resultsHospitalStatisticsReceptions.count <= 0 ? (
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
												{resultsHospitalStatisticsReceptions.count}
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
												{resultsHospitalStatisticsReceptions.confirmed}
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
												{resultsHospitalStatisticsReceptions.cash}
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
												{resultsHospitalStatisticsReceptions.paid}
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
												{numberFormat.currency(resultsHospitalStatisticsReceptions.fact)} ₸
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
												data={normalizeDataClinicServicesStatisticsStationaryReceptionsPopular}
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
												data={normalizeDataProductsStatisticsStationaryReceptionsPopular}
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
											normalizeClinicServicesStatisticsStationaryReceptionsAbcAnalysis.segments
										}
										columns={
											normalizeClinicServicesStatisticsStationaryReceptionsAbcAnalysis.columns
										}
										list={normalizeClinicServicesStatisticsStationaryReceptionsAbcAnalysis.list}
									/>
								</Grid>

								<Grid item lg={6} xs={12}>
									<AbcAnalysis
										title="ABC-анализ медикаментов"
										legendTitle="Все направления"
										segments={normalizeProductsStatisticsStationaryReceptionsAbcAnalysis.segments}
										columns={normalizeProductsStatisticsStationaryReceptionsAbcAnalysis.columns}
										list={normalizeProductsStatisticsStationaryReceptionsAbcAnalysis.list}
									/>
								</Grid>
							</Grid>
						</>
					)}

					<ModalPopularByCount
						title="Популярные услуги"
						list={resultsClinicServicesStatisticsStationaryReceptionsPopular.list}
						isOpen={isShowModalDetailsServices}
						onClose={() => setIsShowModalDetailsServices(false)}
					/>

					<ModalPopularByCount
						title="Популярные медикаменты"
						list={resultsProductsStatisticsStationaryReceptionsPopular.list}
						isOpen={isShowModalDetailsProducts}
						onClose={() => setIsShowModalDetailsProducts(false)}
					/>
				</>
			)}
		</>
	);
}
