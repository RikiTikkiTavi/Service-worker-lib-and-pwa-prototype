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

    async getObjectFromLocalStorage(keyName){
        let LS = window.localStorage;
        let ObjJSON = LS.getItem(keyName)
        if(ObjJSON!==null) {
          let Obj = await JSON.parse(ObjJSON)
          return Obj
        }
        return ObjJSON
    }

    addUpdateProps(object, ids){
        for (let i in ids){
            object[ids[i]]['isUpdated']=1;
        }
        return object
    }

    async handleAdacApiModelFetchSuccess(model, update) {
        let AdacApiModelJSON = model.toJSON();

        let categories;
        let cat_q=0;
        let categoriesUpdates = await this.getObjectFromLocalStorage("categories");
        if(categoriesUpdates!==null) {
            categories = this.addUpdateProps(AdacApiModelJSON.categories, categoriesUpdates["upIDs"]);
            cat_q = categoriesUpdates["upIDs"].length;
        } else {
            categories = AdacApiModelJSON.categories
        }
        /*if(update){
            let categoriesUpdates = await this.getObjectFromLocalStorage("categories");
            categories = this.addUpdateProps(AdacApiModelJSON.categories, categoriesUpdates["upIDs"]);
            cat_q = categoriesUpdates["upIDs"].length;
        } else {

        }*/



        let CATEGORIES = {
            elements: categories,
            updatedElementsQuantity: cat_q
        };

        this.setState({CATEGORIES: CATEGORIES, loading: false});
    }

    handleAdacApiModelFetchError(model, response, options) {
        console.warn("MODEL", model);
        console.warn("RESPONSE", response);
        console.warn("OPTIONS", options);
        alert("Can't load content. This page is not available.")
    }

    async handleUpdatedElementView(keyName, id){
        let stateKeyName = keyName.toUpperCase();
        let obj = this.state[stateKeyName];

        // Check if element has dot
        let hasDot = obj.elements[id]["isUpdated"] === 1;

        if (hasDot) {
            //Update state
            obj.elements[id]["isUpdated"] = 0;
            obj.updatedElementsQuantity -= 1;
            this.setState({[stateKeyName]: obj});

            //Update local storage
            setTimeout(async () => {
                let lsObj = await this.getObjectFromLocalStorage(keyName);
                let index = lsObj.upIDs.indexOf(id);
                lsObj.upIDs.splice(index, 1);
                lsObj.quantity -= 1;
                window.localStorage.setItem(keyName, JSON.stringify(lsObj));
            }, 200)
        }
    }

    fetchAdacApi(update){
        const AdacApiModel = newAdacApiModel();
        AdacApiModel.fetch({
            headers: {
                'Authorization': 'Basic cnNtOnJzbTIwMTc='
            },
            success: (model) => this.handleAdacApiModelFetchSuccess(model, update),
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

