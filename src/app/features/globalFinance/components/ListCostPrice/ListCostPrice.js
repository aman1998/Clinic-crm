import React from 'react';
import { useQuery } from 'react-query';
import clsx from 'clsx';
import moment from 'moment';
import { makeStyles, Paper, Typography } from '@material-ui/core';
import { Button, DataTable, Amount, ServerAutocomplete, DatePickerField } from '../../../../bizKITUi';
import FuseLoading from '../../../../../@fuse/core/FuseLoading';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { clinicService, companiesService, employeesService, ENTITY } from '../../../../services';
import { getFullName, getShortName } from '../../../../utils';
import { useDebouncedFilterForm } from '../../../../hooks';
import { ModalCostPrice } from '../ModalCostPrice';
import { modalPromise } from '../../../../common/ModalPromise';

const useStyles = makeStyles(theme => ({
	form: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
	},
	resetBtn: {
		display: 'flex',
		marginLeft: 'auto',
		[theme.breakpoints.down(1399)]: {
			margin: '0'
		}
	},
	isWrong: {
		color: theme.palette.error.main
	},
	isGood: {
		color: theme.palette.success.main
	}
}));

const now = new Date();
const defaultValues = {
	service: null,
	doctor: null,
	direction: null,
	partner: null,
	time_from: new Date(now.setMonth(now.getMonth() - 1)),
	time_to: new Date(),
	limit: 10,
	offset: 0
};

