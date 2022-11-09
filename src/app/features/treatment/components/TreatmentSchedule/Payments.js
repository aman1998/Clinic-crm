import React from 'react';
import PropTypes from 'prop-types';
import { numberFormat } from 'app/utils';
import { Grid, useTheme } from '@material-ui/core';
import { BlockInfo } from 'app/common/BlockInfo';
import { PAYMENT } from './constants';

export function Payments({ patientPaymentData, treatmenPaymentData, treatmentServicesData, currentStatus }) {
	const { palette } = useTheme();

	return (
		<div className="grid sm:flex justify-between w-full">
			<div className="w-full">
				<Grid container spacing={6}>
					<Grid item md={3} xs={6}>
						<BlockInfo title="Основной счет" color={palette.grey.main}>
							{numberFormat.currency(patientPaymentData?.balance)} ₸
						</BlockInfo>
					</Grid>
					<Grid item md={3} xs={6}>
						<BlockInfo title="Бонусный счет" color={palette.grey.main}>
							{numberFormat.currency(patientPaymentData?.bonuses_balance)} ₸
						</BlockInfo>
					</Grid>
				</Grid>
				{currentStatus === PAYMENT ? (
					<>
						<Grid container spacing={6}>
							<Grid justify="center" item xg={2} md={3} sm={4} xs={6}>
								<BlockInfo title="Стоимость лечения" color={palette.primary.main}>
									{numberFormat.currency(treatmenPaymentData?.all)} ₸
								</BlockInfo>
							</Grid>
							<Grid item xg={2} md={3} sm={4} xs={6}>
								<BlockInfo title="Оплачено пациентом" color={palette.success.main}>
									{numberFormat.currency(treatmenPaymentData?.paid + treatmenPaymentData?.completed)}{' '}
									₸
								</BlockInfo>
							</Grid>
							<Grid item xg={2} md={3} sm={4} xs={6}>
								<BlockInfo title="Задолженность" color={palette.error.main}>
									{numberFormat.currency(treatmenPaymentData?.passed_not_paid)} ₸
								</BlockInfo>
							</Grid>
							<Grid item xg={2} md={3} sm={4} xs={6}>
								<BlockInfo title="Предстоящие оплаты" color="FF6D00">
									{numberFormat.currency(treatmenPaymentData?.waiting)} ₸
								</BlockInfo>
							</Grid>
							<Grid item xg={2} md={3} sm={4} xs={6}>
								<BlockInfo title="Пропущенные услуги " color="C86DD7">
									{numberFormat.currency(treatmenPaymentData?.missed)} ₸
								</BlockInfo>
							</Grid>
						</Grid>
					</>
				) : (
					<>
						<Grid container spacing={6}>
							<Grid item xg={2} md={3} sm={4} xs={6}>
								<BlockInfo title="Общее кол-во услуг" color={palette.primary.main}>
									{numberFormat.currency(treatmentServicesData?.all)} ₸
								</BlockInfo>
							</Grid>
							<Grid item xg={2} md={3} sm={4} xs={6}>
								<BlockInfo title="Кол-во оплаченных услуг" color={palette.success.main}>
									{numberFormat.currency(
										treatmentServicesData?.paid + treatmentServicesData?.completed
									)}
									₸
								</BlockInfo>
							</Grid>
							<Grid item xg={2} md={3} sm={4} xs={6}>
								<BlockInfo title="Кол-во неоплаченных услуг" color={palette.error.main}>
									{numberFormat.currency(treatmentServicesData?.passed_not_paid)} ₸
								</BlockInfo>
							</Grid>
							<Grid item xg={2} md={3} sm={4} xs={6}>
								<BlockInfo title="Кол-во оставшихся услуг" color="FF6D00">
									{numberFormat.currency(treatmentServicesData?.waiting)} ₸
								</BlockInfo>
							</Grid>
							<Grid item xg={2} md={3} sm={4} xs={6}>
								<BlockInfo title="Пропущенные услуги " color="C86DD7">
									{numberFormat.currency(treatmentServicesData?.missed)} ₸
								</BlockInfo>
							</Grid>
						</Grid>
					</>
				)}
			</div>
		</div>
	);
}

Payments.propTypes = {
	currentStatus: PropTypes.string.isRequired,
	patientPaymentData: PropTypes.objectOf({
		balance: PropTypes.string,
		bonuses_balance: PropTypes.number
	}).isRequired,
	treatmenPaymentData: PropTypes.objectOf(PropTypes.number).isRequired,
	treatmentServicesData: PropTypes.objectOf(PropTypes.number).isRequired
};
