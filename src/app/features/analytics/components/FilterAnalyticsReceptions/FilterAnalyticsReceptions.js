import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { useTheme, Paper, Typography, Grid, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Autocomplete, Button, DatePickerField, MenuItem, TextField } from '../../../../bizKITUi';
import { useStateForm, usePromise } from '../../../../hooks';
import { useSearchClinicService } from '../../../../common/hooks/useSearchClinicService';
import { ClinicReceptionsStatistics } from '../ClinicReceptionsStatistics';
import { useClinicReceptionsStatistics } from '../../../../common/hooks/useReceptionsStatistics';
import { ChartPie } from '../ChartPie';
import { AbcAnalysis } from '../AbcAnalysis';
import { clinicService, ENTITY } from '../../../../services';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ModalPopularByCount } from '../ModalPopularByCount';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { TYPE_SERVICE_COMMON } from '../../../../services/clinic/constants';
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

export function FilterAnalyticsReceptions() {
	const { palette } = useTheme();
	const classes = useStyles();

	const { form, setInForm, handleChange, setForm } = useStateForm(initialValues);
	const [filter, setFilter] = useState({});

	const colors = useMemo(
		() => [palette.success.main, palette.warning.main, palette.primary.main, palette.error.main],
		[palette.error.main, palette.primary.main, palette.success.main, palette.warning.main]
	);

	const listDirectionsParams = { service_type: TYPE_SERVICE_COMMON, limit: Number.MAX_SAFE_INTEGER };
	const { data: listDirections } = useQuery([ENTITY.DIRECTION, listDirectionsParams], () =>
		clinicService.getDirections(listDirectionsParams)
	);

	const {
		status: statusSearchClinicService,
		actions: actionsSearchClinicService,
		data: dataSearchClinicService
	} = useSearchClinicService();

	const {
		isLoading: isLoadingClinicReceptionsStatistics,
		error: errorClinicReceptionsStatistics,
		get: getClinicReceptionsStatistics,
		data: dataClinicReceptionsStatistics
	} = useClinicReceptionsStatistics();
	useEffect(() => {
		getClinicReceptionsStatistics(filter);
	}, [getClinicReceptionsStatistics, filter]);
	const normalizeDataClinicReceptionsStatistics = useMemo(() => {
		if (!dataClinicReceptionsStatistics) {
			return null;
		}

		return {
			count: dataClinicReceptionsStatistics.count ?? 0,
			appointed: dataClinicReceptionsStatistics.appointed ?? 0,
			confirmed: dataClinicReceptionsStatistics.confirmed ?? 0,
			cash: dataClinicReceptionsStatistics.cash ?? 0,
			paid: dataClinicReceptionsStatistics.paid ?? 0,
			failed: dataClinicReceptionsStatistics.failed ?? 0,
			not_paid: dataClinicReceptionsStatistics.not_paid ?? 0,
			cancel: dataClinicReceptionsStatistics.cancel ?? 0,
			plan: dataClinicReceptionsStatistics.plan ?? 0,
			fact: dataClinicReceptionsStatistics.fact ?? 0
		};
	}, [dataClinicReceptionsStatistics]);

	const {
		isLoading: isLoadingClinicDirectionsStatisticsReceptionsPopular,
		error: errorClinicDirectionsStatisticsReceptionsPopular,
		results: resultsClinicDirectionsStatisticsReceptionsPopular,
		update: updateClinicDirectionsStatisticsReceptionsPopular
	} = usePromise();
	useEffect(() => {
		updateClinicDirectionsStatisticsReceptionsPopular(() =>
			clinicService.getClinicDirectionsStatisticsReceptionsPopular(filter).then(({ data }) => ({
				list: data.results,
				totalCount: data.count
			}))
		);
	}, [filter, updateClinicDirectionsStatisticsReceptionsPopular]);
	const normalizeDataClinicDirectionsStatisticsReceptionsPopular = useMemo(() => {
		if (!resultsClinicDirectionsStatisticsReceptionsPopular) {
			return [];
		}

		return resultsClinicDirectionsStatisticsReceptionsPopular.list.slice(0, MAX_ITEMS).map((item, index) => ({
			label: item.name,
			value: item.count ?? 0,
			color: colors[index]
		}));
	}, [colors, resultsClinicDirectionsStatisticsReceptionsPopular]);

	const {
		isLoading: isLoadingClinicServicesStatisticsReceptionsPopular,
		error: errorClinicServicesStatisticsReceptionsPopular,
		results: resultsClinicServicesStatisticsReceptionsPopular,
		update: updateClinicServicesStatisticsReceptionsPopular
	} = usePromise();
	useEffect(() => {
		updateClinicServicesStatisticsReceptionsPopular(() =>
			clinicService.getClinicServicesStatisticsReceptionsPopular(filter).then(({ data: resp }) => ({
				list: resp.results,
				totalCount: resp.count
			}))
		);
	}, [filter, updateClinicServicesStatisticsReceptionsPopular]);
	const normalizeDataClinicServicesStatisticsReceptionsPopular = useMemo(() => {
		if (!resultsClinicServicesStatisticsReceptionsPopular) {
			return [];
		}

		return resultsClinicServicesStatisticsReceptionsPopular.list.slice(0, MAX_ITEMS).map((item, index) => ({
			label: item.name,
			value: item.count ?? 0,
			color: colors[index]
		}));
	}, [colors, resultsClinicServicesStatisticsReceptionsPopular]);

	const {
		isLoading: isLoadingClinicDirectionsStatisticsReceptionsAbcAnalysis,
		error: errorClinicDirectionsStatisticsReceptionsAbcAnalysis,
		results: resultsClinicDirectionsStatisticsReceptionsAbcAnalysis,
		update: updateClinicDirectionsStatisticsReceptionsAbcAnalysis
	} = usePromise();
	useEffect(() => {
		updateClinicDirectionsStatisticsReceptionsAbcAnalysis(() =>
			clinicService.getClinicDirectionsStatisticsReceptionsAbcAnalysis(filter).then(({ data }) => data)
		);
	}, [filter, updateClinicDirectionsStatisticsReceptionsAbcAnalysis]);
	const normalizeClinicDirectionsStatisticsReceptionsAbcAnalysis = useMemo(() => {
		if (!resultsClinicDirectionsStatisticsReceptionsAbcAnalysis) {
			return null;
		}

		return {
			segments: resultsClinicDirectionsStatisticsReceptionsAbcAnalysis.segments,
			columns: [
				{ label: 'Наименование' },
				{ label: 'Выручка', template: 'currency' },
				{ label: 'Кол-во' },
				{ label: 'Доля', template: 'percent' },
				{ label: 'Сегмент', template: 'segment' }
			],
			list: resultsClinicDirectionsStatisticsReceptionsAbcAnalysis.states.map(item => [
				item.name,
				item.sum,
				item.count ?? 0,
				item.contribution,
				item.segment
			])
		};
	}, [resultsClinicDirectionsStatisticsReceptionsAbcAnalysis]);

	const {
		isLoading: isLoadingClinicServicesStatisticsReceptionsAbcAnalysis,
		error: errorClinicServicesStatisticsReceptionsAbcAnalysis,
		results: resultsClinicServicesStatisticsReceptionsAbcAnalysis,
		update: updateClinicServicesStatisticsReceptionsAbcAnalysis
	} = usePromise();
	useEffect(() => {
		updateClinicServicesStatisticsReceptionsAbcAnalysis(() =>
			clinicService.getClinicServicesStatisticsReceptionsAbcAnalysis(filter).then(({ data }) => data)
		);
	}, [filter, updateClinicServicesStatisticsReceptionsAbcAnalysis]);
	const normalizeClinicServicesStatisticsReceptionsAbcAnalysis = useMemo(() => {
		if (!resultsClinicServicesStatisticsReceptionsAbcAnalysis) {
			return null;
		}

		return {
			segments: resultsClinicServicesStatisticsReceptionsAbcAnalysis.segments,
			columns: [
				{ label: 'Наименование' },
				{ label: 'Выручка', template: 'currency' },
				{ label: 'Кол-во' },
				{ label: 'Доля', template: 'percent' },
				{ label: 'Сегмент', template: 'segment' }
			],
			list: resultsClinicServicesStatisticsReceptionsAbcAnalysis.states.map(item => [
				item.name,
				item.sum,
				item.count ?? 0,
				item.contribution,
				item.segment
			])
		};
	}, [resultsClinicServicesStatisticsReceptionsAbcAnalysis]);

	const {
		isLoading: isLoadingClinicReceptionsStatisticsCount,
		error: errorClinicReceptionsStatisticsCount,
		results: resultsClinicReceptionsStatisticsCount,
		update: updateClinicReceptionsStatisticsCount
	} = usePromise();
	useEffect(() => {
		updateClinicReceptionsStatisticsCount(() =>
			clinicService.getClinicReceptionsStatisticsCount(filter).then(({ data }) => data)
		);
	}, [filter, updateClinicReceptionsStatisticsCount]);

	const [isShowModalDetailsDirections, setIsShowModalDetailsDirections] = useState(false);
	const [isShowModalDetailsServices, setIsShowModalDetailsServices] = useState(false);

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
		isLoadingClinicReceptionsStatistics ||
		isLoadingClinicDirectionsStatisticsReceptionsPopular ||
		isLoadingClinicServicesStatisticsReceptionsPopular ||
		isLoadingClinicDirectionsStatisticsReceptionsAbcAnalysis ||
		isLoadingClinicServicesStatisticsReceptionsAbcAnalysis ||
		isLoadingClinicReceptionsStatisticsCount ||
		!dataClinicReceptionsStatistics ||
		!resultsClinicDirectionsStatisticsReceptionsPopular ||
		!resultsClinicServicesStatisticsReceptionsPopular ||
		!resultsClinicDirectionsStatisticsReceptionsAbcAnalysis ||
		!resultsClinicServicesStatisticsReceptionsAbcAnalysis ||
		!resultsClinicReceptionsStatisticsCount;
	const isError =
		errorClinicReceptionsStatistics ||
		errorClinicDirectionsStatisticsReceptionsPopular ||
		errorClinicServicesStatisticsReceptionsPopular ||
		errorClinicDirectionsStatisticsReceptionsAbcAnalysis ||
		errorClinicServicesStatisticsReceptionsAbcAnalysis ||
		errorClinicReceptionsStatisticsCount;

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
						className={classes.itemFilter}
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
					{dataClinicReceptionsStatistics.count <= 0 ? (
						<Typography color="secondary" className="mt-32 font-bold">
							По выбранной услуге и направлению за указанный период приемов не найдено
						</Typography>
					) : (
						<>
							<Typography color="secondary" className="mt-32 text-lg font-bold">
								Статистика приемов по количеству и статусам
							</Typography>
							<div className="mt-20">
								<ClinicReceptionsStatistics data={normalizeDataClinicReceptionsStatistics} />
							</div>

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

										<div className="inline-block p-20">
											<ChartPie
												data={normalizeDataClinicDirectionsStatisticsReceptionsPopular}
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

										<div className="inline-block p-20">
											<ChartPie
												data={normalizeDataClinicServicesStatisticsReceptionsPopular}
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
										segments={normalizeClinicDirectionsStatisticsReceptionsAbcAnalysis.segments}
										columns={normalizeClinicDirectionsStatisticsReceptionsAbcAnalysis.columns}
										list={normalizeClinicDirectionsStatisticsReceptionsAbcAnalysis.list}
									/>
								</Grid>

								<Grid item lg={6} xs={12}>
									<AbcAnalysis
										title="ABC-анализ услуг"
										legendTitle="Все услуги"
										segments={normalizeClinicServicesStatisticsReceptionsAbcAnalysis.segments}
										columns={normalizeClinicServicesStatisticsReceptionsAbcAnalysis.columns}
										list={normalizeClinicServicesStatisticsReceptionsAbcAnalysis.list}
									/>
								</Grid>
							</Grid>

							<Grid className="mt-20" container spacing={2}>
								<Grid item lg={6} xs={12}>
									<ChartBarPeriod
										title="Количество приемов"
										days={resultsClinicReceptionsStatisticsCount.days}
										time={resultsClinicReceptionsStatisticsCount.time}
										period={resultsClinicReceptionsStatisticsCount.period}
									/>
								</Grid>
							</Grid>
						</>
					)}

					<ModalPopularByCount
						title="Популярные направления"
						list={resultsClinicDirectionsStatisticsReceptionsPopular.list}
						isOpen={isShowModalDetailsDirections}
						onClose={() => setIsShowModalDetailsDirections(false)}
					/>

					<ModalPopularByCount
						title="Популярные услуги"
						list={resultsClinicServicesStatisticsReceptionsPopular.list}
						isOpen={isShowModalDetailsServices}
						onClose={() => setIsShowModalDetailsServices(false)}
					/>
				</>
			)}
		</>
	);
}
