import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import moment from 'moment';
import { Typography, Paper, makeStyles } from '@material-ui/core';
import { DrawerTemplate, Button, TextField, TablePagination, ServerAutocomplete } from '../../bizKITUi';
import { numberFormat } from '../../utils';
import { ErrorMessage } from '../ErrorMessage';
import FuseLoading from '../../../@fuse/core/FuseLoading';
import { useDebouncedFilterForm } from '../../hooks';
import { companiesService, ENTITY, productsService } from '../../services';
import { ModalProduct } from '../ModalProduct/ModalProduct';

const useStyles = makeStyles(theme => ({
	header: {
		display: 'flex',
		width: '100%',
		[theme.breakpoints.down(560)]: {
			width: 'auto',
			flexDirection: 'column'
		}
	},
	createBtn: {
		marginLeft: 'auto',
		marginRight: 24,
		[theme.breakpoints.down(560)]: {
			marginLeft: 0
		}
	}
}));

export function ModalSelectProductByWarehouses({ isOpen, warehouseUuid, onClose, onAdd }) {
	const [isShowModalProduct, setIsShowModalProduct] = useState(false);

	const classes = useStyles();

	const { form, debouncedForm, getPage, setPage, handleChange, setInForm } = useDebouncedFilterForm({
		name_vendor_code_manufacturer: '',
		provider: null,
		limit: 10,
		offset: 0
	});

	const { isLoading, isError, data } = useQuery([ENTITY.PRODUCT_REMNANTS_COST, debouncedForm], ({ queryKey }) =>
		productsService.getProductsRemnantsCosts(queryKey[1]).then(res => res.data)
	);

	const handleOnAddProduct = (product, warehouse) => {
		onAdd({
			uuid: product.uuid,
			name: product.name,
			provider: product.provider,
			total_remnants: product.total_remnants,
			manufacturer: product.manufacturer,
			warehouse,
			packing_unit: product.packing_unit ?? null,
			minimum_unit_of_measure: product.minimum_unit_of_measure,
			amount_in_package: product.amount_in_package ?? 0
		});
	};

	return (
		<>
			<DrawerTemplate
				isOpen={isOpen}
				close={onClose}
				width="md"
				header={
					<div className={`gap-10 ${classes.header}`}>
						<Typography color="secondary" className="text-xl font-bold text-center">
							?????????? ????????????
						</Typography>
						<Button className={classes.createBtn} textNormal onClick={() => setIsShowModalProduct(true)}>
							?????????????? ??????????
						</Button>
					</div>
				}
				content={
					<>
						<div className="flex">
							<TextField
								label="?????????? ???? ????????????????????????, ???????????????? ?? ??????????????????????????"
								type="text"
								variant="outlined"
								name="name_vendor_code_manufacturer"
								className="mr-16"
								fullWidth
								value={form.name_vendor_code_manufacturer}
								onChange={handleChange}
							/>

							<ServerAutocomplete
								name="provider"
								label="??????????????????"
								className="w-full"
								value={form.provider}
								onChange={value => setInForm('provider', value?.uuid ?? null)}
								getOptionLabel={option => option.name}
								onFetchList={(name, limit) => companiesService.getCompanyProviders({ name, limit })}
								onFetchItem={uuid => companiesService.getCompanyProvider(uuid).then(res => res.data)}
							/>
						</div>

						<div className="mt-20">
							{isLoading ? (
								<FuseLoading />
							) : isError ? (
								<ErrorMessage />
							) : (
								<>
									{data.results.map(item => (
										<Paper key={item.uuid} className="px-28 py-20 mb-20">
											<Typography color="secondary" className="text-xl font-bold">
												{item.name}
											</Typography>

											<Paper className="px-28 py-20 mt-20">
												{item.warehouses.length === 0 ? (
													'???????????? ?????? ???? ??????????????'
												) : (
													<table className="w-full">
														<thead>
															<tr className="text-left">
																<th className="pb-10">??????????</th>
																<th className="pb-10">???????? ??????????????</th>
																<th className="pb-10">??????????????</th>
																<th className="pb-10">????.??????.</th>
																<th className="pb-10">???????? ??????????????</th>
																<th className="pb-10 text-right">????????????????</th>
															</tr>
														</thead>
														{item.warehouses.map((warehouse, index) => (
															<tbody key={index}>
																<tr className="text-left">
																	<td>{warehouse.name}</td>
																	<td>{`${numberFormat.currency(
																		warehouse.cost
																	)} ???`}</td>
																	<td>{warehouse.amount}</td>
																	<td>{item.minimum_unit_of_measure.name}</td>
																	<td>
																		{moment(warehouse.updated_at).format(
																			'DD.MM.YYYY'
																		)}
																	</td>
																	<td className="text-right">
																		<Button
																			textNormal
																			variant="text"
																			color="primary"
																			className="font-bold"
																			disabled={
																				warehouse.warehouse_uuid !==
																				warehouseUuid
																			}
																			onClick={() =>
																				handleOnAddProduct(item, warehouse)
																			}
																		>
																			????????????????
																		</Button>
																	</td>
																</tr>
															</tbody>
														))}
													</table>
												)}
											</Paper>
										</Paper>
									))}

									{isShowModalProduct && (
										<ModalProduct isOpen onClose={() => setIsShowModalProduct(false)} />
									)}

									<div className="mt-20 text-right">
										<TablePagination
											component="div"
											rowsPerPage={form.limit}
											page={getPage()}
											count={data?.count ?? 0}
											onChangePage={(_, page) => setPage(page)}
											onChangeRowsPerPage={event => setInForm('limit', event.target.value)}
										/>
									</div>
								</>
							)}
						</div>
					</>
				}
			/>
		</>
	);
}
ModalSelectProductByWarehouses.propTypes = {
	warehouseUuid: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onAdd: PropTypes.func.isRequired
};
