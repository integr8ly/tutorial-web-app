import { combineReducers } from 'redux';
import aboutModalReducers from './aboutModalReducers';
import userReducers from './userReducers';
import threadReducers from './threadReducers';

const reducers = {
  aboutModalReducers,
  threadReducers,
  userReducers
};

const reduxReducers = combineReducers(reducers);

export { reduxReducers as default, reduxReducers, aboutModalReducers, threadReducers, userReducers };
