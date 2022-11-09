import FuseUtils from '@fuse/utils';
import AppContext from 'app/AppContext';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { matchRoutes } from 'react-router-config';
import { withRouter } from 'react-router-dom';
import navigationConfig from '../../../app/fuse-configs/navigationConfig';

class FuseAuthorization extends Component {
	constructor(props, context) {
		super(props);
		const { routes } = context;
		this.state = {
			accessGranted: true,
			routes
		};
	}

	componentDidMount() {
		const { location, history, userRole } = this.props;

		if (userRole.length > 0 && location.pathname === '/') {
			history.push({
				pathname: this.getFirstAvailableUrl() ?? '/'
			});
		}

		if (!this.state.accessGranted) {
			this.redirectRoute();
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		return nextState.accessGranted !== this.state.accessGranted;
	}

	componentDidUpdate() {
		if (!this.state.accessGranted) {
			this.redirectRoute();
		}
	}

	static getDerivedStateFromProps(props, state) {
		const { location, userRole } = props;
		const { pathname } = location;

		const matched = matchRoutes(state.routes, pathname);

		return {
			accessGranted: matched ? matched.every(item => FuseUtils.hasPermission(item.route.auth, userRole)) : true
		};
	}

	getFirstAvailableUrl() {
		const { userRole } = this.props;

		return navigationConfig.find(({ auth }) => FuseUtils.hasPermission(auth, userRole))?.url ?? null;
	}

	redirectRoute() {
		const { location, userRole, history } = this.props;
		const { pathname, state } = location;
		let redirectUrl;

		if (location.pathname === '/login') {
			const firstAvailableUrl = this.getFirstAvailableUrl();

			redirectUrl = firstAvailableUrl ?? '/error-404';
		} else if (state?.redirectUrl !== '/') {
			redirectUrl = state?.redirectUrl ?? '/';
		}

		/*
        User is guest
        Redirect to Login Page
        */
		if (!userRole || userRole.length === 0) {
			history.push({
				pathname: '/login',
				state: { redirectUrl: pathname }
			});
		} else {
			/*
        User is member
        User must be on unAuthorized page or just logged in
        Redirect to dashboard or redirectUrl
        */
			history.push({
				pathname: redirectUrl
			});
		}
	}

	render() {
		// console.info('Fuse Authorization rendered', accessGranted);
		return this.state.accessGranted ? <>{this.props.children}</> : null;
	}
}

function mapStateToProps({ auth }) {
	return {
		userRole: auth.user.role
	};
}

FuseAuthorization.contextType = AppContext;

export default withRouter(connect(mapStateToProps)(FuseAuthorization));
