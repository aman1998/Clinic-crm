import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Accordion, DatePickerField, TextField } from 'app/bizKITUi';
import { getFullName } from 'app/utils';
import { patientsService } from 'app/services';
import moment from 'moment';
import _ from '@lodash';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Paper } from '@material-ui/core';
import { FormDisplayCustomFields } from 'app/common/FormDisplayCustomFields';

const useStyles = makeStyles(() => ({
	accordionChildren: {
		marginTop: '20px',
		padding: '0 20px',
		paddingBottom: '20px',
		width: '100%'
	}
}));

export const Information = ({ data, handleOnChangeCustomFields }) => {
	const classes = useStyles();

	const patientAge = data?.patient.birth_date ? moment().diff(data?.patient.birth_date, 'year') : '';

	return (
		<Grid container spacing={2}>
			<Grid item md={6} xs={12}>
				<Paper>
					<Accordion
						title={<span className="text-dark-blue">Основная информация</span>}
						expansionPanelSummary={false}
						divider
						bottomCloseBtn
					>
						<Grid container spacing={2} className={classes.accordionChildren}>
							<Grid item sm={6} xs={12}>
								<TextField
									label="Услуга"
									variant="outlined"
									fullWidth
									value={data?.service?.name ?? ''}
									InputProps={{
										readOnly: true
									}}
								/>
							</Grid>
							<Grid item sm={6} xs={12}>
								<DatePickerField
									fullWidth
									label="Дата обращения"
									type="text"
									variant="outlined"
									readOnly
									value={data?.date_time ?? null}
								/>
							</Grid>
							<Grid item sm={6} xs={12}>
								<TextField
									label="Врач"
									variant="outlined"
									fullWidth
									value={getFullName(data?.service?.doctor) ?? ''}
									InputProps={{
										readOnly: true
									}}
								/>
								{/* <Controller
									control={control}
									name="directive"
									render={({ onChange, ...props }) => (
										<ServerAutocomplete
											{...props}
											getOptionLabel={option => getFullName(option)}
											label="Врач"
											readOnly
											InputProps={{
												error: !!errors.directive,
												helperText: errors.directive?.message
											}}
											onChange={value => onChange(value?.uuid ?? null)}
											onFetchList={search =>
												employeesService
													.getDoctors({
														search,
														limit: 10,
														service_type: TYPE_SERVICE_HOSPITAL
													})
													.then(res => res.data.results)
											}
											onFetchItem={fetchUuid =>
												employeesService.getDoctor(fetchUuid).then(res => res.data)
											}
										/>
									)} 
										/> */}
							</Grid>
							<Grid item sm={6} xs={12}>
								<TextField
									label="Сумма"
									variant="outlined"
									fullWidth
									value={data?.service?.cost ?? ''}
									InputProps={{
										readOnly: true
									}}
								/>
							</Grid>
						</Grid>
					</Accordion>
				</Paper>
			</Grid>
			<Grid item md={6} xs={12}>
				<Paper>
					<Accordion
						title={<span className="text-dark-blue"> Пациент</span>}
						expansionPanelSummary={false}
						divider
						bottomCloseBtn
					>
						<Grid container spacing={2} className={classes.accordionChildren}>
							<Grid item xs={12}>
								<TextField
									label="Ф.И.О пациента"
									variant="outlined"
									fullWidth
									value={data?.patient ? getFullName(data?.patient) : ''}
									InputProps={{
										readOnly: true
									}}
								/>
							</Grid>

							<Grid item xs={12}>
								<div className="grid sm:grid-cols-3 gap-12">
									<DatePickerField
										label="Дата рождения"
										variant="outlined"
										className="col-span-2"
										fullWidth
										value={data?.patient?.birth_date ?? null}
										readOnly
										InputProps={{
											readOnly: true
										}}
									/>

									<TextField
										label="Возраст"
										variant="outlined"
										fullWidth
										value={patientAge}
										InputProps={{
											readOnly: true
										}}
									/>
								</div>
							</Grid>

							<Grid item sm={6} xs={12}>
								<TextField
									label="Номер телефона"
									variant="outlined"
									fullWidth
									value={patientsService.getPatientMainPhone(data?.patient)}
									InputProps={{
										readOnly: true
									}}
								/>
							</Grid>

							<Grid item sm={6} xs={12}>
								<TextField
									label="Номер медицинской карты"
									variant="outlined"
									fullWidth
									value={data?.patient.medical_card ?? ''}
									InputProps={{
										readOnly: true
									}}
								/>
							</Grid>
						</Grid>
					</Accordion>
				</Paper>
			</Grid>
			{/* CUSTOM FIELDS */}
			{data?.custom_fields && (
				<FormDisplayCustomFields
					ContainerComponent={ContainerComponent}
					FieldsContainerComponent={({ children, fieldsLength }) => (
						<div className={`grid grid-cols-1 ${fieldsLength === 1 ? '' : 'sm:grid-cols-2 col-gap-20'}`}>
							{children}
						</div>
					)}
					showSectionTitle={false}
					fields={data?.custom_fields.sections}
					dateRangeClassName="grid gap-10 mt-20"
					onChangeData={handleOnChangeCustomFields}
					isReadOnly={false}
					fieldsFullWidth
				/>
			)}
		</Grid>
	);
};

function ContainerComponent({ children, sectionName }) {
	const classes = useStyles();
	const [isInitialExpanded, setIsInitialExpanded] = useState(false);

	return (
		<Grid item md={6} xs={12}>
			<Paper>
				<Accordion
					title={<span className="text-dark-blue"> {sectionName}</span>}
					expansionPanelSummary={false}
					setIsInitialExpanded={setIsInitialExpanded}
					isInitialExpanded={isInitialExpanded}
					divider
					bottomCloseBtn
				>
					<div className={`${classes.accordionChildren} mt-0`}>{children}</div>
				</Accordion>
			</Paper>
		</Grid>
	);
}

ContainerComponent.defaultProps = {
	sectionName: ''
};

ContainerComponent.propTypes = {
	children: PropTypes.node.isRequired,
	sectionName: PropTypes.string
};

Information.defaultProps = {
	handleOnChangeCustomFields: () => {}
};

Information.propTypes = {
	handleOnChangeCustomFields: PropTypes.func,
	data: PropTypes.shape({
		comment: PropTypes.string,
		completed: PropTypes.bool,
		created_at: PropTypes.string,
		custom_fields: PropTypes.shape({
			sections: PropTypes.arrayOf()
		}),
		date_time: PropTypes.string,
		medications: PropTypes.arrayOf(),
		patient: PropTypes.objectOf(),
		service: PropTypes.objectOf(),
		source: PropTypes.string,
		status: PropTypes.string,
		uuid: PropTypes.string
	}).isRequired
};
