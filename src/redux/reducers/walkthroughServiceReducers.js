import { setStateProp, PENDING_ACTION, REJECTED_ACTION, FULFILLED_ACTION } from '../helpers';
import { walkthroughTypes, walkthroughServiceTypes } from '../constants';
import { buildNamespacedServiceInstanceName } from '../../common/openshiftHelpers';

const initialState = {
  walkthroughServices: {
    error: false,
    errorStatus: null,
    errorMessage: null,
    pending: false,
    fulfilled: false,
    data: [],
    services: {}
  },
  walkthroughResources: {}
};

const walkthroughServiceReducers = (state = initialState, action) => {
  let createData;
  let siName;

  if (action.type === FULFILLED_ACTION(walkthroughServiceTypes.ADD_RESOURCE)) {
    const addResources = Object.assign({}, state.walkthroughResources);
    if (!addResources[action.payload.id]) {
      addResources[action.payload.id] = {};
    }
    addResources[action.payload.id][action.payload.resource.metadata.name] = action.payload.resource;
    return setStateProp('walkthroughResources', addResources, {
      state,
      initialState
    });
  }
  if (action.type === FULFILLED_ACTION(walkthroughServiceTypes.REMOVE_RESOURCE)) {
    const removeResources = Object.assign({}, state.walkthroughResources);
    delete removeResources[action.payload.metadata.name];
    return setStateProp('walkthroughResources', removeResources, {
      state,
      initialState
    });
  }

  switch (action.type) {
    // Error/Rejected
    case REJECTED_ACTION(walkthroughTypes.GET_WALKTHROUGH):
    case REJECTED_ACTION(walkthroughTypes.GET_WALKTHROUGHS):
      return setStateProp(
        'walkthroughServices',
        {
          error: action.error,
          errorMessage: action.payload.message
        },
        {
          state,
          initialState
        }
      );

    // Loading/Pending
    case PENDING_ACTION(walkthroughTypes.GET_WALKTHROUGH):
    case PENDING_ACTION(walkthroughTypes.GET_WALKTHROUGHS):
      return setStateProp(
        'walkthroughServices',
        {
          pending: true
        },
        {
          state,
          initialState
        }
      );

    // Success/Fulfilled
    case FULFILLED_ACTION(walkthroughTypes.GET_WALKTHROUGH):
    case FULFILLED_ACTION(walkthroughTypes.GET_WALKTHROUGHS):
      return setStateProp(
        'walkthroughServices',
        {
          pending: false,
          fulfilled: true,
          data: action.payload.data
        },
        {
          state,
          initialState
        }
      );

    case FULFILLED_ACTION(walkthroughTypes.GET_WALKTHROUGH_SERVICE):
      createData = Object.assign({}, state.walkthroughServices.services);
      siName = buildNamespacedServiceInstanceName(action.payload.prefix, action.payload.data);
      createData[siName] = action.payload.data;
      return Object.assign({}, state, {
        walkthroughServices: {
          ...state.walkthroughServices,
          services: createData
        }
      });

    default:
      return state;
  }
};

walkthroughServiceReducers.initialState = initialState;

export { walkthroughServiceReducers as default, walkthroughServiceReducers, initialState };
