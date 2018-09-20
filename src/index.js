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

import {
    updateRootState,
    handleInstallationComplete,
    displayNotification,
    swAddMsgMessageListener,
    triggerCacheUpdateCheckOnDOMUpdate
} from './index-functions'

import {newAdacApiModel} from './models'

class Root extends Component {

    constructor(props) {
        super(props);
        this.state = {
            CATEGORIES: {},
            SERVICES: [],
            loading: true
        };
    }

    handleAdacApiModelFetchSuccess(model) {
        let AdacApiModelJSON = model.toJSON();
        let updatedElementsQuantity = AdacApiModelJSON.categories['updatedElementsQuantity'];
        delete AdacApiModelJSON.categories['updatedElementsQuantity'];

        let CATEGORIES = {
            elements: AdacApiModelJSON.categories,
            updatedElementsQuantity: updatedElementsQuantity
        };

        this.setState({CATEGORIES: CATEGORIES, loading: false});
    }

    handleAdacApiModelFetchError(model, response, options) {
        console.warn("MODEL", model);
        console.warn("RESPONSE", response);
        console.warn("OPTIONS", options);
        alert("Can't load content. This page is not available.")
    }

    fetchAdacApi(){
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

    componentDidMount() {
        this.fetchAdacApi()
    }

    render() {
        const {loading, CATEGORIES} = this.state;
        return (
            <Provider store={store}>
                <BrowserRouter history={newHistory}>
                    <Fragment>
                        <Header/>
                        <div className='container'>
                            <UpdateButton/>
                        </div>
                        <Route exact={true}
                               path="/categories"
                               render={
                                   () => <Categories loading={loading}
                                                     CATEGORIES={CATEGORIES} />
                               }
                        />
                        <Route exact={true}
                               path="/categories/:id"
                               render={
                                   (props) => <CategoryFull {...props}
                                                            loading={loading}
                                                            CATEGORIES={CATEGORIES} />
                               }
                        />
                    </Fragment>
                </BrowserRouter>
            </Provider>
        );
    }
}

ReactDOM.render(
    <Root ref={(rootComponent) => {
        window.rootComponent = rootComponent
    }}/>,
    document.getElementById('root')
);

registerServiceWorker(handleInstallationComplete);
swAddMsgMessageListener();
triggerCacheUpdateCheckOnDOMUpdate(newHistory);

