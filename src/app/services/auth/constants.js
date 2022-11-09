export const PERMISSION = {
	ANALYTICS: {
		VIEW_MODULE: 'analytics.view_module',
		VIEW_RECEPTION: 'analytics.view_reception',
		VIEW_CLINIC: 'analytics.view_clinic',
		VIEW_HOSPITAL_STATIONARY: 'analytics.view_hospital_stationary',
		VIEW_LABORATORY: 'analytics.view_laboratory',
		VIEW_WAREHOUSES: 'analytics.view_warehouses'
	},
	SETTINGS: {
		VIEW_MODULE: 'settings.view_module'
	},
	EMPLOYEES: {
		VIEW_MODULE: 'employees.view_module',
		VIEW_PATIENT: 'employees.view_patient',
		VIEW_MEDICINES: 'employees.view_medicines',
		VIEW_RECEPTION: 'employees.view_reception',
		VIEW_DAILY_REPORT: 'employees.view_daily_report',
		VIEW_DETAIL_RECEPTION: 'employees.view_detail_reception',
		CHANGE_RECEPTION: 'employees.change_reception',
		VIEW_DOCTOR: 'employees.view_doctor',
		CHANGE_DOCTOR: 'employees.change_doctor',
		CONTROL_DOCTOR_WORK_SHIFT_MEDICATIONS: 'employees.control_expense_medications_doctor_work_shift',
		CONTROL_DOCTOR_WORK_SHIFT: 'employees.control_doctor_work_shift'
	},
	PATIENTS: {
		VIEW_MODULE: 'patients.view_module',
		VIEW_RECEPTION: 'patients.view_reception',
		VIEW_RESULTS: 'patients.view_results',
		VIEW_STATIONARY: 'patients.view_stationary',
		VIEW_PAYMENTS: 'patients.view_payments',
		VIEW_DETAIL_RECEPTION: 'patients.view_detail_reception',
		CHANGE_RECEPTION: 'patients.change_reception',
		VIEW_PATIENT: 'patients.view_patient',
		ADD_PATIENT: 'patients.add_patient',
		CHANGE_PATIENT: 'patients.change_patient',
		VIEW_DOCUMENTS: 'patients.view_paidservicescontracts',
		VIEW_TASKS: 'patients.view_tasks'
	},
	CLINIC: {
		VIEW_MODULE: 'clinic.view_module',
		VIEW_CALLS: 'clinic.view_calls',
		CAN_CALL: 'clinic.can_call',
		VIEW_SERVICE: 'clinic.view_service',
		ADD_SERVICE: 'clinic.add_service',
		CHANGE_SERVICE: 'clinic.change_service',
		DELETE_SERVICE: 'clinic.delete_service',
		VIEW_DIRECTION: 'clinic.view_direction',
		ADD_DIRECTION: 'clinic.add_direction',
		CHANGE_DIRECTION: 'clinic.change_direction',
		DELETE_DIRECTION: 'clinic.delete_direction',
		VIEW_EMPLOYEES: 'clinic.view_employees',
		VIEW_RESERVE: 'clinic.view_reserve',
		ADD_RESERVE: 'clinic.add_reserve',
		CHANGE_RESERVE: 'clinic.change_reserve',
		DELETE_RESERVE: 'clinic.delete_reserve',
		VIEW_RECEPTION: 'clinic.view_reception',
		ADD_RECEPTION: 'clinic.add_reception',
		CHANGE_RECEPTION: 'clinic.change_reception',
		VIEW_PATIENT: 'clinic.view_patient',
		ADD_PATIENT: 'patients.add_patient',
		CHANGE_PATIENT: 'patients.change_patient'
	},
	USERS: {
		VIEW_USER: 'users.view_user',
		ADD_USER: 'users.add_user',
		CHANGE_USER: 'users.change_user',
		DELETE_USER: 'users.delete_user'
	},
	HOSPITAL: {
		VIEW_MODULE: 'hospital.view_module',
		VIEW_STATIONARY_RECEPTION: 'hospital.view_stationaryreception',
		ADD_STATIONARY_RECEPTION: 'hospital.add_stationaryreception',
		CHANGE_STATIONARY_RECEPTION: 'hospital.change_stationaryreception',
		VIEW_WAREHOUSE: 'hospital.view_warehouse'
	},
	LABORATORY: {
		VIEW_MODULE: 'laboratory.view_module',
		VIEW_LABORATORY_RECEPTION: 'laboratory.view_laboratoryreception',
		ADD_LABORATORY_RECEPTION: 'laboratory.add_laboratoryreception',
		CHANGE_LABORATORY_RECEPTION: 'laboratory.change_laboratoryreception',
		VIEW_WAREHOUSE: 'laboratory.view_warehouse'
	},
	FINANCE: {
		// Касса
		VIEW_MODULE: 'finance.view_module',
		VIEW_PENDING_ACTION: 'finance.view_pending_action',
		VIEW_ACTIONS: 'finance.view_actions',
		VIEW_REPORTS: 'finance.view_reports',
		VIEW_FINANCE_ACTION: 'finance.view_financeaction',
		ADD_FINANCE_ACTION: 'finance.add_financeaction',
		CHANGE_FINANCE_ACTION: 'finance.change_financeaction',
		VIEW_CASHIER_WORKSHIFT: 'finance.view_cashierworkshift',
		ADD_CASHIER_WORKSHIFT: 'finance.add_cashierworkshift',
		CHANGE_CASHIER_WORKSHIFT: 'finance.change_cashierworkshift',
		DELETE_CASHIER_WORKSHIFT: 'finance.delete_cashierworkshift',
		// Финансы
		VIEW_FINANCE_MODULE: 'finance.view_finance_module',
		VIEW_FINANCE_OPERATIONS: 'finance.view_finance_operations',
		VIEW_FINANCE_PROFIT_LOSS: 'finance.view_finance_profit_loss',
		VIEW_FINANCE_COST_SERVICES: 'finance.view_finance_cost_services',
		VIEW_FINANCE_SALARY: 'finance.view_finance_salary'
	},
	COMPANIES: {
		VIEW_PARTNER: 'companies.view_partner',
		ADD_PARTNER: 'companies.add_partner',
		CHANGE_PARTNER: 'companies.change_partner',
		DELETE_PARTNER: 'companies.delete_partner',
		VIEW_PROVIDER: 'companies.view_provider',
		ADD_PROVIDER: 'companies.add_provider',
		CHANGE_PROVIDER: 'companies.change_provider',
		DELETE_PROVIDER: 'companies.delete_provider'
	},
	WAREHOUSES: {
		VIEW_MODULE: 'warehouses.view_module',
		VIEW_WAREHOUSE_PRODUCT_REMNANTS: 'warehouses.view_warehouseproductremnants',
		VIEW_WAYBILL: 'warehouses.view_waybill',
		ADD_WAYBILL: 'warehouses.add_waybill',
		CHANGE_WAYBILL: 'warehouses.change_waybill',
		VIEW_PRODUCTS: 'warehouses.view_products',
		DELETE_PRODUCT: 'products.delete_product',
		VIEW_WAREHOUSE: 'warehouses.view_warehouse',
		ADD_WAREHOUSE: 'warehouses.add_warehouse',
		CHANGE_WAREHOUSE: 'warehouses.change_warehouse',
		DELETE_WAREHOUSE: 'warehouses.delete_warehouse',
		VIEW_PRODUCT_REMNANTS: 'warehouses.view_product_remnants',
		VIEW_PACKING: 'warehouses.view_packing',
		CHANGE_PACKING: 'warehouses.change_packing',
		DELETE_PACKING: 'warehouses.delete_packing',
		ADD_PACKING: 'warehouses.add_packing'
	},
	PRODUCTS: {
		VIEW_PRODUCT: 'products.view_product',
		ADD_PRODUCT: 'products.add_product',
		CHANGE_PRODUCT: 'products.change_product',
		DELETE_PRODUCT: 'products.delete_product'
	},
	QUALITY_CONTROL: {
		VIEW_MODULE: 'quality.view_module',
		VIEW_QUALITY_CONTROL: 'quality.view_qualitycontrol',
		ADD_QUALITY_CONTROL: 'quality.add_qualitycontrol',
		CHANGE_QUALITY_CONTROL: 'quality.change_qualitycontrol',
		VIEW_ANALYTICS: 'quality.view_analytics'
	},
	TASKS: {
		VIEW_MODULE: 'tasks.view_module',
		ADD_TASK: 'tasks.add_task'
	},
	DOCUMENTS: {
		VIEW_DOCUMENT_TEMPLATE: 'documents.view_documenttemplate',
		CHANGE_DOCUMENT_TEMPLATE: 'documents.change_documenttemplate',
		ADD_DOCUMENT_TEMPLATE: 'documents.add_documenttemplate',
		DELETE_DOCUMENT_TEMPLATE: 'documents.delete_documenttemplate',
		CHANGE_DOCUMENT_CONTRACT: 'documents.change_paidservicescontract',
		VIEW_DOCUMENT_CONTRACT: 'documents.view_paidservicescontract',
		ADD_DOCUMENT_CONTRACT: 'documents.add_paidservicescontract'
	},
	EQUIPMENTS: {
		VIEW_MODULE: 'equipments.view_module',
		ADD_EQUIPMENT: 'equipments.add_equipment',
		EDIT_EQUIPMENT: 'equipments.change_equipment',
		DELETE_EQUIPMENT: 'equipments.delete_equipment'
	},
	OPERATIONS: {
		VIEW_MODULE: 'operation.view_module',
		ADD_OPERATION: 'operation.add_operation',
		EDIT_OPERATION: 'operation.change_operation',
		DELETE_OPERATIONS: 'operation.delete_operation'
	},
	TREATMENTS: {
		VIEW_MODULE: 'treatment.view_module'
	}
};

export const CASHIER_PERMISSIONS = [
	PERMISSION.FINANCE.ADD_FINANCE_ACTION,
	PERMISSION.FINANCE.VIEW_FINANCE_ACTION,
	PERMISSION.FINANCE.CHANGE_FINANCE_ACTION
];

export const CALL_MANAGER_PERMISSIONS = [PERMISSION.CLINIC.VIEW_CALLS];
