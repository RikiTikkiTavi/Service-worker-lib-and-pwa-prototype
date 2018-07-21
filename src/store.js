import { compose, createStore, applyMiddleware, combineReducers } from 'redux';
import { createLogger } from 'redux-logger';
import { routerReducer } from 'react-router-redux';
import { persistState } from 'redux-devtools';
import thunk from 'redux-thunk';
/*import serviceFull from './reducers/service-full';*/

const appReducers = combineReducers({
  /* main,
  humanResources,
  resources,
  orders,
  disposition, */
  routing: routerReducer
});

// middleware
const logger = createLogger();
const createStoreWithMiddleware = compose(
  applyMiddleware(thunk, logger),
  persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/)),
  window.devToolsExtension ? window.devToolsExtension() : f => f
)(createStore);

// store
const store = createStoreWithMiddleware(appReducers);

export default store;
