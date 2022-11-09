import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Divider, Typography, useTheme } from '@material-ui/core';
import { ChartPie } from '../ChartPie';
import { DataTable } from '../../../../bizKITUi';
import { numberFormat } from '../../../../utils';

const useStyles = makeStyles(theme => ({
	itemChart: {
		width: '100%'
	}
}));

export function AbcAnalysis({ title, legendTitle, segments, list, columns }) {
	const { palette } = useTheme();

	const classes = useStyles();

	const dataForCharPie = useMemo(() => {
		return [
			{
				label: 'Сегмент А',
				value: segments.A,
				color: palette.success.main
			},
			{
				label: 'Сегмент B',
				value: segments.B,
				color: palette.warning.main
			},
			{
				label: 'Сегмент C',
				value: segments.C,
				color: palette.error.main
			}
		];
	}, [palette, segments]);

	const getTemplate = templateName => {
		const map = {
			currency: value => <span className="whitespace-no-wrap">{numberFormat.currency(value)} ₸</span>,
			percent: value => <span className="whitespace-no-wrap">{value} %</span>,
			segment: value => {
				const color = {
					A: palette.success.main,
					B: palette.warning.main,
					C: palette.error.main
				}[value];

				return (
					<div className="font-bold" style={{ color }}>
						{value}
					</div>
				);
			}
		};

		return map[templateName];
	};

	const dataTableColumns = [
		...columns.map((item, index) => ({
			name: index,
			label: item.label,
			options: {
				customBodyRenderLite: dataIndex => {
					const value = list[dataIndex][index];
					const actionTemplate = item.template && getTemplate(item.template);

					if (actionTemplate) {
						return actionTemplate(value);
					}

					return value;
				}
			}
		}))
	];
	const tableOptions = {
		elevation: 0
	};

	return (
		<Paper>
			<Typography color="secondary" className="text-16 font-bold p-20">
				{title}
			</Typography>

			<Divider />

			<div className={`inline-block p-20 ${classes.itemChart}`}>
				<ChartPie
					data={dataForCharPie}
					legend={{
						label: legendTitle
					}}
					onBeforeDisplayValue={value => `${numberFormat.currency(value)} ₸`}
				/>
			</div>

			<Divider className="mt-32" />
			<DataTable className="m-0" columns={dataTableColumns} options={tableOptions} data={list} />
		</Paper>
	);
}
AbcAnalysis.propTypes = {
	title: PropTypes.string.isRequired,
	legendTitle: PropTypes.string.isRequired,
	segments: PropTypes.shape({
		A: PropTypes.number.isRequired,
		B: PropTypes.number.isRequired,
		C: PropTypes.number.isRequired
	}).isRequired,
	columns: PropTypes.arrayOf(
		PropTypes.shape({
			label: PropTypes.string.isRequired,
			template: PropTypes.oneOf(['currency', 'percent', 'segment'])
		})
	).isRequired,
	list: PropTypes.arrayOf(PropTypes.any).isRequired
};
