import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '@material-ui/core';
import { Add as AddIcon, Delete as DeleteIcon } from '@material-ui/icons';
import { Button, DataTable, ServerAutocomplete } from 'app/bizKITUi';
import { useConfirm } from 'app/hooks';
import { authService } from 'app/services';

export function TableEmployees({ employees, onChange }) {
	const [selectedPerson, setSelectedPerson] = useState(null);
	const [group, setGroup] = useState([]);

	const [openModalConfirm] = useConfirm();

	const percentPerEmployee = Math.floor(100 / group.length);

	const handleOnDeleteItem = index => {
		const newGroup = [...group];
		newGroup.splice(index, 1);
		setGroup(newGroup);
		// FOR api to turn array to Arrayof uuid
		onChange(newGroup.map(person => person.uuid));
	};

	const columns = [
		{
			name: 'name',
			label: 'ФИО'
		},
		{
			name: 'role',
			label: 'Роль'
		},
		{
			name: 'action',
			label: 'Действия',
			options: {
				setCellHeaderProps: () => ({ style: { display: 'flex', justifyContent: 'flex-end' } }),
				customBodyRenderLite: dataIndex => {
					return (
						<div className="flex justify-end">
							<IconButton
								aria-label="Удалить из списка"
								onClick={() =>
									openModalConfirm({
										title: 'Удалить из списка?',
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

	const addToGroup = person => {
		const employeeUuid = selectedPerson?.uuid;

		onChange([...employees, employeeUuid]);

		const newPerson = { ...person, name: `${person.last_name} ${person.first_name}` };
		setGroup([...group, newPerson]);
	};

	return (
		<>
			<div>
				<div className="flex">
					<ServerAutocomplete
						value={selectedPerson}
						label="Сотрудник"
						name="employees"
						fullWidth
						getOptionLabel={option => `${option.last_name} ${option.first_name}`}
						onFetchList={name_vendor_code_manufacturer =>
							authService
								.getUsers({
									name_vendor_code_manufacturer,
									limit: 10
								})
								.then(data => data.results)
						}
						onChange={setSelectedPerson}
					/>
					<Button
						disabled={!selectedPerson || group.find(person => person.uuid === selectedPerson.uuid)}
						onClick={() => {
							addToGroup(selectedPerson);
							setSelectedPerson(null);
						}}
						aria-label="Добавить"
					>
						<AddIcon />
					</Button>
				</div>
			</div>

			<div className="mt-20">
				<DataTable columns={columns} options={tableOptions} data={group} />
				{group.length ? (
					<div className="mt-20">
						<div className="mb-10">
							<span className=" mr-52">Общее кол-во сотрудников в группе</span>
							<span>{group.length}</span>
						</div>
						<div className="mb-10">
							<span className=" mr-16">Процент от бонуса к каждому сотруднику</span>
							<span>{percentPerEmployee}%</span>
						</div>
					</div>
				) : (
					<></>
				)}
			</div>
		</>
	);
}

TableEmployees.defaultProps = {
	employees: [],
	onChange: () => {}
};
TableEmployees.propTypes = {
	employees: PropTypes.arrayOf(PropTypes.string),
	onChange: PropTypes.func
};
