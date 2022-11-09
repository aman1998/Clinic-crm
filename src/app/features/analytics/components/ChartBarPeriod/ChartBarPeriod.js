import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Paper, Typography, Divider, useTheme } from '@material-ui/core';
import { Bar } from 'react-chartjs-2';
import moment from 'moment';
import { getWeekDays } from '../../../../utils';
import { Button } from '../../../../bizKITUi';

const chartOptionsFactPercentage = {
	legend: {
		display: false
	},
	maintainAspectRatio: false,
	scales: {
		xAxes: [
			{
				gridLines: {
					display: false
				}
			}
		],
		yAxes: [
			{
				gridLines: {
					display: false
				}
			}
		]
	}
};

const TIMES_RANGE = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const DAYS_RANGE = [2, 3, 4, 5, 6, 7, 1];

export function ChartBarPeriod({ title, days, period, time }) {
	const theme = useTheme();

	const [tab, setTab] = useState(0);

	const getActiveColor = index => (index === tab ? 'primary' : 'secondary');

	const dataDays = useMemo(
		() => ({
			labels: DAYS_RANGE.map(item => getWeekDays({ day: item, short: true }).toUpperCase()),
			datasets: [
				{
					fill: false,
					lineTension: 0,
					backgroundColor: theme.palette.primary.main,
					data: DAYS_RANGE.map(item => days.find(_item => _item.weekday === item)?.count ?? 0)
				}
			]
		}),
		[days, theme.palette.primary.main]
	);

	const dataPeriod = useMemo(
		() => ({
			labels: period.map(item => moment(item.day).format('DD.MM.YYYY')),
			datasets: [
				{
					fill: false,
					lineTension: 0,
					backgroundColor: theme.palette.primary.main,
					data: period.map(item => item.count)
				}
			]
		}),
		[period, theme.palette.primary]
	);

	const dataTime = useMemo(
		() => ({
			labels: TIMES_RANGE,
			datasets: [
				{
					fill: false,
					lineTension: 0,
					backgroundColor: theme.palette.primary.main,
					data: TIMES_RANGE.map(item => time.find(_item => _item.time === item)?.count ?? 0)
				}
			]
		}),
		[time, theme.palette.primary.main]
	);

	return (
		<Paper>
			<div className="flex flex-wrap justify-between items-center p-16">
				<Typography color="secondary" className="text-lg font-bold">
					{title}
				</Typography>

				<div className="flex">
					<Button
						variant="text"
						color={getActiveColor(0)}
						className="mx-12"
						textNormal
						onClick={() => setTab(0)}
					>
						Период
					</Button>

					<Button
						variant="text"
						color={getActiveColor(1)}
						className="mx-12"
						textNormal
						onClick={() => setTab(1)}
					>
						Дни
					</Button>

					<Button
						variant="text"
						color={getActiveColor(2)}
						className="mx-12"
						textNormal
						onClick={() => setTab(2)}
					>
						Время
					</Button>
				</div>
			</div>

			<Divider />

			<div className="p-16">
				{tab === 0 && <Bar data={dataPeriod} options={chartOptionsFactPercentage} height={330} />}
				{tab === 1 && <Bar data={dataDays} options={chartOptionsFactPercentage} height={330} />}
				{tab === 2 && <Bar data={dataTime} options={chartOptionsFactPercentage} height={330} />}
			</div>
		</Paper>
	);
}
ChartBarPeriod.propTypes = {
	title: PropTypes.string.isRequired,
	period: PropTypes.arrayOf(
		PropTypes.shape({
			day: PropTypes.string.isRequired,
			count: PropTypes.number.isRequired
		}).isRequired
	).isRequired,
	days: PropTypes.arrayOf(
		PropTypes.shape({
			count: PropTypes.number.isRequired,
			weekday: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7])
		})
	).isRequired,
	time: PropTypes.arrayOf(
		PropTypes.shape({
			count: PropTypes.number.isRequired,
			time: PropTypes.number
		})
	).isRequired
};
