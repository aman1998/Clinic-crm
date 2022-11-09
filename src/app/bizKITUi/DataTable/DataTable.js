import React from 'react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import MUIDataTable from 'mui-datatables';
import PropTypes from 'prop-types';

const initialOptions = {
	filter: false,
	sort: false,
	toolbar: false,
	search: false,
	viewColumns: false,
	download: false,
	print: false,
	pagination: true,
	filterType: 'dropdown',
	responsive: 'vertical',
	fixedSelectColumn: false,
	selectableRows: 'none',

	textLabels: {
		body: {
			noMatch: 'Данных нет',
			toolTip: 'Сортировать',
			columnHeaderTooltip: column => `Сортировать по ${column.label}`
		},
		pagination: {
			next: 'Следующая страница',
			previous: 'Предыдущая страница',
			rowsPerPage: 'Записей на странице:',
			displayRows: 'из'
		},
		toolbar: {
			search: 'Поиск',
			downloadCsv: 'Скачать',
			print: 'Печать',
			viewColumns: 'Посмотреть столбцы',
			filterTable: 'Фильтрация'
		},
		filter: {
			all: 'Все',
			title: 'ФИЛЬТРЫ',
			reset: 'Сбросить'
		},
		viewColumns: {
			title: 'Показать столбцы',
			titleAria: 'Показать/скрыть столбцы таблицы'
		},
		selectedRows: {
			text: 'строка(и) выбрана',
			delete: 'Удалить',
			deleteAria: 'Удалить выбранные строки'
		}
	}
};

