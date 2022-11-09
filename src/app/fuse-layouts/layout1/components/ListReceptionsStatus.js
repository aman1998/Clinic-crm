import React from 'react';
import { Typography } from '@material-ui/core';
import { BlockReceptionStatus } from '../../../common/BlockReceptionStatus';
import {
	STATUS_RECEPTION_APPOINTED,
	STATUS_RECEPTION_CONFIRMED,
	STATUS_RECEPTION_CASH,
	STATUS_RECEPTION_PAID,
	STATUS_RECEPTION_FAILED
} from '../../../services/clinic/constants';

export function ListReceptionsStatus() {
	return (
		<div className="text-12">
			<Typography color="secondary" className="text-13 font-bold">
				Примеры статусов приемов
			</Typography>

			<div className="flex items-center mt-12">
				<BlockReceptionStatus text="09:00" />
				<span className="ml-10">
					Свободный <br /> прием
				</span>
			</div>

			<div className="flex items-center mt-12">
				<BlockReceptionStatus status={STATUS_RECEPTION_APPOINTED} text="09:00" />
				<span className="ml-10">
					Прием <br /> назначен
				</span>
			</div>

			<div className="flex items-center mt-12">
				<BlockReceptionStatus status={STATUS_RECEPTION_CONFIRMED} text="09:00" />
				<span className="ml-10">
					Прием <br /> подтвержден
				</span>
			</div>

			<div className="flex items-center mt-12">
				<BlockReceptionStatus status={STATUS_RECEPTION_CASH} text="09:00" />
				<span className="ml-10">
					Отправлено <br /> на кассу
				</span>
			</div>

			<div className="flex items-center mt-12">
				<BlockReceptionStatus status={STATUS_RECEPTION_PAID} text="09:00" />
				<span className="ml-10">
					Оплачено <br /> пациентом
				</span>
			</div>

			<div className="flex items-center mt-12">
				<BlockReceptionStatus status={STATUS_RECEPTION_FAILED} text="09:00" />
				<span className="ml-10">
					Прием <br /> не состоялся
				</span>
			</div>
		</div>
	);
}
