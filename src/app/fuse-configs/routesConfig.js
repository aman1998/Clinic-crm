import FuseUtils from '@fuse/utils';
import LoginConfig from 'app/features/login/LoginConfig';
import LogoutConfig from 'app/features/logout/LogoutConfig';
import Error404PageConfig from 'app/features/error/404/Error404PageConfig';

import React from 'react';
import { Redirect } from 'react-router-dom';
import { FinanceConfigs } from '../features/finance/FinanceConfigs';
import { GlobalFinanceConfigs } from '../features/globalFinance/GlobalFinanceConfigs';
import { ReceptionConfigs } from '../features/reception/ReceptionConfigs';
import { WarehouseConfigs } from '../features/warehouse/WarehouseConfigs';
import { HospitalConfigs } from '../features/hospital/HospitalConfigs';
import { LaboratoryConfigs } from '../features/laboratory/LaboratoryConfigs';
import { PatientConfigs } from '../features/patient/PatientConfigs';
import { DoctorConfigs } from '../features/doctor/DoctorConfigs';
import { AnalyticsConfigs } from '../features/analytics/AnalyticsConfigs';
import { SettingsConfigs } from '../features/settings/SettingsConfig';
import { TasksConfigs } from '../features/tasks/TasksConfigs';
import { QualityControlConfig } from '../features/qualityControl/QualityControlConfig';
import { OperationConfigs } from '../features/operation/OperationConfigs';
import { DocumentConfigs } from '../features/document/DocumentConfig';
import { TreatmentConfigs } from '../features/treatment/TreatmentConfigs';
import { LeadConfigs } from '../features/lead/LeadConfigs';

const routeConfigs = [
	LogoutConfig,
	LoginConfig,
	Error404PageConfig,
	FinanceConfigs,
	GlobalFinanceConfigs,
	ReceptionConfigs,
	SettingsConfigs,
	WarehouseConfigs,
	HospitalConfigs,
	LaboratoryConfigs,
	PatientConfigs,
	DoctorConfigs,
	AnalyticsConfigs,
	TasksConfigs,
	QualityControlConfig,
	OperationConfigs,
	DocumentConfigs,
	TreatmentConfigs,
	LeadConfigs
];

const routes = [
	// if you want to make whole app auth protected by default change defaultAuth for example:
	// ...FuseUtils.generateRoutesFromConfigs(routeConfigs, ['admin','staff','user']),
	// The individual route configs which has auth option won't be overridden.
	...FuseUtils.generateRoutesFromConfigs(routeConfigs, ['user']),
	{
		component: () => <Redirect to="/error-404" />
	}
];

export default routes;
