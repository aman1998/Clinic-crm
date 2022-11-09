import React from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody, TableContainer, TableHead, TableRow, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { TableFinanceStatisticsCell } from './TableFinanceStatisticsCell';

const useStyles = makeStyles({
	title: {
		width: 1,
		padding: 40
	},
	month: {
		whiteSpace: 'nowrap'
	}
});

export function TableFinanceStatistics({ title, months, headers, children }) {
	const classes = useStyles();

	return (
		<TableContainer component={Paper}>
			<Table>
				<TableHead>
					<TableRow>
						<TableFinanceStatisticsCell fixed rowSpan={2} className={classes.title}>
							{title}
						</TableFinanceStatisticsCell>
						{months.map((item, index) => (
							<TableFinanceStatisticsCell
								key={index}
								colSpan={headers[index].length}
								className={classes.month}
							>
								{item}
							</TableFinanceStatisticsCell>
						))}
					</TableRow>
					<TableRow>
						{headers.map(array =>
							array.map((item, key) => (
								<TableFinanceStatisticsCell key={key}>{item}</TableFinanceStatisticsCell>
							))
						)}
					</TableRow>
				</TableHead>

				<TableBody>{children}</TableBody>
			</Table>
		</TableContainer>
	);
}
TableFinanceStatistics.defaultProps = {
	children: null
};
TableFinanceStatistics.propTypes = {
	title: PropTypes.string.isRequired,
	months: PropTypes.arrayOf(PropTypes.string).isRequired,
	headers: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
	children: PropTypes.node
};
