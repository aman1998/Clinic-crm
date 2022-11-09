export const SET_TITLE = '[SETTINGS] SET TITLE';

export function setToolbarTitle(title) {
	return {
		type: SET_TITLE,
		title
	};
}
