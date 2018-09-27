import { middlewareTypes } from '../constants';
import { FULFILLED_ACTION } from '../helpers';

const initialState = {
  middlewareServices: {
    error: false,
    errorStatus: null,
    errorMessage: null,
    pending: false,
    fulfilled: false,
    amqCredentials: {},
    data: {}
  }
};

const middlewareReducers = (state = initialState, action) => {
  if (action.type === FULFILLED_ACTION(middlewareTypes.CREATE_WALKTHROUGH)) {
    const createData = Object.assign({}, state.middlewareServices.data);
    createData[action.payload.spec.clusterServiceClassExternalName] = action.payload;
    return Object.assign({}, state, {
      middlewareServices: {
        ...state.middlewareServices,
        data: createData
      }
    });
  }
  if (action.type === FULFILLED_ACTION(middlewareTypes.REMOVE_WALKTHROUGH)) {
    const removeData = Object.assign({}, state.middlewareServices.data);
    delete removeData[action.payload.spec.clusterServiceClassExternalName];
    return Object.assign({}, state, {
      middlewareServices: {
        ...state.middlewareServices,
        data: removeData
      }
    });
  }
  if (action.type === FULFILLED_ACTION(middlewareTypes.GET_AMQ_CREDENTIALS)) {
    return Object.assign({}, state, {
      middlewareServices: {
        ...state.middlewareServices,
        amqCredentials: {
          username: action.payload.username,
          password: action.payload.password
        }
      }
    });
  }
  return state;
};

middlewareReducers.initialState = initialState;

export { middlewareReducers as default, middlewareReducers, initialState };
