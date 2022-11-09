import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Event as EventIcon, Person as PersonIcon, Brightness1 as Brightness1Icon } from '@material-ui/icons';
import moment from 'moment';
import { numberFormat } from '../../utils';

const useStyles = makeStyles({
	container: {
		position: 'relative',
		padding: 10,
		borderRadius: 6,
		border: '1px solid #59D1E6'
	},
	info: {
		marginTop: 15,
		marginBottom: 15,
		fontSize: 16,
		marginLeft: 5
	},
	icon: {
		marginTop: -2,
		marginRight: 5
	},
	currencyIcon: {
		marginRight: 5,
		padding: '3px 2px 2px 3px',
		border: '1px solid #59D1E6',
		borderRadius: 2,
		color: '#59D1E6'
	},
	button: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%'
	}
});

export function CardInvoiceForPayment({ item, onClick }) {
	const classes = useStyles();

	const createdAt = moment(item.created_at).format('dd, DD MMMM YYYY');
	const createdAtOnlyDate = moment(item.created_at).format('DD.MM.YYYY');

	return (
		<div className={classes.container}>
			<div className="flex">
				<div>
					<Brightness1Icon className={classes.icon} style={{ color: '#59D1E6' }} /> Создан
				</div>

				<div className="ml-auto">
					<EventIcon className={classes.icon} style={{ color: '#59D1E6' }} />
					{createdAt}
				</div>
			</div>

			<div className={classes.info}>
				Счёт на оплату №{item.number} от {createdAtOnlyDate}
			</div>

			<div className="flex">
				{item.responsible && (
					<div>
						<PersonIcon className={classes.icon} style={{ color: '#59D1E6' }} />
						{item.responsible.first_name} {item.responsible.last_name}
					</div>
				)}

				<div className="ml-auto">
					{item.amount && (
						<>
							<span className={classes.currencyIcon}>₸</span> {numberFormat.currency(item.amount)} ₸
						</>
					)}
				</div>
			</div>

			<button type="button" className={classes.button} onClick={onClick} aria-label="Выбрать" />
		</div>
	);
}
CardInvoiceForPayment.propTypes = {
	item: PropTypes.shape({
		number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		created_at: PropTypes.string,
		amount: PropTypes.number,
		responsible: PropTypes.shape({
			first_name: PropTypes.string,
			last_name: PropTypes.string
		})
	}).isRequired,
	onClick: PropTypes.func.isRequired
};
