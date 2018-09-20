import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import reduxMiddleware from './middleware';
import reduxReducers from './reducers';

const middleware = [thunkMiddleware, reduxMiddleware.status(), promiseMiddleware()];

if (process.env.NODE_ENV !== 'production' && process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true') {
  middleware.push(createLogger());
}

const store = createStore(reduxReducers, applyMiddleware(...middleware));

export default store;
