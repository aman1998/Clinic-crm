import React, { createContext, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { makeStyles, Paper } from '@material-ui/core';
import { ArrowBack as ArrowBackIcon, DeleteOutline as DeleteOutlineIcon } from '@material-ui/icons';
import { renderRoutes } from 'react-router-config';
import { Button } from 'app/bizKITUi';
import { PenIcon } from 'app/icons/PenIcon';
import { useToolbarTitle } from '../../../hooks';

export const ContextMenu = createContext(null);

const useStyles = makeStyles(theme => ({
	navButtons: {
		backgroundColor: '#EFEFEF'
	},
	navButtonsDelete: {
		color: '#7F4C0A'
	},
	navButtonsDeleteIcon: {
		color: '#ED9526'
	}
}));

export function Lead({ route }) {
	const classes = useStyles();

	const history = useHistory();
	const { leadUuid } = useParams();
	const [menu, setMenu] = useState(null);
	const [isLeadEdit, setIsLeadEdit] = useState(false);

	useToolbarTitle('Лид');

	return (
		<ContextMenu.Provider value={{ setMenu, isLeadEdit }}>
			<div>
				<Paper className="flex justify-between items-center scroll-control py-16">
					<div className="flex pl-32">
						<Button
							textNormal
							className={`${classes.navButtons} whitespace-no-wrap ml-10 px-16`}
							variant="text"
							startIcon={<ArrowBackIcon />}
							onClick={history.goBack}
						>
							Вернуться
						</Button>
						{leadUuid && (
							<>
								<Button
									textNormal
									className={`${classes.navButtons} whitespace-no-wrap ml-10 px-16`}
									variant="text"
									startIcon={<PenIcon iconColor="#1672EC" />}
									onClick={() => setIsLeadEdit(!isLeadEdit)}
								>
									Редактировать
								</Button>
								<Button
									textNormal
									className={`${classes.navButtons} ${classes.navButtonsDelete} whitespace-no-wrap ml-10 px-16`}
									variant="text"
									startIcon={<DeleteOutlineIcon className={classes.navButtonsDeleteIcon} />}
								>
									Удалить
								</Button>
							</>
						)}
					</div>

					<div className="pr-32">{menu}</div>
				</Paper>

				<div>{renderRoutes(route.routes)}</div>
			</div>
		</ContextMenu.Provider>
	);
}
export default Lead;