export const DataTable = React.memo(({ title, data, columns, options }) => (
	<div>
		<MuiThemeProvider
			theme={theme =>
				createMuiTheme({
					...theme,
					overrides: {
						MUIDataTableFilter: {
							title: {
								fontWeight: 'bold'
							},
							resetLink: {
								fontWeight: 'normal'
							}
						}
					}
				})
			}
		>
			<MUIDataTable title={title} data={data} columns={columns} options={{ ...initialOptions, ...options }} />
		</MuiThemeProvider>
	</div>
));
DataTable.defaultProps = {
	title: ''
};
DataTable.propTypes = {
	title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
	data: PropTypes.array.isRequired,
	columns: PropTypes.arrayOf(
		PropTypes.shape({
			name: PropTypes.string.isRequired,
			label: PropTypes.node,
			options: PropTypes.shape({
				customBodyRender: PropTypes.func,
				customBodyRenderLite: PropTypes.func,
				customHeadLabelRender: PropTypes.func,
				customFilterListOptions: PropTypes.shape({
					render: PropTypes.func,
					update: PropTypes.func
				}),
				customHeadRender: PropTypes.func,
				display: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['excluded'])]),
				download: PropTypes.bool,
				draggable: PropTypes.bool,
				empty: PropTypes.bool,
				filter: PropTypes.bool,
				filterList: PropTypes.arrayOf(PropTypes.string),
				filterOptions: PropTypes.shape({
					render: PropTypes.func
				}),
				filterType: PropTypes.oneOf(['checkbox', 'dropdown', 'multiselect', 'textField', 'custom']),
				hint: PropTypes.string,
				print: PropTypes.bool,
				searchable: PropTypes.bool,
				setCellHeaderProps: PropTypes.func,
				setCellProps: PropTypes.func,
				sort: PropTypes.bool,
				sortCompare: PropTypes.func,
				sortDescFirst: PropTypes.bool,
				sortThirdClickReset: PropTypes.bool,
				viewColumns: PropTypes.bool
			})
		})
	).isRequired,
	options: PropTypes.shape({
		caseSensitive: PropTypes.bool,
		confirmFilters: PropTypes.bool,
		columnOrder: PropTypes.arrayOf(PropTypes.number),
		count: PropTypes.number,
		customFilterDialogFooter: PropTypes.func,
		customFooter: PropTypes.func,
		customRowRender: PropTypes.func,
		customSearch: PropTypes.func,
		customSearchRender: PropTypes.func,
		customSort: PropTypes.func,
		customTableBodyFooterRender: PropTypes.func,
		customToolbar: PropTypes.func,
		customToolbarSelect: PropTypes.func,
		download: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
		downloadOptions: PropTypes.shape({
			filename: PropTypes.string,
			separator: PropTypes.string,
			filterOptions: PropTypes.shape({
				useDisplayedColumnsOnly: PropTypes.bool,
				useDisplayedRowsOnly: PropTypes.bool
			})
		}),
		draggableColumns: PropTypes.shape({
			enabled: PropTypes.bool,
			transitionTime: PropTypes.number
		}),
		elevation: PropTypes.number,
		enableNestedDataAccess: PropTypes.string,
		expandableRows: PropTypes.bool,
		expandableRowsHeader: PropTypes.bool,
		expandableRowsOnClick: PropTypes.bool,
		filter: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
		filterArrayFullMatch: PropTypes.bool,
		filterType: PropTypes.oneOf(['checkbox', 'dropdown', 'multiselect', 'textField', 'custom']),
		fixedHeader: PropTypes.bool,
		fixedSelectColumn: PropTypes.bool,
		isRowExpandable: PropTypes.func,
		isRowSelectable: PropTypes.func,
		jumpToPage: PropTypes.bool,
		onCellClick: PropTypes.func,
		onChangeRowsPerPage: PropTypes.func,
		onColumnOrderChange: PropTypes.func,
		onColumnSortChange: PropTypes.func,
		onDownload: PropTypes.func,
		onFilterChange: PropTypes.func,
		onFilterChipClose: PropTypes.func,
		onFilterConfirm: PropTypes.func,
		onFilterDialogClose: PropTypes.func,
		onFilterDialogOpen: PropTypes.func,
		onRowClick: PropTypes.func,
		onRowExpansionChange: PropTypes.func,
		onRowsDelete: PropTypes.func,
		onRowSelectionChange: PropTypes.func,
		onSearchChange: PropTypes.func,
		onSearchClose: PropTypes.func,
		onSearchOpen: PropTypes.func,
		onTableChange: PropTypes.func,
		onTableInit: PropTypes.func,
		onViewColumnsChange: PropTypes.func,
		page: PropTypes.number,
		pagination: PropTypes.bool,
		print: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
		renderExpandableRow: PropTypes.func,
		resizableColumns: PropTypes.bool,
		responsive: PropTypes.oneOf(['vertical', 'standard', 'simple', 'stacked']),
		rowHover: PropTypes.bool,
		rowsExpanded: PropTypes.arrayOf(PropTypes.number),
		rowsPerPage: PropTypes.number,
		rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
		rowsSelected: PropTypes.arrayOf(PropTypes.number),
		search: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['disabled'])]),
		searchPlaceholder: PropTypes.string,
		searchProps: PropTypes.shape({
			onBlur: PropTypes.func,
			onKeyUp: PropTypes.func
		}),
		searchOpen: PropTypes.bool,
		searchText: PropTypes.string,
		selectableRows: PropTypes.oneOf(['multiple', 'single', 'none']),
		selectableRowsHeader: PropTypes.bool,
		selectableRowsHideCheckboxes: PropTypes.bool,
		selectableRowsOnClick: PropTypes.bool,
		selectToolbarPlacement: PropTypes.oneOf(['replace', 'above', 'none']),
		serverSide: PropTypes.bool,
		setFilterChipProps: PropTypes.func,
		setRowProps: PropTypes.func,
		setTableProps: PropTypes.func,
		sort: PropTypes.bool,
		sortFilterList: PropTypes.bool,
		sortOrder: PropTypes.shape({
			name: PropTypes.string,
			direction: PropTypes.oneOf(['asc', 'desc'])
		}),
		tableId: PropTypes.string,
		tableBodyHeight: PropTypes.string,
		tableBodyMaxHeight: PropTypes.string,
		textLabels: PropTypes.object,
		viewColumns: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['disabled'])])
	}).isRequired
};
