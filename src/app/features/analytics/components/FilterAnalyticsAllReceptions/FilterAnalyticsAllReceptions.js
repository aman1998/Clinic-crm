import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { useTheme, Paper, Typography, Grid, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { usePromise, useStateForm } from '../../../../hooks';
import { ChartPie } from '../ChartPie';
import { AbcAnalysis } from '../AbcAnalysis';
import { statisticsCommonService, clinicService, ENTITY } from '../../../../services';
import { BlockAnalyticsInfo } from '../BlockAnalyticsInfo';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { ModalPopularByCount } from '../ModalPopularByCount';
import { numberFormat } from '../../../../utils';
import { TYPE_SERVICE_COMMON } from '../../../../services/clinic/constants';
import { useSearchClinicService } from '../../../../common/hooks/useSearchClinicService';
import { Autocomplete, Button, DatePickerField, MenuItem, TextField } from '../../../../bizKITUi';
import { ChartBarPeriod } from '../ChartBarPeriod';

const MAX_ITEMS = 4;

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: 'repeat(5, 1fr)',
		[theme.breakpoints.down(1279)]: {
			gridTemplateColumns: 'repeat(2, 1fr)'
		},
		[theme.breakpoints.down(767)]: {
			gridTemplateColumns: '1fr'
		}
	},
	button: {
		display: 'flex',
		marginLeft: 'auto',
		[theme.breakpoints.down(1279)]: {
			margin: '0'
		}
	}
}));

const now = new Date();
const initialValues = {
	direction: '',
	service: null,
	date_from: new Date(now.setMonth(now.getMonth() - 1)),
	date_to: new Date()
};

