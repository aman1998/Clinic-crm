import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { ButtonBase } from '@material-ui/core';
import { DialogSimpleTemplate } from '../../bizKITUi';

const useStyles = makeStyles(theme => ({
	item: ({ width }) => ({
		maxWidth: width,
		margin: '5px 0',
		padding: '8px 20px',
		overflow: 'hidden',
		border: '1px solid currentColor',
		borderRadius: 30,
		color: 'currentColor',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	}),
	overcrowdedButton: {
		maxWidth: 180,
		padding: '8px 20px',
		border: `1px solid ${theme.palette.error.main}`,
		borderRadius: 30,
		color: theme.palette.error.main
	}
}));

function Item({ name, color, width }) {
	const classes = useStyles({ width });

	return (
		<div className={classes.item} style={{ color }}>
			{name}
		</div>
	);
}
Item.defaultProps = {
	width: 'auto'
};
Item.propTypes = {
	name: PropTypes.string.isRequired,
	color: PropTypes.string.isRequired,
	width: PropTypes.string
};

function OvercrowdedButton({ children, ...props }) {
	const classes = useStyles();

	return (
		<ButtonBase {...props} className={classes.overcrowdedButton}>
			{children}
		</ButtonBase>
	);
}
OvercrowdedButton.propTypes = {
	children: PropTypes.node.isRequired
};

export function HistoryStatuses({ list, maxItems, widthItem }) {
	const showItems = list.slice(0, maxItems);
	const numberOfOvercrowded = list.length - maxItems;

	const [isShowModal, setIsShowModal] = useState(false);

	return (
		<>
			<div className="flex flex-wrap items-center">
				{showItems.map((item, index) => (
					<div className="mr-10" key={index}>
						<Item name={item.name} color={item.color} width={widthItem} />
					</div>
				))}

				{numberOfOvercrowded > 0 && (
					<OvercrowdedButton onClick={() => setIsShowModal(true)}>+ {numberOfOvercrowded}</OvercrowdedButton>
				)}
			</div>

			<DialogSimpleTemplate isOpen={isShowModal} onClose={() => setIsShowModal(false)} header={<>История</>}>
				<div className="flex flex-wrap items-center">
					{list.map((item, index) => (
						<div className="mr-10 mb-10 text-center" key={index}>
							<Item name={item.name} color={item.color} width="auto" />
						</div>
					))}
				</div>
			</DialogSimpleTemplate>
		</>
	);
}
HistoryStatuses.defaultProps = {
	maxItems: 10,
	widthItem: '180px'
};
HistoryStatuses.propTypes = {
	list: PropTypes.arrayOf(
		PropTypes.shape({
			name: PropTypes.string.isRequired,
			color: PropTypes.string.isRequired
		})
	).isRequired,
	maxItems: PropTypes.number,
	widthItem: PropTypes.string
};
