import React, { useState, useContext } from 'react';
import { IconButton, TableRow } from '@material-ui/core';
import {
	KeyboardArrowDown as KeyboardArrowDownIcon,
	KeyboardArrowRight as KeyboardArrowRightIcon
} from '@material-ui/icons';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { TableFinanceStatisticsCell } from './TableFinanceStatisticsCell';

const useStyles = makeStyles(theme => ({
	row: props =>
		props.isCollapse && {
			'&:hover': {
				backgroundColor: theme.palette.grey[100],
				cursor: 'pointer',
				transition: '.2s background-color'
			}
		}
}));

const Context = React.createContext(null);

export function TableFinanceStatisticsAccordion({ title, className, children, isCollapse }) {
	const classes = useStyles({ isCollapse });
	const currentOffset = useContext(Context) ?? 0;
	const nextOffset = currentOffset + 20;
	const offset = nextOffset + (isCollapse ? 0 : 35);
	const [summary, ...childrenProp] = React.Children.toArray(children);
	const [isShow, setIsShow] = useState(false);

	return (
		<Context.Provider value={offset}>
			<TableRow onClick={() => setIsShow(!isShow)} className={classes.row}>
				<TableFinanceStatisticsCell
					className={clsx(className, 'pr-64 w-0')}
					fixed
					style={{ paddingLeft: offset }}
				>
					<div className="flex items-center whitespace-no-wrap">
						{isCollapse && (
							<IconButton
								className="mr-6"
								aria-label="развернуть строку"
								size="small"
								onClick={() => setIsShow(!isShow)}
							>
								{isShow ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
							</IconButton>
						)}

						{title}
					</div>
				</TableFinanceStatisticsCell>

				{summary}
			</TableRow>

			{isShow && childrenProp}
		</Context.Provider>
	);
}
TableFinanceStatisticsAccordion.defaultProps = {
	className: '',
	isCollapse: false
};
TableFinanceStatisticsAccordion.propTypes = {
	title: PropTypes.string.isRequired,
	className: PropTypes.string,
	children: PropTypes.arrayOf(PropTypes.element).isRequired,
	isCollapse: PropTypes.bool
};
