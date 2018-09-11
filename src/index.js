/* eslint-disable import/first */
import React, {Component, Fragment} from 'react';
import ReactDOM from 'react-dom';

import {Provider} from 'react-redux';
import {Route} from 'react-router';
import store from './store';

import Services from './components/ServiceList';
import ServiceFull from './components/ServiceFull';
import Categories from './components/CategoryList';
import CategoryFull from './components/CategoryFull';
import Header from './components/Header'
import UpdateButton from './components/UpdateButton'

import 'bootstrap/dist/css/bootstrap.css';
import 'jquery/dist/jquery.min';
import 'bootstrap/dist/js/bootstrap.min';

import './styles/index.css';
import BrowserRouter from 'react-router-dom/es/Router';
import createBrowserHistory from 'history/createBrowserHistory'
import registerServiceWorker from './registerServiceWorker';

const newHistory = createBrowserHistory();

import {newServiceCollection, newAdacApiModel} from './models'

class Root extends Component {

	constructor(props) {
		super(props);
		this.state = {
			CATEGORIES: {},
			SERVICES: [],
			loading: true
		};
	}

	handleServiceCollectionFetchSuccess(collection) {
		let SERVICES = collection.toJSON();
		this.setState({SERVICES: SERVICES});
	}

	handleServiceCollectionFetchError(collection, response, options) {
		console.warn("COLLECTION", collection);
		console.warn("RESPONSE", response);
		console.warn("OPTIONS", options);
		alert("Can't load content. This page is not available.")
	}

	handleAdacApiModelFetchSuccess(model) {
		let AdacApiModelJSON = model.toJSON();
		let categories = AdacApiModelJSON.categories;
		this.setState({categories: categories, loading: false});
	}

	handleAdacApiModelFetchError(model, response, options) {
		console.warn("MODEL", model);
		console.warn("RESPONSE", response);
		console.warn("OPTIONS", options);
		alert("Can't load content. This page is not available.")
	}

	componentDidMount() {
/*		const ServiceCollection = newServiceCollection();
		ServiceCollection.fetch({
			success: (collection) => this.handleServiceCollectionFetchSuccess(collection),
			error: (collection, response, options) =>
				this.handleServiceCollectionFetchError(collection, response, options),
		});*/
		const AdacApiModel = newAdacApiModel();
		AdacApiModel.fetch({
			headers: {
				'Authorization': 'Basic cnNtOnJzbTIwMTc='
			},
			success: (model) => this.handleAdacApiModelFetchSuccess(model),
			error: (model, response, options) =>
				this.handleAdacApiModelFetchError(model, response, options),
		})
	}

	render() {
		const {loading, SERVICES, categories} = this.state;
		return (
			<Provider store={store}>
				<BrowserRouter history={newHistory}>
					<Fragment>
						<Header/>
						<div className='container'>
							<UpdateButton/>
						</div>
						{/*<Route exact={true}
						       path="/services"
						       render={() => <Services loading={loading}
						                               services={SERVICES}
						       />}
						/>
						<Route exact={true}
						       path="/services/:id"
						       render={(props) => <ServiceFull {...props}
						                                       loading={loading}
						                                       services={SERVICES}
						       />}
						/>*/}
						<Route exact={true}
						       path="/categories"
						       render={
							       () => <Categories loading={loading}
							                         categories={categories}
							       />
						       }
						/>
						<Route exact={true}
						       path="/categories/:id"
						       render={
							       (props) => <CategoryFull {...props}
							                           loading={loading}
							                           categories={categories}
							       />
						       }
						/>
					</Fragment>
				</BrowserRouter>
			</Provider>
		);
	}
}

ReactDOM.render(<Root/>, document.getElementById('root'));

function handleInstallationComplete(){
    alert("SW Installation completed. App will be restarted to activate PWA potential.")
    location.reload()
}

registerServiceWorker(handleInstallationComplete);

function displayNotification(data, options) {
	if (Notification.permission === 'granted') {
		navigator.serviceWorker.getRegistration().then(function(reg) {
			reg.showNotification(data.msg, options);
		});
	}
}

navigator.serviceWorker.addEventListener('message', event => {
	console.log("RECEIVED MESSAGE", event.data);
	displayNotification(event.data.msg);
});

newHistory.listen((location, action) => {
	// Trigger cache update check
	fetch('/update-caches');
});