export function FilterAnalyticsAllReceptions() {
	const { palette } = useTheme();
	const classes = useStyles();

	const { form, setInForm, handleChange, setForm } = useStateForm(initialValues);
	const [filter, setFilter] = useState({});

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

	const listDirectionsParams = { service_type: TYPE_SERVICE_COMMON, limit: Number.MAX_SAFE_INTEGER };
	const { data: listDirections } = useQuery([ENTITY.DIRECTION, listDirectionsParams], () =>
		clinicService.getDirections(listDirectionsParams)
	);

	const {
		status: statusSearchClinicService,
		actions: actionsSearchClinicService,
		data: dataSearchClinicService
	} = useSearchClinicService();

	const colors = useMemo(
		() => [palette.success.main, palette.warning.main, palette.primary.main, palette.error.main],
		[palette.error.main, palette.primary.main, palette.success.main, palette.warning.main]
	);

	const {
		isLoading: isLoadingStatisticsReceptions,
		error: errorStatisticsReceptions,
		results: resultsStatisticsReceptions,
		update: updateStatisticsReceptions
	} = usePromise();
	useEffect(() => {
		updateStatisticsReceptions(() => statisticsCommonService.getReceptions(filter).then(({ data }) => data));
	}, [filter, updateStatisticsReceptions]);

	const {
		isLoading: isLoadingClinicDirectionsStatisticsReceptionsCommonPopular,
		error: errorClinicDirectionsStatisticsReceptionsCommonPopular,
		results: resultsClinicDirectionsStatisticsReceptionsCommonPopular,
		update: updateClinicDirectionsStatisticsReceptionsCommonPopular
	} = usePromise();
	useEffect(() => {
		updateClinicDirectionsStatisticsReceptionsCommonPopular(() =>
			clinicService.getClinicDirectionsStatisticsReceptionsCommonPopular(filter).then(({ data }) => ({
				list: data.results,
				totalCount: data.count
			}))
		);
	}, [filter, updateClinicDirectionsStatisticsReceptionsCommonPopular]);
	const normalizeDataClinicDirectionsStatisticsReceptionsCommonPopular = useMemo(() => {
		if (!resultsClinicDirectionsStatisticsReceptionsCommonPopular) {
			return [];
		}

		return resultsClinicDirectionsStatisticsReceptionsCommonPopular.list.slice(0, MAX_ITEMS).map((item, index) => ({
			label: item.name,
			value: item.count ?? 0,
			color: colors[index]
		}));
	}, [colors, resultsClinicDirectionsStatisticsReceptionsCommonPopular]);

	const {
		isLoading: isLoadingClinicServicesStatisticsReceptionsCommonPopular,
		error: errorClinicServicesStatisticsReceptionsCommonPopular,
		results: resultsClinicServicesStatisticsReceptionsCommonPopular,
		update: updateClinicServicesStatisticsReceptionsCommonPopular
	} = usePromise();
	useEffect(() => {
		updateClinicServicesStatisticsReceptionsCommonPopular(() =>
			clinicService.getClinicServicesStatisticsReceptionsCommonPopular(filter).then(({ data }) => ({
				list: data.results,
				totalCount: data.count
			}))
		);
	}, [filter, updateClinicServicesStatisticsReceptionsCommonPopular]);
	const normalizeDataClinicServicesStatisticsReceptionsCommonPopular = useMemo(() => {
		if (!resultsClinicServicesStatisticsReceptionsCommonPopular) {
			return [];
		}

		return resultsClinicServicesStatisticsReceptionsCommonPopular.list.slice(0, MAX_ITEMS).map((item, index) => ({
			label: item.name,
			value: item.count ?? 0,
			color: colors[index]
		}));
	}, [colors, resultsClinicServicesStatisticsReceptionsCommonPopular]);

	const {
		isLoading: isLoadingClinicDirectionsStatisticsReceptionsCommonAbcAnalysis,
		error: errorClinicDirectionsStatisticsReceptionsCommonAbcAnalysis,
		results: resultsClinicDirectionsStatisticsReceptionsCommonAbcAnalysis,
		update: updateClinicDirectionsStatisticsReceptionsCommonAbcAnalysis
	} = usePromise();
	useEffect(() => {
		updateClinicDirectionsStatisticsReceptionsCommonAbcAnalysis(() =>
			clinicService.getClinicDirectionsStatisticsReceptionsCommonAbcAnalysis(filter).then(({ data }) => data)
		);
	}, [filter, updateClinicDirectionsStatisticsReceptionsCommonAbcAnalysis]);
	const normalizeClinicDirectionsStatisticsReceptionsCommonAbcAnalysis = useMemo(() => {
		if (!resultsClinicDirectionsStatisticsReceptionsCommonAbcAnalysis) {
			return null;
		}

		return {
			segments: resultsClinicDirectionsStatisticsReceptionsCommonAbcAnalysis.segments,
			columns: [
				{ label: 'Наименование' },
				{ label: 'Выручка', template: 'currency' },
				{ label: 'Кол-во' },
				{ label: 'Доля', template: 'percent' },
				{ label: 'Сегмент', template: 'segment' }
			],
			list: resultsClinicDirectionsStatisticsReceptionsCommonAbcAnalysis.states.map(item => [
				item.name,
				item.sum,
				item.count ?? 0,
				item.contribution,
				item.segment
			])
		};
	}, [resultsClinicDirectionsStatisticsReceptionsCommonAbcAnalysis]);

	const {
		isLoading: isLoadingClinicServicesStatisticsReceptionsCommonAbcAnalysis,
		error: errorClinicServicesStatisticsReceptionsCommonAbcAnalysis,
		results: resultsClinicServicesStatisticsReceptionsCommonAbcAnalysis,
		update: updateClinicServicesStatisticsReceptionsCommonAbcAnalysis
	} = usePromise();
	useEffect(() => {
		updateClinicServicesStatisticsReceptionsCommonAbcAnalysis(() =>
			clinicService.getClinicServicesStatisticsReceptionsCommonAbcAnalysis(filter).then(({ data }) => data)
		);
	}, [filter, updateClinicServicesStatisticsReceptionsCommonAbcAnalysis]);
	const normalizeClinicServicesStatisticsReceptionsCommonAbcAnalysis = useMemo(() => {
		if (!resultsClinicServicesStatisticsReceptionsCommonAbcAnalysis) {
			return null;
		}

		return {
			segments: resultsClinicServicesStatisticsReceptionsCommonAbcAnalysis.segments,
			columns: [
				{ label: 'Наименование' },
				{ label: 'Выручка', template: 'currency' },
				{ label: 'Кол-во' },
				{ label: 'Доля', template: 'percent' },
				{ label: 'Сегмент', template: 'segment' }
			],
			list: resultsClinicServicesStatisticsReceptionsCommonAbcAnalysis.states.map(item => [
				item.name,
				item.sum,
				item.count ?? 0,
				item.contribution,
				item.segment
			])
		};
	}, [resultsClinicServicesStatisticsReceptionsCommonAbcAnalysis]);

	const {
		isLoading: isLoadingStatisticsReceptionsCount,
		error: errorStatisticsReceptionsCount,
		results: resultsStatisticsReceptionsCount,
		update: updateStatisticsReceptionsCount
	} = usePromise();
	useEffect(() => {
		updateStatisticsReceptionsCount(() =>
			statisticsCommonService.getReceptionsCount(filter).then(({ data }) => data)
		);
	}, [filter, updateStatisticsReceptionsCount]);

	const [isShowModalDetailsDirections, setIsShowModalDetailsDirections] = useState(false);
	const [isShowModalDetailsServices, setIsShowModalDetailsServices] = useState(false);

	const isLoading =
		isLoadingStatisticsReceptions ||
		!resultsStatisticsReceptions ||
		isLoadingClinicDirectionsStatisticsReceptionsCommonPopular ||
		!resultsClinicDirectionsStatisticsReceptionsCommonPopular ||
		isLoadingClinicServicesStatisticsReceptionsCommonPopular ||
		!resultsClinicServicesStatisticsReceptionsCommonPopular ||
		isLoadingClinicDirectionsStatisticsReceptionsCommonAbcAnalysis ||
		!resultsClinicDirectionsStatisticsReceptionsCommonAbcAnalysis ||
		isLoadingClinicServicesStatisticsReceptionsCommonAbcAnalysis ||
		!resultsClinicServicesStatisticsReceptionsCommonAbcAnalysis ||
		isLoadingStatisticsReceptionsCount ||
		!resultsStatisticsReceptionsCount;
	const isError =
		errorStatisticsReceptions ||
		errorClinicDirectionsStatisticsReceptionsCommonPopular ||
		errorClinicServicesStatisticsReceptionsCommonPopular ||
		errorClinicDirectionsStatisticsReceptionsCommonAbcAnalysis ||
		errorClinicServicesStatisticsReceptionsCommonAbcAnalysis ||
		errorStatisticsReceptionsCount;

	return (
		<>
			<Paper className="p-12 mb-32">
				<form className={`gap-10 ${classes.form}`} onSubmit={handleOnApplyFilter}>
					<TextField
						select
						label="Направление"
						variant="outlined"
						size="small"
						fullWidth
						name="direction"
						value={form.direction}
						onChange={handleChange}
					>
						<MenuItem value="">Все</MenuItem>
						{listDirections?.results.map(item => (
							<MenuItem key={item.uuid} value={item.uuid}>
								{item.name}
							</MenuItem>
						))}
					</TextField>

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
								type: TYPE_SERVICE_COMMON
							})
						}
						onInputChange={(_, newValue) =>
							actionsSearchClinicService.update(newValue, {
								doctor: form.doctor,
								type: TYPE_SERVICE_COMMON
							})
						}
						value={form.service}
						fullWidth
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
					{resultsStatisticsReceptions.total_receptions <= 0 ? (
						<Typography color="secondary" className="mt-32 font-bold">
							По выбранной услуге и направлению за указанный период приемов не найдено
						</Typography>
					) : (
						<>
							<Typography color="secondary" className="mt-32 text-lg font-bold">
								Количество приемов
							</Typography>
							<Grid container spacing={2} className="mt-20">
								<Grid item lg={3}>
									<BlockAnalyticsInfo
										title="Всего приемов"
										value={
											<span className="text-success">
												{resultsStatisticsReceptions.total_receptions}
											</span>
										}
									/>
								</Grid>
								<Grid item lg={3}>
									<BlockAnalyticsInfo
										title="Регистратура"
										value={<span>{resultsStatisticsReceptions.receptions_count}</span>}
									/>
								</Grid>
								<Grid item lg={3}>
									<BlockAnalyticsInfo
										title="Стационар"
										value={<span>{resultsStatisticsReceptions.stationary_receptions_count}</span>}
									/>
								</Grid>
								<Grid item lg={3}>
									<BlockAnalyticsInfo
										title="Лаборатория"
										value={<span>{resultsStatisticsReceptions.laboratory_receptions_count}</span>}
									/>
								</Grid>
							</Grid>

							<Typography color="secondary" className="mt-32 text-lg font-bold">
								Сумма приемов
							</Typography>
							<Grid container spacing={2} className="mt-20">
								<Grid item lg={3}>
									<BlockAnalyticsInfo
										title="Всего оплачено"
										row={false}
										value={
											<span className="text-success">
												{numberFormat.currency(resultsStatisticsReceptions.total_sum)} ₸
											</span>
										}
									/>
								</Grid>
								<Grid item lg={3}>
									<BlockAnalyticsInfo
										title="Регистратура"
										row={false}
										value={
											<span>
												{numberFormat.currency(resultsStatisticsReceptions.receptions_sum)} ₸
											</span>
										}
									/>
								</Grid>
								<Grid item lg={3}>
									<BlockAnalyticsInfo
										title="Стационар"
										row={false}
										value={
											<span>
												{numberFormat.currency(
													resultsStatisticsReceptions.stationary_receptions_sum
												)}{' '}
												₸
											</span>
										}
									/>
								</Grid>
								<Grid item lg={3}>
									<BlockAnalyticsInfo
										title="Лаборатория"
										row={false}
										value={
											<span>
												{numberFormat.currency(
													resultsStatisticsReceptions.laboratory_receptions_sum
												)}{' '}
												₸
											</span>
										}
									/>
								</Grid>
							</Grid>

							<Typography color="secondary" className="mt-32 text-lg font-bold">
								Направления и услуги
							</Typography>
							<Grid className="mt-20" container spacing={2}>
								<Grid item lg={6} xs={12}>
									<Paper>
										<Typography color="secondary" className="text-16 font-bold p-20">
											Популярные направления по количеству
										</Typography>

										<Divider />

										<div className={`inline-block p-20 ${classes.itemChart}`}>
											<ChartPie
												data={normalizeDataClinicDirectionsStatisticsReceptionsCommonPopular}
												legend={{
													label: 'Направление',
													value: 'Кол-во приемов'
												}}
												onClickDetail={() => setIsShowModalDetailsDirections(true)}
											/>
										</div>
									</Paper>
								</Grid>

								<Grid item lg={6} xs={12}>
									<Paper>
										<Typography color="secondary" className="text-16 font-bold p-20">
											Популярные услуги по количеству
										</Typography>

										<Divider />

										<div className={`inline-block p-20 ${classes.itemChart}`}>
											<ChartPie
												data={normalizeDataClinicServicesStatisticsReceptionsCommonPopular}
												legend={{
													label: 'Услуга',
													value: 'Кол-во приемов'
												}}
												onClickDetail={() => setIsShowModalDetailsServices(true)}
											/>
										</div>
									</Paper>
								</Grid>
							</Grid>

							<Grid className="mt-20" container spacing={2}>
								<Grid item lg={6} xs={12}>
									<AbcAnalysis
										title="ABC-анализ направлений"
										legendTitle="Все направления"
										segments={
											normalizeClinicDirectionsStatisticsReceptionsCommonAbcAnalysis.segments
										}
										columns={normalizeClinicDirectionsStatisticsReceptionsCommonAbcAnalysis.columns}
										list={normalizeClinicDirectionsStatisticsReceptionsCommonAbcAnalysis.list}
									/>
								</Grid>

								<Grid item lg={6} xs={12}>
									<AbcAnalysis
										title="ABC-анализ услуг"
										legendTitle="Все услуги"
										segments={normalizeClinicServicesStatisticsReceptionsCommonAbcAnalysis.segments}
										columns={normalizeClinicServicesStatisticsReceptionsCommonAbcAnalysis.columns}
										list={normalizeClinicServicesStatisticsReceptionsCommonAbcAnalysis.list}
									/>
								</Grid>
							</Grid>

							<Grid className="mt-20" container spacing={2}>
								<Grid item lg={6} xs={12}>
									<ChartBarPeriod
										title="Количество приемов"
										days={resultsStatisticsReceptionsCount.days}
										time={resultsStatisticsReceptionsCount.time}
										period={resultsStatisticsReceptionsCount.period}
									/>
								</Grid>
							</Grid>
						</>
					)}

					<ModalPopularByCount
						title="Популярные направления"
						list={resultsClinicDirectionsStatisticsReceptionsCommonPopular.list}
						isOpen={isShowModalDetailsDirections}
						onClose={() => setIsShowModalDetailsDirections(false)}
					/>

					<ModalPopularByCount
						title="Популярные услуги"
						list={resultsClinicServicesStatisticsReceptionsCommonPopular.list}
						isOpen={isShowModalDetailsServices}
						onClose={() => setIsShowModalDetailsServices(false)}
					/>
				</>
			)}
		</>
	);
}
