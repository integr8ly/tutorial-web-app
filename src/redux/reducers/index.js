import { combineReducers } from 'redux';
import aboutModalReducers from './aboutModalReducers';
import userReducers from './userReducers';
import threadReducers from './threadReducers';
import middlewareReducers from './middlewareReducers';
import walkthroughReducers from './walkthroughReducers';

const reducers = {
  aboutModalReducers,
  threadReducers,
  userReducers,
  middlewareReducers,
  walkthroughReducers
};

const reduxReducers = combineReducers(reducers);

export {
  reduxReducers as default,
  reduxReducers,
  aboutModalReducers,
  threadReducers,
  userReducers,
  middlewareReducers,
  walkthroughReducers
};
