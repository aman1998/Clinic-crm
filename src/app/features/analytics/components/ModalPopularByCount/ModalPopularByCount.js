import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import { DataTable, DrawerTemplate } from '../../../../bizKITUi';

export function ModalPopularByCount({ isOpen, onClose, title, list }) {
	const columns = [
		{
			name: 'name',
			label: 'Наименование'
		},
		{
			name: 'count',
			label: 'Количество',
			options: {
				customBodyRenderLite: dataIndex => {
					return list[dataIndex].count ?? 0;
				}
			}
		}
	];
	const tableOptions = {
		elevation: 0
	};

	return (
		<DrawerTemplate
			isOpen={isOpen}
			close={onClose}
			contentPadding={false}
			header={
				<Typography color="secondary" className="text-xl font-bold text-center">
					{title}
				</Typography>
			}
			width="sm"
			content={<DataTable className="m-0" columns={columns} options={tableOptions} data={list} />}
		/>
	);
}
ModalPopularByCount.propTypes = {
	title: PropTypes.string.isRequired,
	list: PropTypes.arrayOf(
		PropTypes.shape({
			name: PropTypes.string,
			count: PropTypes.number
		})
	).isRequired,
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired
};
