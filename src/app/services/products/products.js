import {
	PRODUCT_PROMOTION_STATUS_ACTIVE,
	PRODUCT_PROMOTION_STATUS_COMPLETED,
	PRODUCT_PROMOTION_TYPE_CASHBACK,
	PRODUCT_PROMOTION_TYPE_DISCOUNT,
	TYPE_PRODUCT_COST_HISTORY_PURCHASE,
	TYPE_PRODUCT_COST_HISTORY_SALE,
	PRODUCT_PROMOTION_STATUS_TYPE_DISABLED
} from './constants';
import { httpClient } from '../clients/httpClient';

/**
 * @typedef {object} PackingUnit
 * @property {string} uuid
 * @property {string} name
 * @property {('PIECE'|'PACK')} type
 */

export const productsService = {
	getProducts(params) {
		return httpClient.get('/products/', { params });
	},

	getProduct(uuid) {
		return httpClient.get(`/products/${uuid}/`);
	},

	createProduct(data) {
		return httpClient.post('/products/', data);
	},

	updateProduct(uuid, data) {
		return httpClient.put(`/products/${uuid}/`, data);
	},

	deleteProduct(uuid) {
		return httpClient.delete(`/products/${uuid}/`);
	},

	getGroupBonus(params) {
		return httpClient.get('/products/group_bonuses/', { params });
	},

	createGroupBonus(data) {
		return httpClient.post('/products/group_bonuses/', data);
	},

	getProductCategories(params) {
		return httpClient.get('/products/categories/', { params });
	},

	getProductCategory(uuid) {
		return httpClient.get(`/products/categories/${uuid}/`);
	},

	createProductCategory(data) {
		return httpClient.post('/products/categories/', data);
	},

	updateProductCategory(uuid, data) {
		return httpClient.put(`/products/categories/${uuid}/`, data);
	},

	deleteProductCategory(uuid) {
		return httpClient.delete(`/products/categories/${uuid}/`);
	},

	getProductsRemnants(params) {
		return httpClient.get('/products/remnants/', { params });
	},

	getProductsRemnantsCosts(params) {
		return httpClient.get('/products/remnants/costs/', { params });
	},

	getProductRemnant(uuid, params) {
		return httpClient.get(`/products/remnants/${uuid}/`, { params });
	},

	getProductsRemnantsLaboratory(params) {
		return httpClient.get('/products/remnants/laboratory/', { params });
	},

	getProductsRemnantsCostsLaboratory(params) {
		return httpClient.get('/products/remnants/laboratory/costs/', { params });
	},

	getProductRemnantLaboratory(uuid, params) {
		return httpClient.get(`/products/remnants/laboratory/${uuid}/`, { params });
	},

	getProductPromotions(params) {
		return httpClient.get('/products/promotions/', { params });
	},

	getProductPromotion(uuid) {
		return httpClient.get(`/products/promotions/${uuid}/`).then(({ data }) => data);
	},

	createProductPromotion(payload) {
		return httpClient.post(`/products/promotions/`, payload);
	},

	updateProductPromotion(uuid, payload) {
		return httpClient.patch(`/products/promotions/${uuid}/`, payload);
	},

	deleteProductPromotion(uuid) {
		return httpClient.delete(`/products/promotions/${uuid}/`);
	},

	activateProductPromotion(uuid) {
		return httpClient.put(`/products/promotions/${uuid}/activate/`);
	},

	completeProductPromotion(uuid) {
		return httpClient.put(`/products/promotions/${uuid}/disable/`);
	},

	getProductPromotionTypeList() {
		return [
			{ type: PRODUCT_PROMOTION_TYPE_DISCOUNT, name: 'Скидка' },
			{ type: PRODUCT_PROMOTION_TYPE_CASHBACK, name: 'Кэшбэк' }
		];
	},

	getProductPromotionTypeNameByType(type) {
		return this.getProductPromotionTypeList().find(item => item.type === type)?.name ?? '';
	},

	getProductPromotionStatusList() {
		return [
			{ type: PRODUCT_PROMOTION_STATUS_ACTIVE, name: 'Активна' },
			{ type: PRODUCT_PROMOTION_STATUS_COMPLETED, name: 'Завершена' }
		];
	},

	getPromotionStatusNameByType(type) {
		return this.getProductPromotionStatusList().find(item => item.type === type)?.name ?? '';
	},

	getProductPromotionStatusTypeList() {
		return [
			{ type: PRODUCT_PROMOTION_STATUS_ACTIVE, name: 'Активна' },
			{ type: PRODUCT_PROMOTION_STATUS_TYPE_DISABLED, name: 'Завершена' }
		];
	},

	getProductPromotionStatusNameByType(type) {
		return this.getProductPromotionStatusTypeList().find(item => item.type === type)?.name ?? '';
	},

	getProductCostHistory(uuid, params) {
		return httpClient.get(`/products/${uuid}/cost_history/`, { params });
	},

	getProductsStatisticsStationaryReceptionsPopular(params) {
		return httpClient.get('/products/statistics/stationary_receptions/popular/', { params });
	},

	getProductsStatisticsStationaryReceptionsAbcAnalysis(params) {
		return httpClient.get('/products/statistics/stationary_receptions/abc_analysis/', { params });
	},

	getProductsStatisticsLaboratoryReceptionsPopular(params) {
		return httpClient.get('/products/statistics/laboratory_receptions/popular/', { params });
	},

	getProductsStatisticsLaboratoryReceptionsAbcAnalysis(params) {
		return httpClient.get('/products/statistics/laboratory_receptions/abc_analysis/', { params });
	},

	getProductCostHistoryTypeList() {
		return [
			{ type: TYPE_PRODUCT_COST_HISTORY_PURCHASE, name: 'Цена закупки' },
			{ type: TYPE_PRODUCT_COST_HISTORY_SALE, name: 'Цена продажи' }
		];
	},

	getProductCostHistoryType(type) {
		return this.getProductCostHistoryTypeList().find(item => item.type === type);
	},

	getProductsStatisticsWaybillsPopular(params) {
		return httpClient.get('/products/statistics/waybills/popular/', { params });
	},

	getProductsStatisticsWaybillsAbcAnalysis(params) {
		return httpClient.get('/products/statistics/waybills/abc_analysis/', { params });
	},

	/**
	 * Calculates product cost in depends of packing units
	 * @param {object} product
	 * @param {number} product.sale_price
	 * @param {number} product.amount_in_package
	 * @param {object} product.minimum_unit_of_measure
	 * @param {string} product.minimum_unit_of_measure.uuid
	 * @param {object} packing needed packing unit
	 * @param {string} packing.uuid
	 * @param {number} amount number of items
	 * @param {number} [overrideCost] override product.sale_price if needed
	 * @returns {number}
	 */
	getProductCost(product, packing, amount, overrideCost) {
		let total = (overrideCost ?? product.sale_price) * amount;
		if (packing.uuid === product.minimum_unit_of_measure.uuid && product.amount_in_package) {
			total /= product.amount_in_package;
		}
		return total;
	},

	/**
	 * Return array of product packing units
	 * @param {object} product
	 * @param {object} product.minimum_unit_of_measure
	 * @param {string} product.minimum_unit_of_measure.uuid
	 * @param {string} product.minimum_unit_of_measure.name
	 * @param {('PIECE'|'PACK')} product.minimum_unit_of_measure.type
	 * @param {object} product.packing_unit
	 * @param {string} product.packing_unit.uuid
	 * @param {string} product.packing_unit.name
	 * @param {('PIECE'|'PACK')} product.packing_unit.type
	 * @returns {PackingUnit[]}
	 */
	getProductPackingUnits(product) {
		const selectedProductPacking = [];
		if (!product) {
			return selectedProductPacking;
		}
		selectedProductPacking.push(product.minimum_unit_of_measure);
		if (product.packing_unit) {
			selectedProductPacking.push(product.packing_unit);
		}
		return selectedProductPacking;
	}
};
