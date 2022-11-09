import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { IconButton, Paper, makeStyles } from '@material-ui/core';
import { Delete as DeleteIcon, Edit as EditIcon } from '@material-ui/icons';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import { modalPromise } from 'app/common/ModalPromise';
import { ModalDoctor } from 'app/features/doctor/components';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { Button, DataTable, TextField } from '../../../../bizKITUi';
import { useToolbarTitle, useDebouncedFilterForm, useConfirm, useAlert } from '../../../../hooks';
import { ModalUser } from '../ModalUser';
import { employeesService, ENTITY, ENTITY_DEPS } from '../../../../services';
import { getFullName } from '../../../../utils';

const defaultValues = {
	search: null,
	limit: 10,
	offset: 0
};

const useStyles = makeStyles(theme => ({
	form: {
		display: 'flex',
		justifyContent: 'space-between',
		[theme.breakpoints.down(769)]: {
			flexWrap: 'wrap'
		}
	},
	searchItem: {
		width: 600,
		[theme.breakpoints.down(769)]: {
			width: '100%'
		}
	}
}));

export function ListDoctors() {
	const queryClient = useQueryClient();
	const { alertSuccess, alertError } = useAlert();
	const classes = useStyles();
	const [openModalConfirm] = useConfirm();

	const [isShowModalUser, setIsShowModalUser] = useState(false);

	const theme = useTheme();
	const screenDown = useMediaQuery(theme.breakpoints.down(1100));

	const getBtns = () => {
		return (
			<div className="flex gap-10">
				<Button textNormal onClick={() => setIsShowModalUser(true)}>
					Добавить пользователя
				</Button>
				<Button
					onClick={() => modalPromise.open(({ onClose }) => <ModalDoctor isOpen onClose={onClose} />)}
					textNormal
				>
					Добавить врача
				</Button>
			</div>
		);
	};

	useToolbarTitle({
		name: 'Пользователи',
		content: !screenDown && getBtns()
	});

	const [page, setPage] = useState(0);
	const [limit, setLimit] = useState(10);

	const { form, debouncedForm, handleChange, resetForm } = useDebouncedFilterForm(defaultValues);

	const handleOnResetFilter = () => {
		resetForm();
	};

	const { isLoading, isError, data } = useQuery([ENTITY.DOCTOR, debouncedForm], () => {
		return employeesService.getDoctors(debouncedForm).then(res => res.data);
	});

	const deleteDoctor = useMutation(uuid => employeesService.deleteDoctor(uuid));
	const handleOnDeleteItem = index => {
		const { uuid } = data.results[index];
		deleteDoctor
			.mutateAsync(uuid)
			.then(() => {
				alertSuccess('Пользователь успешно удалён');
				ENTITY_DEPS.DOCTOR.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				// refetch();
			})
			.catch(() => {
				alertError('Не удалось удалить пользователя');
			});
	};

	const columns = [
		{
			name: 'fio',
			label: 'Фамилия Имя',
			options: {
				customBodyRenderLite: dataIndex => {
					const currentItem = data.results[dataIndex];
					return getFullName(currentItem);
				}
			}
		},
		{
			name: 'email',
			label: 'Email',
			options: {
				customBodyRenderLite: dataIndex => {
					const { email } = data.results[dataIndex];
					return email ?? '—';
				}
			}
		},
		{
			name: 'group',
			label: 'Права доступа',
			options: {
				customBodyRenderLite: dataIndex => {
					const { groups } = data.results[dataIndex];
					return groups?.map(item => item.name).join(', ') || '—';
				}
			}
		},
		{
			name: 'actions',
			label: 'Действия',
			options: {
				setCellHeaderProps: () => ({ style: { textAlign: 'right' } }),
				customBodyRenderLite: dataIndex => {
					const doctorUuid = data.results[dataIndex]?.user?.uuid;
					const editUrl = `/settings/users/${doctorUuid}/edit`;
					return (
						<div className="flex justify-end">
							<IconButton aria-label="Редактировать пользователя" component={Link} to={editUrl}>
								<EditIcon />
							</IconButton>
							<IconButton
								aria-label="Удалить пользователя"
								onClick={() =>
									openModalConfirm({
										title: 'Удалить пользователя?',
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
		serverSide: true,
		rowsPerPage: limit,
		page,
		count: data?.count ?? 0,
		onChangePage: newPage => setPage(newPage),
		onChangeRowsPerPage: newLimit => setLimit(newLimit)
	};

	return (
		<>
			<div className="flex mb-20 gap-10">{screenDown && getBtns()}</div>
			<Paper className="p-12 mb-32">
				<form className={`gap-10 ${classes.form}`}>
					<TextField
						label="Поиск по имени"
						type="text"
						variant="outlined"
						size="small"
						name="search"
						fullWidth
						className={classes.searchItem}
						value={form.search}
						onChange={handleChange}
					/>
					<div>
						<Button textNormal color="primary" variant="outlined" onClick={handleOnResetFilter}>
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
				<>
					<DataTable data={data.results} columns={columns} options={tableOptions} />
				</>
			)}

			{isShowModalUser && <ModalUser isOpen onClose={() => setIsShowModalUser(false)} />}
		</>
	);
}
