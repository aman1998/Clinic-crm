import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import moment from 'moment';
import { Box, Grid, Typography, useTheme } from '@material-ui/core';
import { Amount, DrawerTemplate, TextField } from '../../../../bizKITUi';
import { BlockInfo } from '../../../../common/BlockInfo';
import { clinicService, ENTITY } from '../../../../services';
import { getFullName } from '../../../../utils';
import { ErrorMessage } from '../../../../common/ErrorMessage';
import { TableMedications } from './TableMedications';
import { TableStates } from './TableStates';
import { TablePayouts } from './TablePayouts';

export function ModalCostPrice({ isOpen, onClose, receptionUuid }) {
	const { palette } = useTheme();

	const { isLoading, isError, data: costPrice } = useQuery([ENTITY.RECEPTION_COST_PRICE, receptionUuid], () =>
		clinicService.getReceptionCostPrice(receptionUuid)
	);

	return (
		<DrawerTemplate
			isOpen={isOpen}
			close={onClose}
			isLoading={isLoading}
			width="md"
			header={
				<Typography color="secondary" className="text-xl font-bold text-center">
					Расчет себестоимости услуг
				</Typography>
			}
			content={
				isLoading ? (
					<></>
				) : isError ? (
					<ErrorMessage />
				) : (
					<>
						<Typography variant="subtitle2">Информация об услуге</Typography>
						<TextField
							label="Услуга"
							value={costPrice.service.name}
							InputProps={{ readOnly: true }}
							fullWidth
							variant="outlined"
							margin="normal"
						/>
						<Grid container spacing={2}>
							<Grid item xs={6}>
								<TextField
									label="Врач"
									value={getFullName(costPrice.service.doctor)}
									InputProps={{ readOnly: true }}
									fullWidth
									variant="outlined"
									margin="normal"
								/>
							</Grid>
							<Grid item xs={6}>
								<TextField
									label="Пациент"
									value={getFullName(costPrice.patient)}
									InputProps={{ readOnly: true }}
									fullWidth
									variant="outlined"
									margin="normal"
								/>
							</Grid>
						</Grid>
						<TextField
							label="Дата прима"
							value={moment(costPrice.date_time).format('DD.MM.YYYY HH:mm')}
							InputProps={{ readOnly: true }}
							fullWidth
							variant="outlined"
							margin="normal"
						/>
						<Box className="grid grid-cols-1 xs1:grid-cols-2 sm3:grid-cols-3 gap-16 my-16">
							<BlockInfo title="Общая стоимость" color={palette.primary.main}>
								<Amount value={costPrice.service.cost} />
							</BlockInfo>
							<BlockInfo title="Расходы" color={palette.error.main}>
								<Amount value={costPrice.data.expense} />
							</BlockInfo>
							<BlockInfo title="Прибыль" color={palette.success.main}>
								<Amount value={costPrice.data.profit} />
							</BlockInfo>
							<BlockInfo title="Расходные материалы" color={palette.error.main}>
								<Amount value={costPrice.data.medications_expense} />
							</BlockInfo>
							<BlockInfo title="Расходные статьи" color={palette.error.main}>
								<Amount value={costPrice.data.states_expense} />
							</BlockInfo>
							<BlockInfo title="Выплаты партнерам / сотрудникам" color={palette.error.main}>
								<Amount value={costPrice.data.payouts_expense} />
							</BlockInfo>
						</Box>

						<Typography className="my-16" variant="subtitle2">
							Автосписание расходных материалов
						</Typography>
						<TableMedications receptionUuid={receptionUuid} />

						<Typography className="my-16" variant="subtitle2">
							Учёт расходных статей
						</Typography>
						<TableStates receptionUuid={receptionUuid} />

						<Typography className="my-16" variant="subtitle2">
							Выплаты партнерам/сотрудникам
						</Typography>
						<TablePayouts receptionUuid={receptionUuid} />
					</>
				)
			}
		/>
	);
}
ModalCostPrice.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	receptionUuid: PropTypes.string.isRequired
};
