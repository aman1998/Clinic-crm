import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, DataTable, ServerAutocomplete } from 'app/bizKITUi';
import { IconButton } from '@material-ui/core';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@material-ui/icons';
import { getFullName, getShortName } from 'app/utils';
import { clinicService, employeesService } from 'app/services';
import { TYPE_SERVICE_COMMON, TYPE_SERVICE_OPERATION } from 'app/services/clinic/constants';
import { useConfirm, useStateForm } from '../../../../hooks';

export function FormServices({ services, onChange }) {
	const [openModalConfirm] = useConfirm();

	const [editIndex, setEditIndex] = useState(null);

	const { form, setInForm, resetForm } = useStateForm({
		doctor: null,
		service: null
	});

	const handleOnSetEdit = index => {
		setEditIndex(index);

		const currentService = services[index];

		setInForm('service', currentService);
		setInForm('doctor', currentService.doctor);
	};

	const handleOnDelete = index => {
		const newServices = [...services];

		newServices.splice(index, 1);

		onChange(newServices);
	};

	const handleOnAddService = event => {
		event.preventDefault();

		const newService = { ...form.service, doctor: form.doctor };

		if (editIndex === null) {
			onChange([...services, newService]);
		} else {
			const prevServices = [...services];

			prevServices[editIndex] = newService;
			setEditIndex(null);

			onChange(prevServices);
		}

		resetForm();
	};

	const isDisableAdd = !form.service || !form.doctor;
	const isEditMode = editIndex !== null;

	const columns = [
		{
			name: 'doctor',
			label: 'Врач',
			options: {
				customBodyRenderLite: dataIndex => {
					const { doctor } = services[dataIndex];

					return getShortName(doctor);
				}
			}
		},
		{
			name: 'service',
			label: 'Услуга',
			options: {
				customBodyRenderLite: dataIndex => {
					const { name } = services[dataIndex];

					return name;
				}
			}
		},
		{
			name: 'actions',
			label: 'Действие',
			options: {
				setCellHeaderProps: () => ({ style: { textAlign: 'right' } }),
				customBodyRenderLite: dataIndex => {
					return (
						<div className="flex justify-end">
							<IconButton
								aria-label="Редактировать услугу"
								disabled={isEditMode}
								onClick={() => handleOnSetEdit(dataIndex)}
							>
								<EditIcon />
							</IconButton>

							<IconButton
								aria-label="Удалить услугу"
								disabled={isEditMode}
								onClick={() =>
									openModalConfirm({
										title: 'Удалить услугу?',
										onSuccess: () => handleOnDelete(dataIndex)
									})
								}
							>
								<DeleteIcon />
							</IconButton>
						</div>
					);
				}
			}
		}
	];

	const tableOptions = {
		elevation: 0,
		pagination: false,
		responsive: 'standard'
	};

	const filterServices = service => service.type === TYPE_SERVICE_OPERATION || service.type === TYPE_SERVICE_COMMON;

	return (
		<>
			<form className="sm3:flex" onSubmit={handleOnAddService}>
				<ServerAutocomplete
					className="mr-16"
					label="Врач"
					fullWidth
					value={form.doctor}
					getOptionLabel={option => getFullName(option)}
					onFetchList={(search, limit) =>
						employeesService.getDoctors({ search, limit }).then(({ data }) => data)
					}
					onFetchItem={uuid => employeesService.getDoctor(uuid).then(({ data }) => data)}
					onChange={value => {
						setInForm('doctor', value);
						setInForm('service', null);
					}}
				/>
				<ServerAutocomplete
					className="mr-16 mt-10 mb-10 sm3:m-0"
					label="Услуга"
					fullWidth
					value={form.service}
					readOnly={!form.doctor}
					getOptionLabel={option => option && option.name}
					onFetchList={search =>
						clinicService
							.getServices({ doctor: form.doctor?.uuid, search })
							.then(({ data }) => data?.results?.filter(filterServices))
					}
					onFetchItem={uuid => clinicService.getServiceById(uuid).then(({ data }) => data)}
					onChange={value => {
						setInForm('service', value);
					}}
				/>
				<Button
					color="primary"
					aria-label={isEditMode ? 'Сохранить услугу' : 'Добавить услугу'}
					disabled={isDisableAdd}
					type="submit"
				>
					{isEditMode ? <EditIcon /> : <AddIcon />}
				</Button>
			</form>
			<div className="mt-20">
				<DataTable columns={columns} options={tableOptions} data={services} />
			</div>
		</>
	);
}

FormServices.propTypes = {
	services: PropTypes.arrayOf(
		PropTypes.shape({
			uuid: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
			doctor: PropTypes.shape({
				uuid: PropTypes.string.isRequired,
				last_name: PropTypes.string.isRequired,
				first_name: PropTypes.string.isRequired,
				middle_name: PropTypes.string.isRequired
			})
		}).isRequired
	).isRequired,
	onChange: PropTypes.func.isRequired
};
