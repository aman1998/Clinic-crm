import React from 'react';
import PropTypes from 'prop-types';
import { DialogSimpleTemplate } from '../../bizKITUi/DialogSimpleTemplate';
import { TextField, CurrencyTextField, Button } from '../../bizKITUi';
import { useStateForm, useAlert } from '../../hooks';
import { numberFormat } from '../../utils';
import { normalizeNumberType } from '../../utils/normalizeNumber';

export function ModalProductCount({
	isOpen,
	productName,
	productCount,
	productMeasureUnit,
	cost,
	isShowSellingPrice,
	onAdd,
	onClose
}) {
	const { alertError } = useAlert();
	const { form, handleChange, setInForm } = useStateForm({ count: '', cost });

	const handleOnSubmit = event => {
		event.preventDefault();

		if (form.count <= 0 || form.count > productCount) {
			alertError('Кол-во для отпуска не может быть больше остатка и меньше 0');
			return;
		}

		onAdd(form);
	};

	return (
		<DialogSimpleTemplate isOpen={isOpen} onClose={onClose} fullWidth maxWidth="sm" header={<>Отпуск товара</>}>
			<div className="flex justify-between">
				<div>
					<span className="font-bold">Товар: </span>
					{productName}
				</div>

				<div>
					<span className="font-bold">Остаток: </span>
					{productCount} {productMeasureUnit.name}
				</div>

				<div>
					<span className="font-bold">Цена закупки: </span>
					{numberFormat.currency(cost)} ₸
				</div>
			</div>

			<form onSubmit={handleOnSubmit}>
				<div className="flex mt-20">
					<TextField
						label="Кол-во для отпуска"
						variant="outlined"
						name="count"
						fullWidth
						value={form.count}
						onChange={handleChange}
						onKeyPress={normalizeNumberType}
					/>

					{isShowSellingPrice && (
						<CurrencyTextField
							variant="outlined"
							label="Цена продажи"
							fullWidth
							className="ml-16"
							value={form.cost}
							onChange={(_, value) => setInForm('cost', value)}
						/>
					)}
				</div>

				<div>
					<Button type="submit" textNormal className="mt-20">
						Добавить
					</Button>
				</div>
			</form>
		</DialogSimpleTemplate>
	);
}
ModalProductCount.defaultProps = {
	isShowSellingPrice: false
};
ModalProductCount.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	productName: PropTypes.string.isRequired,
	productMeasureUnit: PropTypes.shape({
		name: PropTypes.string
	}).isRequired,
	productCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	cost: PropTypes.number.isRequired,
	isShowSellingPrice: PropTypes.bool,
	onAdd: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired
};
