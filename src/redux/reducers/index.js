import { combineReducers } from 'redux';
import aboutModalReducers from './aboutModalReducers';
import userReducers from './userReducers';
import threadReducers from './threadReducers';
import middlewareReducers from './middlewareReducers';
import walkthroughServiceReducers from './walkthroughServiceReducers';

const reducers = {
  aboutModalReducers,
  threadReducers,
  userReducers,
  middlewareReducers,
  walkthroughServiceReducers
};

const reduxReducers = combineReducers(reducers);

export {
  reduxReducers as default,
  reduxReducers,
  aboutModalReducers,
  threadReducers,
  userReducers,
  middlewareReducers,
  walkthroughServiceReducers
};
