import React, { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Pie } from 'react-chartjs-2';
import { useDeepCompareEffect } from '../../../../hooks';
import { Button } from '../../../../bizKITUi';

function Rectangle({ color }) {
	return <div style={{ minWidth: '18px', height: '10px', borderRadius: '2px', backgroundColor: color }} />;
}
Rectangle.propTypes = {
	color: PropTypes.string.isRequired
};

export function ChartPie({ data, legend, onBeforeDisplayValue, onClickDetail }) {
	const [dataChart, setDataChart] = useState(null);
	useDeepCompareEffect(() => {
		const newDataChart = data.reduce(
			(prev, current) => {
				prev.labels.push(current.label);
				prev.datasets[0].data.push(current.value);
				prev.datasets[0].backgroundColor.push(current.color);

				return prev;
			},
			{
				labels: [],
				datasets: [
					{
						data: [],
						backgroundColor: []
					}
				]
			}
		);

		setDataChart(newDataChart);
	}, [data]);

	const optionsChart = {
		legend: {
			display: false
		},
		maintainAspectRatio: false,
		tooltips: {
			callbacks: {
				label(tooltipItem, dataItem) {
					const dataset = dataItem.datasets[tooltipItem.datasetIndex];

					return onBeforeDisplayValue(dataset.data[tooltipItem.index]);
				}
			}
		}
	};

	return (
		dataChart && (
			<div className="flex flex-col lm2:flex-row items-center justify-center">
				<div className="bg-gray-300 rounded-full">
					<Pie data={dataChart} options={optionsChart} width={200} height={200} />
				</div>

				<div className="grid grid-cols-2 gap-20 mt-10 lm2:mt-0 lm2:ml-48">
					<p className="font-bold">{legend.label}</p>
					<p className="font-bold text-right">{legend.value}</p>
					{data.map((item, index) => (
						<Fragment key={index}>
							<div className="flex items-center">
								<Rectangle color={item.color} />
								<span className="ml-6">{item.label}</span>
							</div>
							<span className="whitespace-no-wrap text-right">{onBeforeDisplayValue(item.value)}</span>
						</Fragment>
					))}

					{onClickDetail && (
						<div>
							<Button variant="text" textNormal onClick={onClickDetail}>
								Подробнее
							</Button>
						</div>
					)}
				</div>
			</div>
		)
	);
}
ChartPie.defaultProps = {
	legend: {},
	onBeforeDisplayValue: value => value,
	onClickDetail: null
};
ChartPie.propTypes = {
	data: PropTypes.arrayOf(
		PropTypes.shape({
			label: PropTypes.string.isRequired,
			value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
			color: PropTypes.string.isRequired
		})
	).isRequired,
	legend: PropTypes.shape({
		label: PropTypes.string,
		value: PropTypes.string
	}),
	onBeforeDisplayValue: PropTypes.func,
	onClickDetail: PropTypes.func
};
