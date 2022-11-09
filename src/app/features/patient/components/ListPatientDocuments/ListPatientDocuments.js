import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import moment from 'moment';
import { useQuery } from 'react-query';
import { IconButton } from '@material-ui/core';
import { RemoveRedEye } from '@material-ui/icons';
import { TextField, DataTable, Button, DatePickerField, ServerAutocomplete, Amount } from '../../../../bizKITUi';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { useDebouncedFilterForm, usePermissions } from '../../../../hooks';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { getFullName } from '../../../../utils';
import { clinicService, documentsService, ENTITY } from '../../../../services';
import { modalPromise } from '../../../../common/ModalPromise';
import { ModalDocumentContract } from '../../../../common/ModalDocumentContract';
import { PERMISSION } from '../../../../services/auth/constants';

export function ListPatientDocuments({ patientsUuid }) {
	const { hasPermission } = usePermissions();
	const { form, debouncedForm, setInForm, resetForm, setPage, getPage, handleChange } = useDebouncedFilterForm({
		patient: patientsUuid,
		name: '',
		date_to: null,
		date_from: null,
		service: null,
		offset: 0,
		limit: 10
	});

	const { isLoading, isError, data } = useQuery([ENTITY.DOCUMENT_CONTRACT, debouncedForm], ({ queryKey }) =>
		documentsService.getContractDocuments(queryKey[1])
	);

	const handleOnResetFilter = () => {
		resetForm();
	};

	const columns = useMemo(
		() => [
			{
				name: 'name',
				label: 'Наименование'
			},
			{
				name: 'date',
				label: 'Дата',
				options: {
					customBodyRender: value => {
						return value ? moment(value).format('DD.MM.YYYY') : '';
					}
				}
			},
			{
				name: 'service',
				label: 'Услуга',
				options: {
					customBodyRenderLite: dataIndex => {
						const currentItem = data.results[dataIndex];

						return currentItem?.service?.name;
					}
				}
			},
			{
				name: 'doctor',
				label: 'Врач',
				options: {
					customBodyRenderLite: dataIndex => {
						const { service } = data.results[dataIndex];

						return getFullName(service?.doctor ?? {});
					}
				}
			},
			{
				name: 'total_cost',
				label: 'Сумма',
				options: {
					customBodyRender: value => {
						return <Amount value={value} />;
					}
				}
			},
			{
				name: '',
				label: 'Действия',
				options: {
					customBodyRenderLite: () => {
						return (
							<IconButton className="flex justify-end">
								<RemoveRedEye />
							</IconButton>
						);
					}
				}
			}
		],
		[data]
	);

	const tableOptions = {
		serverSide: true,
		rowsPerPage: form.limit,
		page: getPage(),
		count: data?.count ?? 0,
		onRowClick: (_, rowMeta) => {
			if (hasPermission(PERMISSION.DOCUMENTS.VIEW_DOCUMENT_CONTRACT)) {
				const { uuid } = data.results[rowMeta.dataIndex];
				modalPromise.open(({ onClose }) => (
					<ModalDocumentContract documentUuid={uuid} onClose={onClose} isOpen />
				));
			}
		},
		onChangePage: page => setPage(page),
		onChangeRowsPerPage: limit => setInForm('limit', limit)
	};

	return (
		<>
			<Paper className="p-12 mb-32">
				<form className="grid grid-cols-1 md:grid-cols-5 gap-16">
					<TextField
						label="Наименование"
						size="small"
						name="name"
						variant="outlined"
						value={form.name}
						onChange={handleChange}
					/>
					<ServerAutocomplete
						getOptionLabel={option => option.name}
						label="Услуга"
						onChange={value => setInForm('service', value?.uuid ?? null)}
						value={form.service}
						InputProps={{
							size: 'small'
						}}
						onFetchList={name =>
							clinicService.getServices({ name, limit: 10 }).then(res => res.data.results)
						}
						onFetchItem={fetchUuid => clinicService.getServiceById(fetchUuid).then(res => res.data)}
					/>
					<DatePickerField
						label="Дата от"
						inputVariant="outlined"
						size="small"
						onlyValid
						value={form.date_from}
						onChange={date => setInForm('date_from', date)}
					/>
					<DatePickerField
						label="Дата до"
						inputVariant="outlined"
						size="small"
						onlyValid
						value={form.date_to}
						onChange={date => setInForm('date_to', date)}
					/>

					<div className="flex justify-end ml-auto">
						<Button
							textNormal
							color="primary"
							variant="outlined"
							className="ml-16"
							onClick={handleOnResetFilter}
						>
							Сбросить
						</Button>
					</div>
				</form>
			</Paper>

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
ListPatientDocuments.propTypes = {
	patientsUuid: PropTypes.string.isRequired
};
