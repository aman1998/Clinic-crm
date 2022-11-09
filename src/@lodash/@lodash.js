import __ from 'lodash';

/**
 * You can extend Lodash with mixins
 * And use it as below
 * import _ from '@lodash'
 * @deprecated
 */
const _ = __.runInContext();

_.mixin({
	/**
	 * Immutable Set for setting state
	 * @deprecated
	 */
	setIn: (state, name, value) => {
		return _.setWith(_.clone(state), name, value, _.clone);
	}
});

export default _;
