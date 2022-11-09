import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import moment from 'moment';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useDebouncedFilterForm } from '../../hooks';
import { ErrorMessage } from '../ErrorMessage';
import FuseLoading from '../../../@fuse/core/FuseLoading';
import { DataTable } from '../../bizKITUi/DataTable';
import { TextField } from '../../bizKITUi/TextField';
import { DatePickerField } from '../../bizKITUi/DatePickerField';
import { MenuItem } from '../../bizKITUi/MenuItem';
import { productsService } from '../../services/products';
import { ENTITY } from '../../services';
import { Amount } from '../../bizKITUi';

const productCostHistoryTypeList = productsService.getProductCostHistoryTypeList();

const useStyles = makeStyles(theme => ({
	itemFilter: {
		width: 200,
		minWidth: 200,
		marginRight: theme.spacing(2)
	}
}));
const columns = [
	{
		name: 'type',
		label: 'Тип',
		options: {
			customBodyRender: value => {
				const { name } = productsService.getProductCostHistoryType(value);
				return name ?? 'Не указано';
			}
		}
	},
	{
		name: 'created_at',
		label: 'Дата',
		options: {
			customBodyRender: value => {
				return moment(value).format('DD.MM.YYYY');
			}
		}
	},
	{
		name: 'cost',
		label: 'Цена',
		options: {
			customBodyRender: value => {
				return <Amount value={Number(value)} />;
			}
		}
	}
];

export function TableProductCostHistory({ productUuid }) {
	const classes = useStyles();

	const { form, debouncedForm, setInForm, getPage, setPage } = useDebouncedFilterForm({
		type: '',
		created_at_from: null,
		created_at_to: null,
		offset: 0,
		limit: 10
	});

	const { isLoading, isError, data } = useQuery(
		[ENTITY.PRODUCT_COST_HISTORY, productUuid, debouncedForm],
		({ queryKey }) => productsService.getProductCostHistory(productUuid, queryKey[2]).then(res => res.data)
	);

	const tableOptions = {
		serverSide: true,
		rowsPerPage: form.limit,
		page: getPage(),
		count: data?.count ?? 0,
		onChangePage: page => setPage(page),
		onChangeRowsPerPage: limit => setInForm('limit', limit)
	};

	return (
		<>
			<div className="flex justify-between">
				<Typography color="secondary" className="text-xl mb-24">
					История изменений цен
				</Typography>

				<div className="flex ml-10">
					<TextField
						label="Тип"
						type="text"
						variant="outlined"
						size="small"
						name="type"
						className={classes.itemFilter}
						fullWidth
						select
						value={form.type}
						onChange={event => setInForm('type', event.target.value)}
					>
						<MenuItem value="">Все</MenuItem>
						{productCostHistoryTypeList.map(item => (
							<MenuItem key={item.type} value={item.type}>
								{item.name}
							</MenuItem>
						))}
					</TextField>

					<DatePickerField
						label="Дата от"
						inputVariant="outlined"
						fullWidth
						className={classes.itemFilter}
						onlyValid
						size="small"
						value={form.created_at_from}
						onChange={date => setInForm('created_at_from', date)}
					/>

					<DatePickerField
						label="Дата до"
						inputVariant="outlined"
						fullWidth
						className={classes.itemFilter}
						onlyValid
						size="small"
						value={form.created_at_to}
						onChange={date => setInForm('created_at_to', date)}
					/>
				</div>
			</div>

			{isLoading ? (
				<FuseLoading />
			) : isError ? (
				<ErrorMessage />
			) : (
				<DataTable data={data.results} columns={columns} options={tableOptions} />
			)}
		</>
	);
}
TableProductCostHistory.propTypes = {
	productUuid: PropTypes.string.isRequired
};
