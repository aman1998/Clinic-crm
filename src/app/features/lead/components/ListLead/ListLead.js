import React, { useEffect, useContext, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useHistory } from 'react-router';
import { makeStyles, Paper } from '@material-ui/core';
import FuseLoading from '@fuse/core/FuseLoading';
import { leadsServices } from 'app/services/leads';
import { ModalLeadStage } from 'app/common/ModalLeadStage';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { Button, DatePickerField, ServerAutocomplete, TextField } from '../../../../bizKITUi';
import { employeesService, ENTITY } from '../../../../services';
import { useAlert, useDebouncedFilterForm } from '../../../../hooks';
import { getFullName } from '../../../../utils';
import { TYPE_SERVICE_HOSPITAL } from '../../../../services/clinic/constants';
import { ContextMenu } from '../../pages/Leads';
import { LeadInfoContainer } from '../LeadInfoContainer';
import { STATUS } from '../constants';

const defaultValues = {
	doctor_fio: null,
	created_at: new Date(),
	patient: '',
	status: '',
	offset: 0,
	limit: 10
};

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: '185px 185px 140px 140px 1fr',
		[theme.breakpoints.down(1379)]: {
			gridTemplateColumns: '170px 2fr 1fr 1fr'
		},
		[theme.breakpoints.down(767)]: {
			gridTemplateColumns: '1fr'
		}
	},
	formBtn: {
		display: 'flex',
		justifyContent: 'flex-end',
		marginLeft: 'auto',
		[theme.breakpoints.down(1379)]: {
			margin: '0',
			justifyContent: 'flex-start'
		}
	}
}));

export function ListLead() {
	const [leadsTableData, setLeadsTableData] = useState([]);
	const [currentCard, setCurrentCard] = useState(null);
	const [currentBoard, setCurrentBoard] = useState(null);
	const { alertSuccess, alertError } = useAlert();
	const history = useHistory();

	const { isLoading, isError, data, refetch } = useQuery([ENTITY.LEADS_TABLE], () => leadsServices.getLeadsTable());
	const classes = useStyles();
	const { form, handleChange, setInForm, resetForm } = useDebouncedFilterForm(defaultValues);

	const [isStageModalOpen, setIsStageModalOpen] = useState(false);

	const handleOnResetFilter = () => {
		resetForm();
	};

	const dragStartHandler = (e, card, board) => {
		setCurrentCard(card);
		setCurrentBoard(board);
	};

	const handleAddLead = () => {
		history.push(`leads/c3b901a7-11e7-4cb2-94b2-41efc000ab77/lead`);
	};

	const updateStage = useMutation(({ uuid, payload }) => leadsServices.patchLeadsTable(uuid, payload));
	const dropHandler = dropboard => {
		const currentBoardInData = leadsTableData[leadsTableData.indexOf(currentBoard)];

		currentBoardInData.leads.splice(currentBoardInData.leads.indexOf(currentCard), 1);

		const newStatus = Object.entries(STATUS)
			.map(status => {
				if (status[1] === dropboard.name) {
					return status[0];
				}
				return undefined;
			})
			.filter(status => !!status);

		const newCard = {
			...currentCard,
			stage: dropboard.uuid,
			status: newStatus[0] && newStatus[0]
		};

		const payload = {
			...newCard,
			responsible_user: currentCard.responsible_user.uuid
		};

		leadsTableData[leadsTableData.indexOf(dropboard)].leads.unshift(newCard);
		setLeadsTableData(leadsTableData);
		setCurrentCard(null);
		setCurrentBoard(null);

		updateStage.mutateAsync({ uuid: currentCard.uuid, payload });
	};

	// CREATE STAGE
	const createStage = useMutation(payload => leadsServices.createStage(payload));
	const handleOnCreateStage = (values, clearErrors, onClose, setError) => {
		clearErrors();

		const payload = {
			name: values.name,
			order_number: leadsTableData.length + 1
		};

		createStage
			.mutateAsync(payload)
			.then(() => {
				onClose();
				alertSuccess('Этап успешно создан');
				refetch();
			})
			// .then(() => {
			// 	ENTITY_DEPS.RESERVE.forEach(dep => {
			// 		queryClient.invalidateQueries(dep);
			// 	});
			.catch(error => {
				error.fieldErrors.forEach(item => {
					setError(item.field, { message: item.message });
				});
				alertError('Не удалось создать этап');
			});
	};
	const handleOnSubmitCreateStage = (e, values, clearErrors, onClose, setError) => {
		e.preventDefault();
		handleOnCreateStage(values, clearErrors, onClose, setError);
	};
	// END OF CREATE STAGE

	useEffect(() => {
		if (!data) {
			return;
		}

		setLeadsTableData(data.sort((a, b) => a.order_number - b.order_number));
	}, [data]);

	const setMenu = useContext(ContextMenu);

	useEffect(() => {
		setMenu(
			<div className="flex">
				<Button textNormal className="whitespace-no-wrap ml-10" onClick={handleAddLead}>
					Добавить лид
				</Button>
			</div>
		);
		return () => setMenu(null);
	}, [setMenu]);

	return (
		<>
			<Paper className="p-12 mb-32">
				<form className={`gap-10 ${classes.form}`}>
					<TextField
						label="Поиск по Ф.И.О"
						type="text"
						variant="outlined"
						size="small"
						name="patient"
						value={form.patient}
						onChange={handleChange}
					/>
					<ServerAutocomplete
						getOptionLabel={option => getFullName(option)}
						label="Ответственный"
						value={form.doctor}
						InputProps={{ size: 'small' }}
						onChange={value => setInForm('doctor', value?.uuid ?? null)}
						onFetchList={(search, limit) =>
							employeesService
								.getDoctors({
									search,
									limit,
									service_type: TYPE_SERVICE_HOSPITAL
								})
								.then(res => res.data)
						}
						onFetchItem={uuid => employeesService.getDoctor(uuid).then(res => res.data)}
					/>
					<DatePickerField
						label="Дата от"
						inputVariant="outlined"
						size="small"
						fullWidth
						onlyValid
						value={form.created_at}
						onChange={date => setInForm('created_at', date)}
					/>

					<DatePickerField
						label="Дата до"
						inputVariant="outlined"
						size="small"
						fullWidth
						onlyValid
						value={form.created_at}
						onChange={date => setInForm('created_at', date)}
					/>

					<div className={classes.formBtn}>
						<Button className="mr-6" textNormal color="primary" onClick={handleOnResetFilter}>
							Применить
						</Button>
						<Button
							className="mr-6"
							textNormal
							color="primary"
							variant="outlined"
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
				<>
					{/* <DataTable data={data} columns={columns} options={tableOptions} /> */}
					<LeadInfoContainer
						leadsTableData={leadsTableData}
						dragStartHandler={dragStartHandler}
						dropHandler={dropHandler}
						setIsStageModalOpen={setIsStageModalOpen}
					/>
				</>
			)}

			{isStageModalOpen && (
				<ModalLeadStage
					isOpen
					onClose={() => setIsStageModalOpen(false)}
					handleOnSubmit={handleOnSubmitCreateStage}
				/>
			)}
		</>
	);
}
