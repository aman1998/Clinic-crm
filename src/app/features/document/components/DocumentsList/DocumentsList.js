import React from 'react';
import { useQuery } from 'react-query';
import moment from 'moment';
import { IconButton, Paper, TextField } from '@material-ui/core';
import { RemoveRedEye } from '@material-ui/icons';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { Amount, Button, DataTable, DatePickerField, ServerAutocomplete } from '../../../../bizKITUi';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { useDebouncedFilterForm, usePermissions } from '../../../../hooks';
import { clinicService, documentsService, ENTITY, patientsService } from '../../../../services';
import { getFullName } from '../../../../utils';
import { OptionPatient } from '../../../../common/OptionPatient';
import { ModalDocumentContract } from '../../../../common/ModalDocumentContract';
import { PERMISSION } from '../../../../services/auth/constants';
import { modalPromise } from '../../../../common/ModalPromise';

const defaultValues = {
	patient: null,
	name: '',
	date_to: null,
	date_from: null,
	service: null,
	offset: 0,
	limit: 10
};

export function DocumentsList() {
	const { hasPermission } = usePermissions();

	const { form, debouncedForm, getPage, setPage, setInForm, resetForm, handleChange } = useDebouncedFilterForm(
		defaultValues
	);

	const { isLoading, isError, data } = useQuery([ENTITY.DOCUMENT_CONTRACT, debouncedForm], ({ queryKey }) =>
		documentsService.getContractDocuments(queryKey[1])
	);

	const columns = [
		{
			name: 'name',
			label: 'Наименование'
		},
		{
			name: 'date',
			label: 'Дата',
			options: {
				customBodyRender: value => {
					return value ? moment(value).format('DD.MM.YYYY') : '—';
				}
			}
		},
		{
			name: 'service',
			label: 'Услуга',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];

					return currentItem?.service?.name ?? '—';
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
			name: 'patient',
			label: 'Пациент',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];

					return getFullName(currentItem?.patient ?? {});
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
	];

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
				<form className="grid grid-cols-1 md:grid-cols-6 gap-16">
					<TextField
						label="Наименование"
						size="small"
						name="name"
						variant="outlined"
						value={form.name}
						onChange={handleChange}
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
					<ServerAutocomplete
						getOptionLabel={option => getFullName(option)}
						value={form.patient}
						onChange={value => setInForm('patient', value?.uuid ?? null)}
						fullWidth
						label="Пациент"
						InputProps={{
							size: 'small'
						}}
						renderOption={option => <OptionPatient patient={option} />}
						onFetchList={search =>
							patientsService.getPatients({ search, limit: 10 }).then(res => res.data.results)
						}
						onFetchItem={fetchUuid => patientsService.getPatientByUuid(fetchUuid).then(res => res.data)}
					/>

					<div className="flex justify-end ml-auto">
						<Button
							textNormal
							color="primary"
							variant="outlined"
							className="ml-16"
							onClick={() => resetForm()}
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
				<DataTable columns={columns} options={tableOptions} data={data.results} />
			)}
		</>
	);
}
