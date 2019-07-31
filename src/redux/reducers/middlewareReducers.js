import { middlewareTypes } from '../constants';
import { FULFILLED_ACTION } from '../helpers';
import { SERVICE_TYPES } from '../constants/middlewareConstants';

const initialState = {
  middlewareServices: {
    error: false,
    errorStatus: null,
    errorMessage: null,
    pending: false,
    fulfilled: false,
    enmasseCredentials: {},
    amqCredentials: {},
    provisioningUser: null,
    data: {},
    customServices: {
      services: []
    }
  }
};

const middlewareReducers = (state = initialState, action) => {
  // Replacement for CREATE_WALKTHROUGH when services are not ServiceInstances,
  // this is more generic.
  if (action.type === FULFILLED_ACTION(middlewareTypes.PROVISION_SERVICE)) {
    if (!action.payload || !action.payload.name || !action.payload.status) {
      return state;
    }
    const currentSvcs = Object.assign({}, state.middlewareServices.data);
    currentSvcs[action.payload.name] = {
      type: SERVICE_TYPES.PROVISIONED_SERVICE,
      name: action.payload.name,
      url: action.payload.url,
      status: action.payload.status,
      extra: action.payload.extra || {}
    };
    return Object.assign({}, state, {
      middlewareServices: {
        ...state.middlewareServices,
        data: currentSvcs
      }
    });
  }
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
        amqCredentials: action.payload
      }
    });
  }

  if (action.type === FULFILLED_ACTION(middlewareTypes.GET_ENMASSE_CREDENTIALS)) {
    return Object.assign({}, state, {
      middlewareServices: {
        ...state.middlewareServices,
        enmasseCredentials: {
          username: action.payload.username,
          password: action.payload.password,
          url: action.payload.url
        }
      }
    });
  }
  if (action.type === FULFILLED_ACTION(middlewareTypes.GET_PROVISIONING_USER)) {
    return Object.assign({}, state, {
      middlewareServices: {
        ...state.middlewareServices,
        provisioningUser: action.payload.provisioningUser
      }
    });
  }

  if (action.type === FULFILLED_ACTION(middlewareTypes.GET_CUSTOM_CONFIG)) {
    return Object.assign({}, state, {
      middlewareServices: {
        ...state.middlewareServices,
        customServices: action.payload
      }
    });
  }
  return state;
};

middlewareReducers.initialState = initialState;

export { middlewareReducers as default, middlewareReducers, initialState };
