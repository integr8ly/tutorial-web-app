import { combineReducers } from 'redux';
import aboutModalReducers from './aboutModalReducers';
import userReducers from './userReducers';

const reducers = {
  aboutModal: aboutModalReducers,
  user: userReducers
};

const reduxReducers = combineReducers(reducers);

export { reduxReducers as default, reduxReducers, aboutModalReducers, userReducers };
