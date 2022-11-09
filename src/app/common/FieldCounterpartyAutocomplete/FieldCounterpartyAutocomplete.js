import React from 'react';
import PropTypes from 'prop-types';
import { ServerAutocomplete } from '../../bizKITUi';
import {
	COUNTERPARTY_TYPE_DOCTOR,
	COUNTERPARTY_TYPE_MONEY_ACCOUNT,
	COUNTERPARTY_TYPE_PARTNER,
	COUNTERPARTY_TYPE_PATIENT,
	COUNTERPARTY_TYPE_PERSONAL
} from '../../services/globalFinance/constants';
import { getFullName } from '../../utils';
import { OptionPatient } from '../OptionPatient';
import { companiesService, employeesService, patientsService } from '../../services';
import { ErrorMessage } from '../ErrorMessage';

export function FieldCounterpartyAutocomplete({ type, ...rest }) {
	switch (type) {
		case COUNTERPARTY_TYPE_DOCTOR:
			return (
				<ServerAutocomplete
					{...rest}
					getOptionLabel={option => getFullName(option)}
					onFetchList={(search, limit) =>
						employeesService.getDoctors({ search, limit }).then(res => res.data)
					}
					onFetchItem={uuid => employeesService.getDoctor(uuid).then(res => res.data)}
				/>
			);
		case COUNTERPARTY_TYPE_PARTNER:
			return (
				<ServerAutocomplete
					{...rest}
					getOptionLabel={option => option.name}
					onFetchList={(search, limit) =>
						companiesService.getPartnersCompanies({ search, limit }).then(({ data }) => data)
					}
					onFetchItem={uuid => companiesService.getPartnerCompany(uuid)}
				/>
			);
		case COUNTERPARTY_TYPE_PATIENT:
			return (
				<ServerAutocomplete
					{...rest}
					getOptionLabel={option => getFullName(option)}
					renderOption={option => <OptionPatient patient={option} />}
					onFetchList={(search, limit) =>
						patientsService.getPatients({ search, limit }).then(({ data }) => data)
					}
					onFetchItem={uuid => patientsService.getPatientByUuid(uuid).then(({ data }) => data)}
				/>
			);
		case COUNTERPARTY_TYPE_PERSONAL:
			return (
				<ServerAutocomplete
					{...rest}
					getOptionLabel={option => getFullName(option)}
					onFetchList={(search, limit) => employeesService.getPersonalList({ search, limit })}
					onFetchItem={uuid => employeesService.getPersonal(uuid)}
				/>
			);
		case COUNTERPARTY_TYPE_MONEY_ACCOUNT:
			return (
				<ServerAutocomplete
					{...rest}
					getOptionLabel={option => option.name}
					onFetchList={(name, limit) =>
						companiesService.getMoneyAccounts({ name, limit }).then(({ data }) => data)
					}
					onFetchItem={uuid => companiesService.getMoneyAccount(uuid)}
				/>
			);
		default:
			return <ErrorMessage message="Unsupported counterparty type" />;
	}
}
FieldCounterpartyAutocomplete.defaultProps = {};
FieldCounterpartyAutocomplete.propTypes = {
	type: PropTypes.string.isRequired
};
