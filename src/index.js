/* eslint-disable import/first */
import React, {Component, Fragment} from 'react';
import ReactDOM from 'react-dom';

import {Provider} from 'react-redux';
import {Route} from 'react-router';
import store from './store';

import Services from './components/ServiceList';
import ServiceFull from './components/ServiceFull';
import Header from './components/Header'

import 'bootstrap/dist/css/bootstrap.css';
import 'jquery/dist/jquery.min';
import 'bootstrap/dist/js/bootstrap.min';

import './styles/index.css';
import BrowserRouter from 'react-router-dom/es/Router';
import createBrowserHistory from 'history/createBrowserHistory'
import registerServiceWorker from './registerServiceWorker';
const newHistory = createBrowserHistory();

import  {newServiceCollection} from './models'

class Root extends Component {

	constructor(props) {
		super(props);
		this.state = {
			SERVICES: [],
			loading: true
		};
	}

	handleServiceCollectionFetchSuccess(collection){
		let SERVICES = collection.toJSON();
		this.setState({SERVICES: SERVICES, loading: false});
	}

	handleServiceCollectionFetchError(collection, response, options){
		console.warn("COLLECTION", collection);
		console.warn("RESPONSE", response);
		console.warn("OPTIONS", options);
		alert("Can't load content. This page is not available.")
	}

	componentDidMount() {
		const ServiceCollection = newServiceCollection();
		ServiceCollection.fetch({
			success: (collection) => this.handleServiceCollectionFetchSuccess(collection),
			error: (collection, response, options) =>
				this.handleServiceCollectionFetchError(collection, response, options),
		})
	}

	render() {
		const {loading, SERVICES} = this.state;
		return (
			<Provider store={store}>
				<BrowserRouter history={newHistory}>
					<Fragment>
						<Header/>
						<Route exact={true}
						       path="/services"
						       render={() => <Services loading={loading} services={SERVICES}/>}
						/>
						<Route exact={true}
						       path="/services/:id"
						       render={(props) => <ServiceFull {...props} loading={loading} services={SERVICES}/>}
						/>
					</Fragment>
				</BrowserRouter>
			</Provider>
		);
	}
}

ReactDOM.render(<Root/>, document.getElementById('root'));

registerServiceWorker();