export function ListCostPrice() {
	const classes = useStyles();
	const { form, debouncedForm, resetForm, setInForm, getPage, setPage } = useDebouncedFilterForm(defaultValues);

	const { isLoading, isError, data } = useQuery([ENTITY.RECEPTION_COST_PRICE, debouncedForm], ({ queryKey }) =>
		clinicService.getReceptionsCostPrice(queryKey[1])
	);

	const columns = [
		{
			name: 'date_time',
			label: 'Дата / Время',
			options: {
				customBodyRenderLite: dataIndex => {
					const { date_time } = data.results[dataIndex];
					return (
						<>
							<Typography>{moment(date_time).format('DD.MM.YYYY')}</Typography>
							<Typography variant="caption">{moment(date_time).format('HH:mm')}</Typography>
						</>
					);
				}
			}
		},
		{
			name: 'service',
			label: 'Услуга',
			options: {
				customBodyRenderLite: dataIndex => {
					const { service } = data.results[dataIndex];
					return service.name ?? '—';
				}
			}
		},
		{
			name: 'doctor',
			label: 'Врач',
			options: {
				customBodyRenderLite: dataIndex => {
					const { service } = data.results[dataIndex];
					return getShortName(service.doctor);
				}
			}
		},
		{
			name: 'cost',
			label: 'Стоимость',
			options: {
				customBodyRenderLite: dataIndex => {
					const { service } = data.results[dataIndex];
					return <Amount value={service.cost} />;
				}
			}
		},
		{
			name: 'plan_expense',
			label: 'План расходов',
			options: {
				customBodyRenderLite: dataIndex => {
					const {
						data: { plan_expense }
					} = data.results[dataIndex];
					return <Amount value={plan_expense} />;
				}
			}
		},
		{
			name: 'fact_expense',
			label: 'Факт расходов',
			options: {
				customBodyRenderLite: dataIndex => {
					const {
						data: { fact_expense }
					} = data.results[dataIndex];
					return <Amount value={fact_expense} />;
				}
			}
		},
		{
			name: 'delta',
			label: 'Отклонение расходов',
			options: {
				customBodyRenderLite: dataIndex => {
					const {
						data: { deviation_expenses }
					} = data.results[dataIndex];
					return (
						<Amount
							className={clsx({
								[classes.isWrong]: deviation_expenses < 0,
								[classes.isGood]: deviation_expenses > 0
							})}
							value={deviation_expenses}
						/>
					);
				}
			}
		},
		{
			name: 'plan_profit',
			label: 'План прибыли',
			options: {
				customBodyRenderLite: dataIndex => {
					const {
						data: { plan_profit }
					} = data.results[dataIndex];
					return <Amount value={plan_profit} />;
				}
			}
		},
		{
			name: 'fact_profit',
			label: 'Факт прибыли',
			options: {
				customBodyRenderLite: dataIndex => {
					const {
						data: { fact_profit }
					} = data.results[dataIndex];
					return <Amount value={fact_profit} />;
				}
			}
		},
		{
			name: 'actions',
			label: 'Действия',
			options: {
				customBodyRenderLite: () => {
					return (
						<Button textNormal variant="text">
							Подробнее
						</Button>
					);
				}
			}
		}
	];
	const tableOptions = {
		serverSide: true,
		rowsPerPage: form.limit,
		page: getPage(),
		count: data?.count ?? 0,
		onRowClick: (_, rowMeta) => {
			modalPromise.open(({ onClose }) => (
				<ModalCostPrice isOpen onClose={onClose} receptionUuid={data.results[rowMeta.dataIndex].uuid} />
			));
		},
		onChangePage: page => setPage(page),
		onChangeRowsPerPage: limit => setInForm('limit', limit)
	};

	return (
		<>
			<Paper component="form" className={`p-16 my-32 gap-10 ${classes.form}`}>
				<ServerAutocomplete
					label="Услуга"
					name="service"
					getOptionLabel={option => option.name}
					onFetchList={(name, limit) => clinicService.getServices({ name, limit }).then(res => res.data)}
					onFetchItem={uuid => clinicService.getServiceById(uuid)}
					value={form.service}
					onChange={value => setInForm('service', value?.uuid ?? null)}
					InputProps={{ size: 'small' }}
				/>
				<ServerAutocomplete
					label="Направление"
					name="direction"
					getOptionLabel={option => option.name}
					onFetchList={(name, limit) => clinicService.getDirections({ name, limit })}
					onFetchItem={uuid => clinicService.getDirectionById(uuid)}
					value={form.direction}
					onChange={value => setInForm('direction', value?.uuid ?? null)}
					InputProps={{ size: 'small' }}
				/>
				<ServerAutocomplete
					label="Врач"
					name="doctor"
					getOptionLabel={option => getFullName(option)}
					onFetchList={(search, limit) =>
						employeesService.getDoctors({ search, limit }).then(res => res.data)
					}
					onFetchItem={uuid => employeesService.getDoctor(uuid).then(res => res.data)}
					value={form.doctor}
					onChange={value => setInForm('doctor', value?.uuid ?? null)}
					InputProps={{ size: 'small' }}
				/>
				<ServerAutocomplete
					label="Партнёр"
					name="partner"
					getOptionLabel={option => option.name}
					onFetchList={(search, limit) =>
						companiesService.getPartnersCompanies({ search, limit }).then(res => res.data)
					}
					onFetchItem={uuid => companiesService.getPartnerCompany(uuid)}
					value={form.partner}
					onChange={value => setInForm('partner', value?.uuid ?? null)}
					InputProps={{ size: 'small' }}
				/>
				<DatePickerField
					label="Дата от"
					inputVariant="outlined"
					size="small"
					onlyValid
					value={form.time_from}
					onChange={date => setInForm('time_from', date)}
				/>
				<DatePickerField
					label="Дата до"
					inputVariant="outlined"
					size="small"
					onlyValid
					value={form.time_to}
					onChange={date => setInForm('time_to', date)}
				/>

				<Button
					className={classes.resetBtn}
					textNormal
					variant="outlined"
					onClick={() => resetForm()}
					disabled={isLoading}
				>
					Сбросить
				</Button>
			</Paper>

			{isLoading ? (
				<FuseLoading />
			) : isError ? (
				<ErrorMessage />
			) : (
				<DataTable data={data.results} columns={columns} options={tableOptions} />
			)}
		</>
	);
}
