import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import {
	FormHelperText,
	makeStyles,
	Card,
	CardHeader,
	CardContent,
	Divider,
	Table,
	TableCell,
	TableRow,
	TableHead,
	TableBody
} from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';
import PropTypes from 'prop-types';
import { Accordion, Button, ServerAutocomplete } from 'app/bizKITUi';
import { useStateForm, useAlert } from 'app/hooks';
import { clinicService, documentsService, ENTITY_DEPS } from 'app/services';
import CheckIcon from '@material-ui/icons/Check';

const useStyles = makeStyles(theme => ({
	cardHeader: {
		'& .MuiCardHeader-action': {
			margin: 0
		}
	},
	btn: {
		display: 'flex',
		marginLeft: 'auto',
		width: '64px',
		[theme.breakpoints.down(768)]: {
			margin: '0'
		}
	}
}));

const defaultValues = {
	service: null
};

export function DocumentTemplateServices({ initialList, documentTemplateUuid }) {
	const queryClient = useQueryClient();
	const classes = useStyles();
	const [servicesDataTable, setServicesDataTable] = useState([]);

	const { alertSuccess, alertError } = useAlert();
	const { form, setInForm } = useStateForm(defaultValues);

	useEffect(() => {
		setServicesDataTable({
			...servicesDataTable,
			custom_fields: initialList.custom_fields || [],
			services: initialList.services || []
		});
		/* eslint-disable */
	}, []);
	/* eslint-enable */

	const [errorMessage, setErrorMessage] = useState('');
	useEffect(() => {
		setErrorMessage('');
	}, [form.service, form.count]);

	const updateDocument = useMutation(({ uuid, payload }) => documentsService.patchDocumentTemplate(uuid, payload));
	const updateDocumentTemplate = () => {
		const payload = {
			services: servicesDataTable.services
		};

		updateDocument
			.mutateAsync({ uuid: documentTemplateUuid, payload })
			.then(() => {
				ENTITY_DEPS.DOCUMENT_TEMPLATE.forEach(dep => {
					queryClient.invalidateQueries(dep);
				});
				alertSuccess('Документ успешно обновлен');
			})
			.catch(() => {
				alertError('Не удалось обновить документ');
			});
	};

	const refreshState = () => {
		setInForm('service', null);
	};

	const handleOnAddInList = () => {
		const serviceUuid = form.service.uuid;
		const hasInProductList = servicesDataTable.services.some(item => item === serviceUuid);

		if (hasInProductList) {
			setErrorMessage('Услуга уже добавлена в таблицу');

			return;
		}

		const newItem = {
			custom_fields: [
				...servicesDataTable.custom_fields,
				{ section: form.service.name, fields: form.service.custom_fields?.sections[0].fields }
			],
			services: [...servicesDataTable.services, form.service.uuid]
		};

		refreshState();
		setServicesDataTable(newItem);
	};

	const isDisabledAddButton = !form.service || !!errorMessage;

	return (
		<Card>
			<CardHeader
				title="Услуги"
				className={classes.cardHeader}
				onClick={updateDocumentTemplate}
				action={
					<Button textNormal size="small" variant="text" color="primary" startIcon={<CheckIcon />}>
						Сохранить
					</Button>
				}
			/>
			<Divider />
			<CardContent>
				<div className="flex gap-10">
					<ServerAutocomplete
						getOptionLabel={option => option.name}
						label="Услуга"
						variant="outlined"
						fullWidth
						onChange={value => setInForm('service', value ?? null)}
						value={form.service}
						onFetchList={name => clinicService.getServices({ name }).then(res => res.data.results)}
						onFetchItem={fetchUuid => clinicService.getServiceById(fetchUuid).then(res => res.data)}
					/>
					<Button
						className={classes.btn}
						color="primary"
						aria-label="Добавить в таблицу"
						disabled={isDisabledAddButton}
						onClick={handleOnAddInList}
					>
						<AddIcon />
					</Button>
				</div>
				<FormHelperText error>{errorMessage}</FormHelperText>

				<div className="mt-20">
					{servicesDataTable.custom_fields &&
						servicesDataTable.custom_fields.map(custom_field => (
							<Accordion
								key={custom_field.section}
								title={custom_field.section}
								expansionPanelSummary={false}
							>
								<Table className="mb-10" size="small" aria-label="a dense table">
									<TableHead>
										<TableRow>
											<TableCell>Название</TableCell>
											<TableCell>Ключ</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{custom_field.fields ? (
											custom_field.fields.map(dataBody => (
												<TableRow key={dataBody.key}>
													<TableCell>{dataBody.verbose_name}</TableCell>
													<TableCell>{`{{ ${dataBody.key} }}`}</TableCell>
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell className="text-center" colSpan={2}>
													Нет ключей
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</Accordion>
						))}
				</div>
			</CardContent>
		</Card>
	);
}

DocumentTemplateServices.propTypes = {
	documentTemplateUuid: PropTypes.string.isRequired,
	initialList: PropTypes.arrayOf(PropTypes.string).isRequired
};
