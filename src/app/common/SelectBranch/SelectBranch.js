import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { MenuItem, TextField } from '../../bizKITUi';
import { companiesService, ENTITY } from '../../services';

export function SelectBranch() {
	const [value, setValue] = useState('');

	const changeBranch = branchUuid => {
		setValue(branchUuid);
		localStorage.setItem('branch', branchUuid);
	};

	const { data } = useQuery(
		[ENTITY.COMPANY_BRANCH, { limit: Number.MAX_SAFE_INTEGER }],
		({ queryKey }) => companiesService.getCompaniesBranches(queryKey[1]),
		{
			retry: true,
			onSuccess: response => {
				const selectedBranch = localStorage.getItem('branch') ?? response.results[0].uuid;

				changeBranch(selectedBranch);
			}
		}
	);

	const handleOnChange = event => {
		changeBranch(event.target.value);
		window.location.reload();
	};

	return (
		<TextField
			select
			value={value}
			variant="outlined"
			size="small"
			label="Филиал"
			style={{ width: 150 }}
			onChange={handleOnChange}
		>
			<MenuItem value="" disabled />
			{data?.results.map(branch => (
				<MenuItem key={branch.uuid} value={branch.uuid}>
					{branch.name}
				</MenuItem>
			))}
		</TextField>
	);
}
