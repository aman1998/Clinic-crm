import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormHelperText, IconButton } from '@material-ui/core';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';
import { Button, DataTable, ServerAutocomplete } from '../../../../bizKITUi';
import { getFullName, getShortName } from '../../../../utils';
import { useStateForm, useConfirm } from '../../../../hooks';
import { clinicService, employeesService } from '../../../../services';

export function TableServices({ services, onChange }) {
	const [openModalConfirm] = useConfirm();
	const { form, setInForm, resetForm } = useStateForm({
		doctor: null,
		service: null
	});

	const [editItemIndex, setEditItemIndex] = useState(null);
	const isEditItem = editItemIndex !== null;
	const handleEditItem = index => {
		setEditItemIndex(index);
		setInForm('doctor', services[index].doctor);
		setInForm('service', services[index]);
	};

	const [errorMessage, setErrorMessage] = useState('');

	const handleOnAddInList = () => {
		const serviceUuid = form.service.uuid;
		const hasInProductList = services.some(item => item.uuid === serviceUuid);

		if (hasInProductList) {
			setErrorMessage('Услуга уже добавлена в таблицу');

			return;
		}

		resetForm();
		setEditItemIndex(null);
		onChange([...services, form.service]);
	};

	const handleOnDeleteItem = index => {
		onChange(services.filter((_, idx) => idx !== index));
	};

	const handleChangeEditedItem = () => {
		const newList = services.slice();

		newList[editItemIndex] = form.service;
		resetForm();
		setEditItemIndex(null);
		onChange(newList);
	};

	const isDisabledAddButton = !form.doctor || !form.service || !!errorMessage;
	const isDisabledEditButton = !!errorMessage;

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
			label: 'Действия',
			options: {
				setCellHeaderProps: () => ({ style: { textAlign: 'right' } }),
				customBodyRenderLite: dataIndex => {
					return (
						<div className="flex justify-end">
							<IconButton
								aria-label="Редактировать услугу"
								disabled={isEditItem}
								onClick={() => handleEditItem(dataIndex)}
							>
								<EditIcon />
							</IconButton>
							<IconButton
								aria-label="Удалить услугу"
								disabled={isEditItem}
								edge="end"
								onClick={() =>
									openModalConfirm({
										title: 'Удалить услугу из таблицы?',
										onSuccess: () => handleOnDeleteItem(dataIndex)
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

	return (
		<>
			<div className="flex">
				<ServerAutocomplete
					value={form.doctor}
					getOptionLabel={option => getFullName(option)}
					label="Врач"
					fullWidth
					onChange={value => {
						setInForm('doctor', value);
						setInForm('service', null);
					}}
					onFetchList={(search, limit) =>
						employeesService
							.getDoctors({ search, limit, services: form.service?.uuid })
							.then(res => res.data)
					}
					onFetchItem={uuid => employeesService.getDoctor(uuid).then(res => res.data)}
				/>
				<ServerAutocomplete
					value={form.service}
					getOptionLabel={option => option.name}
					label="Услуга"
					readOnly={!form.doctor}
					fullWidth
					className="ml-16"
					onChange={value => {
						setInForm('service', value);
						setInForm('doctor', value?.doctor ?? null);
					}}
					onFetchList={(name, limit) =>
						clinicService.getServicesNested({ name, limit, doctor: form.doctor?.uuid })
					}
					onFetchItem={uuid => clinicService.getServiceById(uuid)}
				/>

				{isEditItem ? (
					<Button
						color="primary"
						aria-label="Редактировать"
						className="ml-16"
						disabled={isDisabledEditButton}
						onClick={handleChangeEditedItem}
					>
						<EditIcon />
					</Button>
				) : (
					<Button
						color="primary"
						aria-label="Добавить в таблицу"
						className="ml-16"
						disabled={isDisabledAddButton}
						onClick={handleOnAddInList}
					>
						<AddIcon />
					</Button>
				)}
			</div>
			<FormHelperText error>{errorMessage}</FormHelperText>

			<div className="mt-20">
				<DataTable columns={columns} options={tableOptions} data={services} />
			</div>
		</>
	);
}
TableServices.defaultProps = {
	onChange: () => {}
};
TableServices.propTypes = {
	services: PropTypes.arrayOf(
		PropTypes.shape({
			uuid: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
			doctor: PropTypes.shape({
				uuid: PropTypes.string.isRequired,
				first_name: PropTypes.string.isRequired,
				middle_name: PropTypes.string.isRequired,
				last_name: PropTypes.string.isRequired
			}).isRequired
		})
	).isRequired,
	onChange: PropTypes.func.isRequired
};
