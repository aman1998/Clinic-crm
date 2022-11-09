import MomentUtils from '@date-io/moment';
import moment from 'moment';
import 'moment/locale/ru';
import '@fake-db';
import { QueryClient, QueryClientProvider } from 'react-query';
import FuseAuthorization from '@fuse/core/FuseAuthorization';
import FuseLayout from '@fuse/core/FuseLayout';
import FuseTheme from '@fuse/core/FuseTheme';
import history from '@history';
import { hot } from 'react-hot-loader/root';
import { createGenerateClassName, jssPreset, StylesProvider } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { create } from 'jss';
import jssExtend from 'jss-plugin-extend';
import rtl from 'jss-rtl';
import React from 'react';
import Provider from 'react-redux/es/components/Provider';
import { Router } from 'react-router-dom';
import { ToastContainer } from './common/ToastContainer';
import AppContext from './AppContext';
import { Auth } from './auth';
import routes from './fuse-configs/routesConfig';
import store from './store';
import 'react-image-lightbox/style.css';
import 'react-toastify/dist/ReactToastify.css';
import { SubscribeNotifications } from './common/Notifications/SubscribeNotifications';
import { ErrorBoundary } from './common/ErrorBoundary';
import { CallNotification } from './common/CallNotification/CallNotification';
import { ModalPromiseContainer } from './common/ModalPromise';
import { toBoolean } from './utils';

const jss = create({
	...jssPreset(),
	plugins: [...jssPreset().plugins, jssExtend(), rtl()],
	insertionPoint: document.getElementById('jss-insertion-point')
});

moment.locale('ru');

const generateClassName = createGenerateClassName();

const prefetchOnWindowFocus = process.env.REACT_APP_REFETCH_ON_WINDOW_FOCUS;
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: { true: true, false: false, always: 'always' }[prefetchOnWindowFocus]
		}
	}
});

const isEnableNotification = toBoolean(process.env.REACT_APP_ENABLE_NOTIFICATION);
const isEnableCallNotification = toBoolean(process.env.REACT_APP_ENABLE_CALL_NOTIFICATION);

const App = () => {
	return (
		<AppContext.Provider
			value={{
				routes
			}}
		>
			<StylesProvider jss={jss} generateClassName={generateClassName}>
				<QueryClientProvider client={queryClient}>
					<Provider store={store}>
						<MuiPickersUtilsProvider utils={MomentUtils}>
							<ErrorBoundary>
								<Auth>
									<Router history={history}>
										<FuseAuthorization>
											<FuseTheme>
												<ModalPromiseContainer />
												<ToastContainer />
												{isEnableNotification && <SubscribeNotifications />}
												<FuseLayout />
												{isEnableCallNotification && <CallNotification />}
											</FuseTheme>
										</FuseAuthorization>
									</Router>
								</Auth>
							</ErrorBoundary>
						</MuiPickersUtilsProvider>
					</Provider>
				</QueryClientProvider>
			</StylesProvider>
		</AppContext.Provider>
	);
};

export default hot(App);
