/* eslint-disable import/first */
import React, {Component, Fragment} from 'react';
import ReactDOM from 'react-dom';

import {Provider} from 'react-redux';
import {Route} from 'react-router';
import store from './store';

import Services from './components/ServiceList';
import ServiceFull from './components/ServiceFull';

import 'bootstrap/dist/css/bootstrap.css';
import 'jquery/dist/jquery.min';
import 'bootstrap/dist/js/bootstrap.min';

import './styles/index.css';
import BrowserRouter from 'react-router-dom/es/Router';
import createBrowserHistory from 'history/createBrowserHistory'

const newHistory = createBrowserHistory();
import registerServiceWorker from './registerServiceWorker';

class Root extends Component {
	render() {
		return (
			<Provider store={store}>
				<BrowserRouter history={newHistory}>
					<Fragment>
						<Route exact={true} path="/services" component={Services}/>
						<Route exact={true} path="/services/:id" component={ServiceFull}/>
					</Fragment>
				</BrowserRouter>
			</Provider>
		);
	}
}

ReactDOM.render(<Root/>, document.getElementById('root'));

/**
 * For serviceworker debugging run a chrome instance like the following command
 * chromium-browser --user-data-dir=/tmp/foo --unsafely-treat-insecure-origin-as-secure=http://localhost:3003
 *
 */
registerServiceWorker();
